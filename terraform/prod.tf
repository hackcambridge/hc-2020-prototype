resource "aws_autoscaling_group" "front-end-prod" {
  availability_zones = ["eu-west-2a", "eu-west-2b"]
  min_size           = 1
  max_size           = 2
  desired_capacity   = 2
  # asg_recreate_on_change = false
  launch_template {
    id      = "${aws_launch_template.hc-instance-prod.id}"
    version = "$Latest"
  }
}

resource "aws_lb" "front-end-lb-prod" {
  name                             = "front-end-lb-prod"
  internal                         = false
  load_balancer_type               = "application"
  subnets                          = ["${aws_default_subnet.default_A.id}", "${aws_default_subnet.default_B.id}"]
  enable_cross_zone_load_balancing = true
}

resource "aws_lb_target_group" "front-end-lb-target-group-prod" {
  name                 = "front-end-lb-target-group-prod"
  port                 = "80"
  protocol             = "HTTP"
  vpc_id               = "${aws_default_vpc.default.id}"
  deregistration_delay = 30

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 3600
    enabled         = true
  }

  # health_check {
  #   healthy_threshold = 2
  #   unhealthy_threshold = 2
  #   timeout = 3
  #   protocol = "TCP"
  #   port = 80
  #   interval = 10
  # }
}

resource "aws_alb_listener" "front_end-lb-listener-prod" {
  load_balancer_arn = "${aws_lb.front-end-lb-prod.arn}"
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = "${aws_lb_target_group.front-end-lb-target-group-prod.arn}"
    type             = "forward"
  }
}

resource "aws_lb_listener" "front_end-https-lb-listener-prod" {
  load_balancer_arn = "${aws_lb.front-end-lb-prod.arn}"
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:eu-west-2:987408907490:certificate/b9b6c6fe-0adc-4541-8b20-50a74cb8169b"

  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.front-end-lb-target-group-prod.arn}"
  }
}

resource "aws_autoscaling_attachment" "front-end-lb-autoscaling-prod" {
  alb_target_group_arn   = "${aws_lb_target_group.front-end-lb-target-group-prod.arn}"
  autoscaling_group_name = "${aws_autoscaling_group.front-end-prod.id}"
}

data "template_file" "user_data-prod" {
  template = "${file("init-script.tpl")}"
  vars = {
    APP_URL               = "${var.APP_URL_PROD}"
    DB_HOST               = "${var.DB_HOST}"
    DB_DATABASE           = "${var.DB_DATABASE}"
    DB_USERNAME           = "${var.DB_USERNAME}"
    DB_PASSWORD           = "${var.DB_PASSWORD}"
    AWS_ACCESS_KEY_ID     = "${var.AWS_ACCESS_KEY_ID}"
    AWS_SECRET_ACCESS_KEY = "${var.AWS_SECRET_ACCESS_KEY}"
    AWS_BUCKET            = "${var.AWS_BUCKET}"
    AUTH0_DOMAIN          = "${var.AUTH0_DOMAIN}"
    AUTH0_CLIENT_ID       = "${var.AUTH0_CLIENT_ID}"
    AUTH0_CLIENT_SECRET   = "${var.AUTH0_CLIENT_SECRET}"
  }
}

resource "aws_launch_template" "hc-instance-prod" {
  name_prefix            = "hc-instance-prod"
  image_id               = "ami-040eaa068dbe2517d"
  instance_type          = "t2.micro"
  key_name               = "Default"
  vpc_security_group_ids = ["${aws_security_group.hc-sg-web.id}"]
  lifecycle {
    create_before_destroy = true
  }
  iam_instance_profile {
    name = "CodeDeployAgentRole"
  }
  user_data = "${base64encode(data.template_file.user_data-prod.rendered)}"
}

output "lb-domain-prod" {
  value = aws_lb.front-end-lb-prod.dns_name
}
