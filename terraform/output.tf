output "prod-domain-name" {
  value = module.hc-prod-cluster.domain-name
}

output "staging-domain-name" {
  value = module.hc-staging-cluster.domain-name
}

output "rds-domain-name" {
  value = module.hc-rds-cluster.endpoint
}
