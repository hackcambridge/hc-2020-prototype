variable "name" {
  description = "The name of the database cluster"
  default     = ""
} 

variable "vpc" {
  description = "The VPC for the cluster to exist in"
  default     = ""
}

variable "security_group" {
  description = "The security group for the cluster"
  default     = ""
}

# --------------------------------------------
# Environment variables to set on the machines
# --------------------------------------------
variable "DB_USERNAME" {
  default = "homestead"
}
variable "DB_PASSWORD" {
  default = "secret"
}
