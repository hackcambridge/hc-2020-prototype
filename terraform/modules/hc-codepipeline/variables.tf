
variable "artifacts_bucket_name" {
  description = "The name of the artifacts bucket for the CodePipeline"
  default     = ""
}

variable "codebuild" {
  description = "The name of the CodeBuild AWS instance"
  default     = ""
}

variable "env" {
  description = "The environment configuration to pass to the CodeBuild instance"
  default     = ""
}

variable "name" {
  description = "The name to give to the CodeBuild instance"
  default     = ""
}

variable "static_web_bucket_name" {
  description = "The name of the static web bucket where we store previous deployments"
  default     = ""
}

variable "repository_branch" {
  description = "The branch of the repository where the code is stored"
  default     = ""
}

variable "repository_owner" {
  description = "The owner of the repository where the code is stored"
  default     = ""
}

variable "repository_name" {
  description = "The name branch of the repository where the code is stored"
  default     = ""
}
