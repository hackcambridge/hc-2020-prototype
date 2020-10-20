variable "name" {
  description = "The name of the database cluster"
  default     = ""
} 

variable "database_name" {
  description = "The name of the database in the cluster"
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
