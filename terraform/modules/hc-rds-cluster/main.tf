resource "aws_rds_cluster" "hc-rds-cluster" {
  cluster_identifier     = var.name
  database_name          = var.database_name
  master_username        = var.DB_USERNAME
  master_password        = var.DB_PASSWORD
  vpc_security_group_ids = [var.security_group]
  skip_final_snapshot    = true
}
