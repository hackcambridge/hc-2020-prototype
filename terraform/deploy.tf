resource "aws_iam_role" "deploy-role" {
  name = "deploy-role"

  assume_role_policy = <<EOF
{
  "Version": "2019-10-11",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_codedeploy_app" "main-site-deploy" {
  compute_platform = "Server"
  name             = "main-site-deploy"
}

resource "aws_codedeploy_deployment_group" "main-site-group" {
  app_name              = "${aws_codedeploy_app.main-site-deploy.name}"
  deployment_group_name = "main-site-group"
  service_role_arn      = "${aws_iam_role.deploy-role.arn}"

  ec2_tag_set {
    ec2_tag_filter {
      key   = "Deploy_Site"
      type  = "KEY_AND_VALUE"
      value = "True"
    }
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}
