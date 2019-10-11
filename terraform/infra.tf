provider "aws" {
  region = "eu-west-2"
}

resource "aws_instance" "test" {
  ami = "ami-04de2b60dd25fbb2e"
  instance_type = "t2.micro"
}
