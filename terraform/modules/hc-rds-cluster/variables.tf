variable "name" {
  description = "The name of the database cluster"
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
