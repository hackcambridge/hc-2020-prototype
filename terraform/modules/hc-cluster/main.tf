# -------------------------------
# ------------- ASG -------------
# -------------------------------

resource "aws_autoscaling_group" "hc-asg" {
  name               = var.name
  availability_zones = ["eu-west-2a", "eu-west-2b"]
  min_size           = var.min_size
  max_size           = var.desired_capacity
  desired_capacity   = var.desired_capacity

  launch_template {
    id      = var.launch_template
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = var.name
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_attachment" "hc-autoscaling_attachment" {
  alb_target_group_arn   = aws_lb_target_group.hc-load_balancer_target_group.arn
  autoscaling_group_name = aws_autoscaling_group.hc-asg.id
}

# -------------------------------
# -------- Load Balancer --------
# -------------------------------

resource "aws_lb" "hc-load_balancer" {
  name                             = "${var.name}-load-balancer"
  internal                         = false
  load_balancer_type               = "application"
  subnets                          = var.subnets
  enable_cross_zone_load_balancing = true
}

# -------------------------------
# --------- Target Group --------
# -------------------------------

resource "aws_lb_target_group" "hc-load_balancer_target_group" {
  name                 = "${var.name}-load-balancer-tg"
  port                 = "80"
  protocol             = "HTTP"
  vpc_id               = var.vpc
  deregistration_delay = 30

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 3600
    enabled         = true
  }

  health_check {
    healthy_threshold   = 2          # reduced from 5
    unhealthy_threshold = 2
    path                = "/health"
    timeout             = 5
    protocol            = "HTTP"
    interval            = 10         # reduced from 30
  }
}

# -------------------------------
# ---------- Listeners ----------
# -------------------------------

resource "aws_alb_listener" "hc-http_load_balancer_listener" {
  load_balancer_arn = aws_lb.hc-load_balancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.hc-load_balancer_target_group.arn
    type             = "forward"
  }
}

resource "aws_lb_listener" "hc-https_load_balancer_listener" {
  load_balancer_arn = aws_lb.hc-load_balancer.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:eu-west-2:987408907490:certificate/b9b6c6fe-0adc-4541-8b20-50a74cb8169b"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.hc-load_balancer_target_group.arn
  }
}
