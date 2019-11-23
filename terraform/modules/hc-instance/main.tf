data "template_file" "user_data" {
  template = "${file("init-script.tpl")}"
  vars = {
    APP_URL               = "${var.APP_URL}"
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

resource "aws_launch_template" "hc-instance" {
  name                   = var.name
  image_id               = "ami-040eaa068dbe2517d"
  instance_type          = var.instance_type
  key_name               = "Default"
  vpc_security_group_ids = ["${aws_security_group.hc-instance-security-group.id}"]
  lifecycle {
    create_before_destroy = true
  }
  iam_instance_profile {
    name = "CodeDeployAgentRole"
  }
  user_data = base64encode(data.template_file.user_data.rendered)
}

resource "aws_security_group" "hc-instance-security-group" {
  name        = "hc-instance-security-group"
  description = "Hack Cambridge Web Servers"
  vpc_id      = var.vpc

  ingress {
    # TLS (change to whatever ports you need)
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    # Please restrict your ingress to only necessary IPs and ports.
    # Opening to 0.0.0.0/0 can lead to security vulnerabilities.
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    # TLS (change to whatever ports you need)
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
    # Please restrict your ingress to only necessary IPs and ports.
    # Opening to 0.0.0.0/0 can lead to security vulnerabilities.
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    # TLS (change to whatever ports you need)
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    # Please restrict your ingress to only necessary IPs and ports.
    # Opening to 0.0.0.0/0 can lead to security vulnerabilities.
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
