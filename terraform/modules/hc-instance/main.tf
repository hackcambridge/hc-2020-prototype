# -------------------------------
# ------- User file script ------
# -------------------------------

data "template_file" "user_data" {
  template = "${file("init-script.tpl")}"
  vars = {
    APP_URL               = "${var.APP_URL}"
    APP_DEBUG             = "${var.APP_DEBUG}"
    APP_ENV               = "${var.APP_ENV}"
    DB_PREFIX             = "${var.DB_PREFIX}"
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
    MAILGUN_SECRET        = "${var.MAILGUN_SECRET}"
  }
}

# -------------------------------
# ------- Launch Template -------
# -------------------------------

resource "aws_launch_template" "hc-instance" {
  name                   = var.name
  image_id               = "ami-040eaa068dbe2517d"
  instance_type          = var.instance_type
  key_name               = "DevTeam"
  vpc_security_group_ids = [var.security_group]
  lifecycle {
    create_before_destroy = true
  }
  iam_instance_profile {
    name = "CodeDeployAgentRole"
  }
  user_data = base64encode(data.template_file.user_data.rendered)
}
