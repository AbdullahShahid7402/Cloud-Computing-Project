#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm install
cd ..

# Initialize Terraform
echo "Initializing Terraform..."
cd infrastructure/terraform
terraform init

# Create terraform.tfvars file
echo "Creating terraform.tfvars..."
cat > terraform.tfvars << EOL
aws_region = "us-east-1"
environment = "production"
db_name = "task_management"
db_username = "admin"
db_password = "${DB_PASSWORD}"
key_name = "${AWS_KEY_NAME}"
s3_bucket_name = "task-management-files-${RANDOM}"
EOL

# Apply Terraform configuration
echo "Applying Terraform configuration..."
terraform apply -auto-approve

# Get outputs
echo "Getting Terraform outputs..."
DB_ENDPOINT=$(terraform output -raw rds_db_endpoint)
EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip)
S3_BUCKET=$(terraform output -raw s3_bucket_id)

# Create backend .env file
echo "Creating backend .env file..."
cat > ../backend/.env << EOL
DB_HOST=${DB_ENDPOINT}
DB_USER=admin
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=task_management
S3_BUCKET=${S3_BUCKET}
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
EOL

# Create frontend .env file
echo "Creating frontend .env file..."
cat > ../frontend/.env << EOL
REACT_APP_API_URL=http://${EC2_PUBLIC_IP}:3000
REACT_APP_S3_BUCKET=${S3_BUCKET}
EOL

# Deploy backend to EC2
echo "Deploying backend to EC2..."
cd ../backend
scp -i ~/.ssh/${AWS_KEY_NAME}.pem -r ./* ec2-user@${EC2_PUBLIC_IP}:~/app/

# SSH into EC2 and start the application
echo "Starting application on EC2..."
ssh -i ~/.ssh/${AWS_KEY_NAME}.pem ec2-user@${EC2_PUBLIC_IP} << 'ENDSSH'
cd ~/app
docker-compose up -d
ENDSSH

echo "Deployment completed successfully!"
echo "Frontend URL: http://${EC2_PUBLIC_IP}"
echo "Backend URL: http://${EC2_PUBLIC_IP}:3000" 