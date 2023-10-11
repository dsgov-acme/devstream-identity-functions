#=================DATA SOURCES=============#
data "google_service_account_access_token" "default" {
  provider               = google.impersonate
  target_service_account = local.terraform_sa_email
  scopes                 = ["userinfo-email", "cloud-platform"]
  lifetime               = "1800s"
}

#=================PROVIDERS=============#
provider "google" {
  access_token = data.google_service_account_access_token.default.access_token
  project      = var.project
  region       = var.region
}

provider "google" {
  alias = "impersonate"
}
