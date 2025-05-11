provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  environment          = var.environment
}

# RDS Configuration
module "rds" {
  source = "./modules/rds"

  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  environment         = var.environment
  security_group_name = "rds-sg"
}

# EC2 Configuration
module "ec2" {
  source = "./modules/ec2"

  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  environment        = var.environment
  instance_type      = var.instance_type
  key_name           = var.key_name
  security_group_name = "ec2-sg"
}

# S3 Configuration
module "s3" {
  source = "./modules/s3"

  bucket_name = var.s3_bucket_name
  environment = var.environment
}

# Elastic Beanstalk Configuration
module "elastic_beanstalk" {
  source = "./modules/elastic_beanstalk"

  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  environment       = var.environment
  app_name          = var.app_name
}

# IAM Configuration
module "iam" {
  source = "./modules/iam"

  environment = var.environment
  app_name    = var.app_name
} 