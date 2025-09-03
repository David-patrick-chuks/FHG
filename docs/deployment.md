# Deployment Guide

> **Production Deployment Instructions for Email Outreach Bot**

## 🚀 Overview

This guide covers deploying the Email Outreach Bot platform to production environments with enterprise-grade reliability and security.

## 📋 Prerequisites

- **Node.js** 18+ and **npm** 8+
- **MongoDB** 6.0+ (Atlas or self-hosted)
- **Redis** 7.0+ (ElastiCache or self-hosted)
- **Docker** 20.10+ (for containerized deployment)
- **Domain** with SSL certificate
- **Environment variables** configured

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3001
APP_VERSION=1.0.0
BUILD_NUMBER=2025.01.03

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/email-outreach-bot
MONGODB_MAX_POOL_SIZE=20
MONGODB_SERVER_SELECTION_TIMEOUT=10000
MONGODB_SOCKET_TIMEOUT=45000
MONGODB_CONNECT_TIMEOUT=10000

# Redis
REDIS_URL=redis://username:password@redis-endpoint:6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Security
CORS_ORIGIN=https://yourdomain.com
HELMET_HSTS_MAX_AGE=31536000

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

## 🐳 Docker Deployment

### 1. Build Docker Image

```bash
# Build the production image
docker build -t email-outreach-bot:latest .

# Tag for registry
docker tag email-outreach-bot:latest your-registry/email-outreach-bot:latest
```

### 2. Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: your-registry/email-outreach-bot:latest
    container_name: email-outreach-bot
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - .env.production
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:6.0
    container_name: mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7.0-alpine
    container_name: redis
    restart: unless-stopped
    command: redis-server --requirepass your-redis-password
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 3. Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app_servers {
        server app:3001;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        location / {
            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            access_log off;
            proxy_pass http://app_servers;
        }
    }
}
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. ECS Fargate

```json
{
  "family": "email-outreach-bot",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/email-outreach-bot-task-role",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "your-registry/email-outreach-bot:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/email-outreach-bot",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 2. Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name email-outreach-bot-alb \
  --subnets subnet-123 subnet-456 \
  --security-groups sg-123

# Create target group
aws elbv2 create-target-group \
  --name email-outreach-bot-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-123 \
  --target-type ip \
  --health-check-path /health
```

### Google Cloud Platform

#### 1. Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy email-outreach-bot \
  --image gcr.io/your-project/email-outreach-bot:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

#### 2. Cloud Build

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/email-outreach-bot:$COMMIT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/email-outreach-bot:$COMMIT_SHA']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'email-outreach-bot', '--image', 'gcr.io/$PROJECT_ID/email-outreach-bot:$COMMIT_SHA', '--region', 'us-central1', '--platform', 'managed']
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Generate SSL certificate with Let's Encrypt
certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

### 2. Security Headers

```typescript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. Rate Limiting

```typescript
// Production rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await healthService.getHealthStatus();
  res.status(200).json(health);
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### 2. Logging Configuration

```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 3. Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ],
  tracesSampleRate: 1.0,
});
```

## 🚀 Deployment Scripts

### Production Deploy Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting production deployment..."

# Pull latest changes
git pull origin main

# Build application
npm run build

# Build Docker image
docker build -t email-outreach-bot:latest .

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Health check
echo "⏳ Waiting for application to be ready..."
sleep 30

# Verify deployment
curl -f http://localhost/health || exit 1

echo "✅ Deployment completed successfully!"
```

### Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Rolling back to previous version..."

# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Start previous version
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback completed!"
```

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Redis connection tested
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring setup complete
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Documentation updated

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI and credentials
   - Verify network connectivity
   - Check firewall rules

2. **Redis Connection Failed**
   - Verify Redis URL and password
   - Check Redis service status
   - Validate network configuration

3. **SSL Certificate Issues**
   - Verify certificate validity
   - Check nginx configuration
   - Validate domain DNS settings

### Debug Commands

```bash
# Check application logs
docker logs email-outreach-bot

# Check nginx logs
docker logs nginx

# Test database connection
docker exec -it mongodb mongosh

# Test Redis connection
docker exec -it redis redis-cli ping

# Check application health
curl -v http://localhost/health
```

---

**Last Updated:** January 3, 2025  
**Deployment Version:** v1.0.0
