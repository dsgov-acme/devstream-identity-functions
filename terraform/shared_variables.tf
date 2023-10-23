variable "project" {
  description = "GCP project ID"
  type        = string
}

variable "project_prefix" {
  type = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "environment" {
  description = "Logical environment name"
  type        = string
}

variable "user_management_base_url" {
  description = "Base URL for user management API clients."
  type        = string
}
