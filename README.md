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
- Deployed on AWS Elastic Beanstalk

### Backend
- Node.js with Express
- Docker containerization
- Deployed on AWS EC2

### Database
- Amazon RDS (PostgreSQL)

### Storage
- Amazon S3 for file storage

## Project Structure

```
.
├── frontend/               # React frontend application
├── backend/               # Node.js backend application
├── infrastructure/        # AWS infrastructure configuration
│   ├── terraform/        # Terraform configuration files
│   └── docker/           # Docker configuration files
└── docs/                 # Project documentation
```

## Prerequisites

- Node.js (v16 or higher)
- Docker
- AWS CLI configured with appropriate credentials
- Terraform (for infrastructure deployment)

## Setup Instructions

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
   REACT_APP_API_URL=<backend-api-url>
   REACT_APP_S3_BUCKET=<s3-bucket-name>
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
   DB_HOST=<rds-endpoint>
   DB_USER=<database-user>
   DB_PASSWORD=<database-password>
   DB_NAME=<database-name>
   S3_BUCKET=<s3-bucket-name>
   JWT_SECRET=<jwt-secret>
   ```

## Deployment Guide

### AWS Infrastructure Setup
1. Create VPC with public and private subnets
2. Set up RDS instance in private subnet
3. Configure EC2 instance in public subnet
4. Create S3 bucket for file storage
5. Set up Elastic Beanstalk for frontend deployment

### Security Configuration
1. Configure IAM roles and policies
2. Set up security groups
3. Enable HTTPS using ACM
4. Configure S3 bucket policies

Detailed deployment instructions can be found in the `docs/deployment.md` file.

## Security Considerations

- All sensitive data is encrypted at rest and in transit
- IAM roles follow the principle of least privilege
- Security groups restrict access to necessary ports only
- HTTPS is enforced for all communications
- S3 bucket policies separate public and private access

## Monitoring and Maintenance

- CloudWatch metrics for monitoring
- Automated backups for RDS
- S3 lifecycle policies for cost optimization

## License

MIT License

## Contact

For any questions or issues, please open an issue in the GitHub repository. 