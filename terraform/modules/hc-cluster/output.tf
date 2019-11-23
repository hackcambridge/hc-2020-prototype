output "domain-name" {
  value = aws_lb.hc-load_balancer.dns_name
}
