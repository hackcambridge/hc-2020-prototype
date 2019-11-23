output "prod-domain-name" {
  value = module.hc-prod-cluster.domain-name
}

output "staging-domain-name" {
  value = module.hc-staging-cluster.domain-name
}
