#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Check if running on EC2
if [ -f /sys/hypervisor/uuid ] && [ "$(head -c 3 /sys/hypervisor/uuid)" == "ec2" ]; then
    echo "Running on EC2 instance..."
    # Skip Terraform deployment if already on EC2
    SKIP_TERRAFORM=true
else
    echo "Running on local machine..."
    SKIP_TERRAFORM=false
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Create necessary directories if they don't exist
mkdir -p frontend/src
mkdir -p backend/src
mkdir -p infrastructure/terraform/modules

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

if [ "$SKIP_TERRAFORM" = false ]; then
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
else
    # If running on EC2, use environment variables
    DB_ENDPOINT=${DB_HOST}
    EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    S3_BUCKET=${S3_BUCKET_NAME}
fi

# Create backend .env file
echo "Creating backend .env file..."
cat > backend/.env << EOL
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
cat > frontend/.env << EOL
REACT_APP_API_URL=http://${EC2_PUBLIC_IP}:3000
REACT_APP_S3_BUCKET=${S3_BUCKET}
EOL

if [ "$SKIP_TERRAFORM" = false ]; then
    # Create a temporary directory for deployment
    echo "Preparing files for deployment..."
    TEMP_DIR=$(mktemp -d)
    cp -r backend/* ${TEMP_DIR}/
    cp -r frontend/build ${TEMP_DIR}/frontend

    # Deploy to EC2
    echo "Deploying to EC2..."
    scp -i ~/.ssh/${AWS_KEY_NAME}.pem -r ${TEMP_DIR}/* ec2-user@${EC2_PUBLIC_IP}:~/app/

    # Clean up temporary directory
    rm -rf ${TEMP_DIR}

    # SSH into EC2 and start the application
    echo "Starting application on EC2..."
    ssh -i ~/.ssh/${AWS_KEY_NAME}.pem ec2-user@${EC2_PUBLIC_IP} << 'ENDSSH'
    cd ~/app
    docker-compose up -d
ENDSSH
else
    # If running on EC2, just start the application
    echo "Starting application..."
    cd ~/app
    docker-compose up -d
fi

echo "Deployment completed successfully!"
echo "Frontend URL: http://${EC2_PUBLIC_IP}"
echo "Backend URL: http://${EC2_PUBLIC_IP}:3000" 