variable "key_pair" {
  description = "Key pair name for the EC2 instance"
  type        = string
}

variable "iam_instance_profile" {
  description = "IAM instance profile for the EC2 instance"
  type        = string
}