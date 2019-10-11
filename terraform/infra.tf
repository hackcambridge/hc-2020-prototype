provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "test" {
  ami = "ami-0c64dd618a49aeee8"
  instance_type = "t2.micro"
  region = "us-east-1"
}
