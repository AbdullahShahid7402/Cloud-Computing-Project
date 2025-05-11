# Cloud Computing Project - Task Management System

A full-stack task management application deployed on AWS cloud infrastructure.

## Project Overview

This project implements a task management system with the following features:
- User authentication and authorization
- CRUD operations for tasks
- File and image upload support
- Secure cloud infrastructure on AWS

## Tech Stack

### Frontend
- React.js
- Material-UI for styling
- AWS SDK for JavaScript
- Deployed on AWS EC2

### Backend
- Node.js with Express
- Docker containerization
- Deployed on AWS EC2

### Database
- Amazon RDS (PostgreSQL)

### Storage
- Amazon S3 for file storage

### Infrastructure
- Terraform for infrastructure as code
- AWS VPC with public and private subnets
- AWS EC2 for application hosting
- AWS RDS for database
- AWS S3 for file storage

## Project Structure

```
.
├── frontend/               # React frontend application
├── backend/               # Node.js backend application
├── infrastructure/        # AWS infrastructure configuration
│   ├── terraform/        # Terraform configuration files
│   └── deploy.sh         # Deployment script
└── docs/                 # Project documentation
```

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- AWS CLI configured with appropriate credentials
- Terraform (v1.0.0 or higher)
- SSH key pair for EC2 access

## Local Development Setup

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:3000
   REACT_APP_S3_BUCKET=<s3-bucket-name>
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=task_management
   S3_BUCKET=<s3-bucket-name>
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment Guide

### 1. AWS Setup
1. Install and configure AWS CLI:
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, and default region.

2. Create an SSH key pair:
   ```bash
   aws ec2 create-key-pair --key-name task-management-key --query 'KeyMaterial' --output text > ~/.ssh/task-management-key.pem
   chmod 400 ~/.ssh/task-management-key.pem
   ```

### 2. Environment Variables
Set up the following environment variables:
```bash
export DB_PASSWORD="your-secure-db-password"
export AWS_KEY_NAME="task-management-key"
export JWT_SECRET="your-secure-jwt-secret"
```

### 3. Deployment
1. Make the deployment script executable:
   ```bash
   chmod +x infrastructure/deploy.sh
   ```

2. Run the deployment script:
   ```bash
   ./infrastructure/deploy.sh
   ```

The deployment script will:
- Build the frontend and backend applications
- Initialize and apply the Terraform configuration
- Create necessary environment files
- Deploy the backend to EC2
- Start the application using Docker Compose

### 4. Accessing the Application
After successful deployment, you can access:
- Frontend: `http://<EC2_PUBLIC_IP>`
- Backend API: `http://<EC2_PUBLIC_IP>:3000`

### 5. Infrastructure Details
The deployment creates the following AWS resources:
- VPC with public and private subnets
- RDS PostgreSQL instance in private subnet
- EC2 instance in public subnet
- S3 bucket for file storage
- Security groups for RDS and EC2
- IAM roles and policies

## Security Considerations

- All sensitive data is encrypted at rest and in transit
- IAM roles follow the principle of least privilege
- Security groups restrict access to necessary ports only
- HTTPS is enforced for all communications
- S3 bucket policies separate public and private access
- Database is placed in private subnet
- Regular security updates through EC2 user data script

## Monitoring and Maintenance

- CloudWatch metrics for monitoring
- Automated backups for RDS
- S3 lifecycle policies for cost optimization
- Docker container health checks
- Automatic container restarts

## Troubleshooting

### Common Issues
1. **EC2 Connection Issues**
   - Verify security group settings
   - Check SSH key permissions
   - Ensure instance is running

2. **Database Connection Issues**
   - Verify RDS security group settings
   - Check database credentials
   - Ensure database is in private subnet

3. **S3 Access Issues**
   - Verify IAM role permissions
   - Check S3 bucket policy
   - Ensure correct bucket name

### Logs
- Application logs: `docker logs <container_id>`
- EC2 system logs: AWS Console > EC2 > Instances > Actions > Monitor and troubleshoot > Get system log
- RDS logs: AWS Console > RDS > Databases > Logs & events

## Cleanup
To destroy all resources:
```bash
cd infrastructure/terraform
terraform destroy
```

## License

MIT License

## Contact

For any questions or issues, please open an issue in the GitHub repository. 