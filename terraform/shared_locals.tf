#=================LOCALS=================#
locals {
  terraform_sa_email = data.terraform_remote_state.bootstrap.outputs.terraform_sa_email
}

#=================DATA SOURCES=================#
data "terraform_remote_state" "bootstrap" {
  backend = "gcs"

  config = {
    bucket = "devstream-1a70-tfstate"
    prefix = "bootstrap"
  }
}
