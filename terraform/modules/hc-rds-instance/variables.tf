variable "instance_class" {
  default = "db.t2.small"
}

variable "name" {
  description = "The name of the database instance"
  default     = ""
} 

variable "cluster_id" {
  description = "The ID of the cluster the database belongs to"
  default     = ""
} 
