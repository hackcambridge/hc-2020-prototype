resource "aws_rds_cluster" "cluster" {
  cluster_identifier     = var.vpc
  database_name          = var.name
  master_username        = var.DB_USERNAME
  master_password        = var.DB_PASSWORD
  vpc_security_group_ids = [var.security_group]
  skip_final_snapshot    = true
}
