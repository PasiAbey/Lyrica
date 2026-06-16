terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-north-1"
}


module "Lyrica-vpc" {
  source            = "../../module/vpc"
  vpc_name          = "Lyrica-vpc"
  vpc_cidr_block    = "10.0.0.0/16"
  subnet_cidr_block = "10.0.1.0/24"
}

module "Lyrica-security-group" {
  source      = "../../module/security_group"
  sg_name     = "Lyrica-security-group"
  vpc_id      = module.Lyrica-vpc.vpc_id
}

module "Lyrica-web" {
  source        = "../../module/ec2"
  name          = "Lyrica"
  environment   = "deployment"

  ami_id        = "ami-05d62b9bc5a6ca605"
  instance_type = "t3.micro"

  key_name      = var.key_pair
  iam_instance_profile = var.iam_instance_profile

  subnet_id = module.Lyrica-vpc.subnet_id
  security_groups_id = [module.Lyrica-security-group.security_group_id]
}