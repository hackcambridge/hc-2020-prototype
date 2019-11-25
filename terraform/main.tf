
provider "aws" {
  region = "eu-west-2"
}

# -------------------------------
# ----------- STAGING -----------
# -------------------------------

module "hc-staging-instance" {
  source                = "./modules/hc-instance"
  name                  = "hc-staging-instance"
  security_group        = "${aws_security_group.hc-instance-security-group.id}"
  APP_URL               = "https://canary.hackcambridge.com"
  DB_HOST               = "${var.DB_HOST}"
  DB_DATABASE           = "${var.DB_DATABASE}"
  DB_USERNAME           = "${var.DB_USERNAME}"
  DB_PASSWORD           = "${var.DB_PASSWORD}"
  DB_PREFIX             = "${var.STAGING_DB_PREFIX}"
  AWS_ACCESS_KEY_ID     = "${var.AWS_ACCESS_KEY_ID}"
  AWS_SECRET_ACCESS_KEY = "${var.AWS_SECRET_ACCESS_KEY}"
  AWS_BUCKET            = "${var.STAGING_AWS_BUCKET}"
  AUTH0_DOMAIN          = "${var.AUTH0_DOMAIN}"
  AUTH0_CLIENT_ID       = "${var.AUTH0_CLIENT_ID}"
  AUTH0_CLIENT_SECRET   = "${var.AUTH0_CLIENT_SECRET}"

}

module "hc-staging-cluster" {
  source          = "./modules/hc-cluster"
  name            = "hc-staging"
  launch_template = module.hc-staging-instance.id
  vpc             = "${aws_default_vpc.default.id}"
  subnets         = ["${aws_default_subnet.default_A.id}", "${aws_default_subnet.default_B.id}"]
}

# -------------------------------
# ------------ PROD -------------
# -------------------------------

module "hc-prod-instance" {
  source                = "./modules/hc-instance"
  name                  = "hc-prod-instance"
  security_group        = "${aws_security_group.hc-instance-security-group.id}"
  APP_URL               = "https://asdf.hackcambridge.com"
  DB_HOST               = "${var.DB_HOST}"
  DB_DATABASE           = "${var.DB_DATABASE}"
  DB_USERNAME           = "${var.DB_USERNAME}"
  DB_PASSWORD           = "${var.DB_PASSWORD}"
  DB_PREFIX             = "${var.PROD_DB_PREFIX}"
  AWS_ACCESS_KEY_ID     = "${var.AWS_ACCESS_KEY_ID}"
  AWS_SECRET_ACCESS_KEY = "${var.AWS_SECRET_ACCESS_KEY}"
  AWS_BUCKET            = "${var.PROD_AWS_BUCKET}"
  AUTH0_DOMAIN          = "${var.AUTH0_DOMAIN}"
  AUTH0_CLIENT_ID       = "${var.AUTH0_CLIENT_ID}"
  AUTH0_CLIENT_SECRET   = "${var.AUTH0_CLIENT_SECRET}"
}

module "hc-prod-cluster" {
  source          = "./modules/hc-cluster"
  name            = "hc-prod"
  launch_template = module.hc-prod-instance.id
  vpc             = "${aws_default_vpc.default.id}"
  subnets         = ["${aws_default_subnet.default_A.id}", "${aws_default_subnet.default_B.id}"]
}
