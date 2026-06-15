resource "aws_instance" "this" {
  ami           = var.ami_id
  instance_type = var.instance_type

  subnet_id = var.subnet_id
  security_groups = var.security_groups_id

  key_name = var.key_name

  user_data = file("${path.module}/user_data.sh")

  iam_instance_profile = var.iam_instance_profile

  tags = {
    Name        = var.name
    Environment = var.environment
  }
}