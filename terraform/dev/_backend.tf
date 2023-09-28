terraform {
  backend "gcs" {
    bucket = "devstream-tfstate"
    prefix = "identity-functions/dev"
  }
}
