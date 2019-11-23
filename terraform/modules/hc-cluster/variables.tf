variable "min_size" {
  description = "The minimum number of instances in the cluster"
  default     = "1"
}

variable "desired_capacity" {
  description = "The desired number of instances in the cluster"
  default     = "2"
}

variable "launch_template" {
  description = "The launch template for the autoscaling group"
  default     = ""
}

variable "name" {
  description = "The name to give all components in the cluster"
  default     = ""
}

variable "vpc" {
  description = "The VPC for the cluster to exist in"
  default     = ""
}

variable "subnets" {
  description = "List of subnets that the instances will exist in"
  default     = ""
}
