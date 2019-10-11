resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_default_subnet" "default_A" {
  availability_zone = "eu-west-2a"

  tags = {
    Name = "Default subnet for eu-west-2a"
  }
}

resource "aws_default_subnet" "default_B" {
  availability_zone = "eu-west-2b"

  tags = {
    Name = "Default subnet for eu-west-2b"
  }
}
