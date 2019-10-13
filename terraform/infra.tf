provider "aws" {
  region = "eu-west-2"
}

data "template_file" "user_data" {
  template = <<EOF
  #!/bin/bash
sudo su
/opt/bitnami/ctlscript.sh stop
apt-get -y update
apt-get -y install ruby
apt-get -y install wget
cd /home/bitnami
wget https://aws-codedeploy-us-west-2.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto
exit
EOF
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
