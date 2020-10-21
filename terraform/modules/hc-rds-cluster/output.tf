output "endpoint" {
  description = "The RDS cluster endpoint"
  value       = aws_rds_cluster.hc-rds-cluster.endpoint
}

output "id" {
    description = "Cluster ID"
    value       = aws_rds_cluster.hc-rds-cluster.id
}
