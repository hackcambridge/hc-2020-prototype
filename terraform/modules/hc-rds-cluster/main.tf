resource "aws_rds_cluster" "cluster" {
  cluster_identifier     = "${var.cluster_name}"
  database_name          = var.name
  master_username        = var.DB_USERNAME
  master_password        = var.DB_PASSWORD
  vpc_security_group_ids = ["${aws_security_group.aurora-security-group.id}"]
  skip_final_snapshot    = true
}
