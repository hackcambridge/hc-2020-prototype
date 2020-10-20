resource "aws_rds_cluster_instance" "cluster_instances" {
#   identifier         = "${var.cluster_name}-instance"
  identifier         = var.name
  cluster_identifier = var.cluster_id
  instance_class     = var.instance_class
}
