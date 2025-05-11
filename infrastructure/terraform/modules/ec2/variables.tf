variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs of the public subnets"
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "security_group_name" {
  description = "Name of the security group"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "ami_id" {
  description = "ID of the AMI to use"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Amazon Linux 2023 AMI
} 