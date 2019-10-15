provider "aws" {
  region = "eu-west-2"
}

data "template_file" "user_data" {
  template = "${file("init-script.tpl")}"
  vars = {
    APP_URL = "${var.APP_URL}"
    DB_HOST = "${var.DB_HOST}"
    DB_DATABASE = "${var.DB_DATABASE}"
    DB_USERNAME = "${var.DB_USERNAME}"
    DB_PASSWORD = "${var.DB_PASSWORD}"
    AWS_ACCESS_KEY_ID = "${var.AWS_ACCESS_KEY_ID}"
    AWS_SECRET_ACCESS_KEY = "${var.AWS_SECRET_ACCESS_KEY}"
    AWS_BUCKET = "${var.AWS_BUCKET}"
  }
}

resource "aws_launch_template" "hc-instance" {
  name_prefix = "hc-instance"
  image_id = "ami-040eaa068dbe2517d"
  instance_type = "t2.micro"
  key_name = "Default"
  vpc_security_group_ids = ["${aws_security_group.hc-sg-web.id}"]
  lifecycle {
    create_before_destroy = true
  }
  iam_instance_profile {
    name = "CodeDeployAgentRole"
  }
  user_data = "${base64encode(data.template_file.user_data.rendered)}"
}

resource "aws_autoscaling_group" "front-end" {
  availability_zones = ["eu-west-2a", "eu-west-2b"]
  min_size = 1
  max_size = 2
  desired_capacity = 2

  launch_template {
    id = "${aws_launch_template.hc-instance.id}"
    version = "$Latest"
  }
}

resource "aws_lb" "front-end-lb" {
  name = "front-end-lb"
  internal = false
  load_balancer_type = "network"
  subnets = ["${aws_default_subnet.default_A.id}", "${aws_default_subnet.default_B.id}"]
  enable_cross_zone_load_balancing = true
}

resource "aws_lb_target_group" "front-end-lb-target-group" {
  name = "front-end-lb-target-group"
  port = "80"
  protocol = "TCP"
  vpc_id = "${aws_default_vpc.default.id}"
  deregistration_delay = 30
}

resource "aws_alb_listener" "front_end-lb-listener" {
  load_balancer_arn = "${aws_lb.front-end-lb.arn}"
  port = 80
  protocol = "TCP"

  default_action {
    target_group_arn = "${aws_lb_target_group.front-end-lb-target-group.arn}"
    type= "forward"
  }
}

resource "aws_autoscaling_attachment" "front-end-lb-autoscaling" {
  alb_target_group_arn = "${aws_lb_target_group.front-end-lb-target-group.arn}"
  autoscaling_group_name = "${aws_autoscaling_group.front-end.id}"
}

output "lb-domain" {
  value = aws_lb.front-end-lb.dns_name
}
