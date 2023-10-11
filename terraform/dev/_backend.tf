terraform {
  backend "gcs" {
    bucket = "devstream-1a70-tfstate"
    prefix = "identity-functions/dev"
  }
}
