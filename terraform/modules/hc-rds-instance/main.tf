resource "aws_rds_cluster_instance" "hc-rds-cluster-instance" {
  identifier         = var.name
  cluster_identifier = var.cluster_id
  instance_class     = var.instance_class
}
