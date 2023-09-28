#=================DATA SOURCES=============#
data "google_service_account" "app_sa" {
  account_id = "devstream-app-sa"
}

data "archive_file" "code_archive" {
  type             = "zip"
  source_dir       = "${path.module}/../.."
  output_file_mode = "0666"
  output_path      = "app.zip"
  excludes         = [".gitignore", "dist", "node_modules", "post-deploy.js", "terraform", ".DS_Store"]
}

data "terraform_remote_state" "env" {
  backend = "gcs"

  config = {
    bucket = "devstream-tfstate"
    prefix = "${var.environment}"
  }
}

#=================RESOURCES================#
resource "random_string" "function-name" {
  length  = 5
  special = false

  # Adding the keepers block to trigger a random string generation
  # in order achieve a "rolling update" of the identity functions
  keepers = {
    bucket-md5hash = "${google_storage_bucket_object.code_archive.md5hash}"
  }
}

resource "google_storage_bucket" "artifact_bucket" {
  name     = "identity-functions-${var.environment}-devstream-dsgov-acme"
  location = var.region

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
}

resource "google_storage_bucket_object" "code_archive" {
  bucket = google_storage_bucket.artifact_bucket.name
  name   = "devstream-identity-functions/${var.environment}/app.zip"
  source = "${path.root}/app.zip"
}

resource "google_cloudfunctions_function" "gcip_before_create" {
  name                         = "gcip-before-create-${random_string.function-name.result}"
  description                  = "Manages Session Claims"
  project                      = var.project
  runtime                      = "nodejs16"
  region                       = var.region
  available_memory_mb          = 256
  source_archive_bucket        = google_storage_bucket.artifact_bucket.name
  source_archive_object        = "devstream-identity-functions/${var.environment}/app.zip"
  trigger_http                 = true
  entry_point                  = "beforeCreate"
  https_trigger_security_level = "SECURE_ALWAYS"
  service_account_email        = data.google_service_account.app_sa.email
  ingress_settings             = "ALLOW_ALL"
  environment_variables = {
    GCP_PROJECT              = var.project
    AGENCY_TENANT_ID         = split("/", data.terraform_remote_state.env.outputs.agency-portal-id)[3]
    PUBLIC_TENANT_ID         = split("/", data.terraform_remote_state.env.outputs.public-portal-id)[3]
    USER_MANAGEMENT_BASE_URL = var.user_management_base_url
  }
  secret_environment_variables {
    key        = "JWT_PRIVATE_KEY"
    project_id = var.project
    secret     = "devstream-self-signed-token-private-key"
    version    = "latest"
  }
  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.code_archive.md5hash
    ]
    create_before_destroy = true
  }
}

resource "google_cloudfunctions_function_iam_member" "gcip_before_create_invoker" {
  project        = google_cloudfunctions_function.gcip_before_create.project
  region         = google_cloudfunctions_function.gcip_before_create.region
  cloud_function = google_cloudfunctions_function.gcip_before_create.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
  depends_on = [
    google_storage_bucket_object.code_archive,
    google_cloudfunctions_function.gcip_before_create
  ]
  lifecycle {
    replace_triggered_by = [
      google_cloudfunctions_function.gcip_before_create,
      google_storage_bucket_object.code_archive.md5hash
    ]
    create_before_destroy = true
  }
}

resource "google_cloudfunctions_function" "gcip_before_signin" {
  name                         = "gcip-before-signin-${random_string.function-name.result}"
  description                  = "Manages Session Claims"
  project                      = var.project
  runtime                      = "nodejs16"
  region                       = var.region
  available_memory_mb          = 256
  source_archive_bucket        = google_storage_bucket.artifact_bucket.name
  source_archive_object        = "devstream-identity-functions/${var.environment}/app.zip"
  trigger_http                 = true
  entry_point                  = "beforeSignIn"
  https_trigger_security_level = "SECURE_ALWAYS"
  service_account_email        = data.google_service_account.app_sa.email
  ingress_settings             = "ALLOW_ALL"
  environment_variables = {
    GCP_PROJECT              = var.project
    AGENCY_TENANT_ID         = data.terraform_remote_state.env.outputs.agency-portal-id
    PUBLIC_TENANT_ID         = data.terraform_remote_state.env.outputs.public-portal-id
    USER_MANAGEMENT_BASE_URL = var.user_management_base_url
  }
  secret_environment_variables {
    key        = "JWT_PRIVATE_KEY"
    project_id = var.project
    secret     = "devstream-self-signed-token-private-key"
    version    = "latest"
  }
  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.code_archive.md5hash
    ]
    create_before_destroy = true
  }
}

resource "google_cloudfunctions_function_iam_member" "gcip_before_signin_invoker" {
  project        = google_cloudfunctions_function.gcip_before_signin.project
  region         = google_cloudfunctions_function.gcip_before_signin.region
  cloud_function = google_cloudfunctions_function.gcip_before_signin.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
  depends_on = [
    google_storage_bucket_object.code_archive,
    google_cloudfunctions_function.gcip_before_signin
  ]
  lifecycle {
    replace_triggered_by = [
      google_cloudfunctions_function.gcip_before_signin,
      google_storage_bucket_object.code_archive.md5hash
    ]
    create_before_destroy = true
  }
}

resource "null_resource" "update-idp-triggers" {
  triggers = {
    trigger = timestamp()
  }
  provisioner "local-exec" {
    command = "${path.module}/../script/update-idp-trigger.sh"
    environment = {
      BEFORE_CREATE_TRIGGER_URL = "${google_cloudfunctions_function.gcip_before_create.https_trigger_url}"
      BEFORE_SIGNIN_TRIGGER_URL = "${google_cloudfunctions_function.gcip_before_signin.https_trigger_url}"
      PROJECT_ID                = "${var.project}"
    }
  }
  depends_on = [
    google_cloudfunctions_function.gcip_before_create,
    google_cloudfunctions_function.gcip_before_signin,
  ]
}

resource "google_project_organization_policy" "allowed_member_domains" {
  project    = var.project
  constraint = "constraints/iam.allowedPolicyMemberDomains"

  list_policy {
    allow {
      all = true
    }
  }
}
