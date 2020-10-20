resource "aws_rds_cluster_instance" "cluster_instances" {
  name               = var.name
#   identifier         = "${var.cluster_name}-instance"
  cluster_identifier = "${aws_rds_cluster.cluster.id}"
  instance_class     = var.instance_class
}
