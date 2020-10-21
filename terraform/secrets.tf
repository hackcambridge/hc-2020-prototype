# variable "DB_HOST" {
#   default = "127.0.0.1"
# }
variable "DB_DATABASE" {
  default = "homestead"
}
variable "DB_USERNAME" {
  default = "homestead"
}
variable "DB_PASSWORD" {
  default = "secret"
}
variable "AWS_ACCESS_KEY_ID" {
  default = ""
}
variable "AWS_SECRET_ACCESS_KEY" {
  default = ""
}
variable "STAGING_AWS_BUCKET" {
  default = ""
}
variable "PROD_AWS_BUCKET" {
  default = ""
}
variable "AUTH0_DOMAIN" {
  default = ""
}
variable "AUTH0_CLIENT_ID" {
  default = ""
}
variable "AUTH0_CLIENT_SECRET" {
  default = ""
}
variable "MAILGUN_SECRET" {
  default = ""
}
