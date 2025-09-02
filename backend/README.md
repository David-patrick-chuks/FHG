# Email Outreach Bot - Backend

A robust Node.js backend API for the Email Outreach Bot platform, featuring AI-powered email generation, multi-bot management, and intelligent queue systems.

## 🚀 Features

- **AI-Powered Email Generation**: Integration with Google Gemini AI for personalized email content
- **Multi-Bot Management**: Support for multiple email bots with individual SMTP configurations
- **Campaign Management**: Create, manage, and track email campaigns with real-time progress
- **Queue System**: Redis-based job queuing with Bull/BullMQ for reliable email delivery
- **User Authentication**: JWT-based authentication with bcrypt password encryption
- **Subscription Management**: Multi-tier subscription system with admin controls
- **Rate Limiting**: Built-in protection against API abuse
- **Comprehensive Logging**: Winston-based logging with file rotation
- **TypeScript**: Full TypeScript support with strict type checking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │     Services     │    │      Models     │
│   (API Layer)   │◄──►│  (Business      │◄──►│   (Database     │
│                 │    │   Logic)        │    │    Layer)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Routes      │    │   Middleware    │    │   Database      │
│   (Endpoints)   │    │  (Validation,   │    │  Connection     │
│                 │    │   Auth, etc.)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 16+
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5.1+
- **Database**: MongoDB 4.4+ with Mongoose 8.18+
- **Queue**: Redis 6.0+ with Bull 4.16+
- **AI**: Google Gemini AI API
- **Email**: Nodemailer 7.0+
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston 3.17+
- **Validation**: Custom validation middleware

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── AdminController.ts
│   │   ├── AuthController.ts
│   │   ├── BotController.ts
│   │   ├── CampaignController.ts
│   │   ├── QueueController.ts
│   │   └── SubscriptionController.ts
│   ├── models/               # Database models
│   │   ├── AdminAction.ts
│   │   ├── Bot.ts
│   │   ├── Campaign.ts
│   │   ├── QueueJob.ts
│   │   ├── SentEmail.ts
│   │   ├── Subscription.ts
│   │   └── User.ts
│   ├── services/             # Business logic
│   │   ├── AdminService.ts
│   │   ├── BotService.ts
│   │   ├── CampaignService.ts
│   │   ├── EmailService.ts
│   │   ├── QueueService.ts
│   │   ├── SubscriptionService.ts
│   │   └── UserService.ts
│   ├── routes/               # API routes
│   │   ├── AdminRoutes.ts
│   │   ├── AuthRoutes.ts
│   │   ├── BotRoutes.ts
│   │   ├── CampaignRoutes.ts
│   │   ├── QueueRoutes.ts
│   │   ├── SubscriptionRoutes.ts
│   │   └── index.ts
│   ├── middleware/           # Custom middleware
│   │   ├── AuthMiddleware.ts
│   │   ├── ErrorHandler.ts
│   │   ├── RequestLogger.ts
│   │   └── ValidationMiddleware.ts
│   ├── database/             # Database connection
│   │   └── DatabaseConnection.ts
│   ├── utils/                # Utility functions
│   │   └── Logger.ts
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── server/               # Server configuration
│   │   └── Server.ts
│   └── index.ts              # Application entry point
├── logs/                     # Application logs
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── nodemon.json              # Development server configuration
└── env.example               # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **MongoDB**: Version 4.4 or higher
- **Redis**: Version 6.0 or higher
- **Google Gemini AI API Key**: For AI-powered email generation

### Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/email-outreach-bot
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   
   # Admin Configuration
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your-admin-password-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | - | ✅ |
| `PORT` | Server port | 3000 | ❌ |
| `NODE_ENV` | Environment mode | development | ❌ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key | - | ✅ |
| `REDIS_URL` | Redis connection string | - | ✅ |
| `ADMIN_EMAIL` | Admin account email | - | ✅ |
| `ADMIN_PASSWORD` | Admin account password | - | ✅ |

### Database Setup

1. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Start Redis**
   ```bash
   # Local Redis
   redis-server
   
   # Or using Docker
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Bot Management

#### Create Bot
```http
POST /bots
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "My Email Bot",
  "description": "Professional outreach bot",
  "email": "bot@gmail.com",
  "password": "app-password",
  "prompt": "Professional networking outreach for software developers"
}
```

#### Get User Bots
```http
GET /bots
Authorization: Bearer <jwt-token>
```

### Campaign Management

#### Create Campaign
```http
POST /campaigns
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Developer Outreach",
  "description": "Reaching out to potential developers",
  "botId": "bot-id-here",
  "emailList": ["dev1@example.com", "dev2@example.com"]
}
```

#### Generate AI Messages
```http
POST /campaigns/:id/generate-messages
Authorization: Bearer <jwt-token>
```

#### Start Campaign
```http
POST /campaigns/:id/send
Authorization: Bearer <jwt-token>
```

### Queue Management

#### Get Queue Status
```http
GET /queue/status
Authorization: Bearer <jwt-token>
```

#### Pause Bot Queue
```http
POST /queue/pause/:botId
Authorization: Bearer <jwt-token>
```

### Subscription Management

#### Get Current Subscription
```http
GET /subscription/current
Authorization: Bearer <jwt-token>
```

#### Upgrade Subscription
```http
POST /subscription/upgrade
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "tier": "pro",
  "duration": 12,
  "paymentMethod": "bank_transfer",
  "amount": 348
}
```

### Admin Endpoints

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin-jwt-token>
```

#### Update User Subscription
```http
PUT /admin/users/:id/subscription
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "tier": "enterprise",
  "duration": 12,
  "paymentMethod": "cash",
  "amount": 1188
}
```

## 🗄️ Database Models

### User Model
- Email, username, password
- Subscription tier and expiration
- Account status and admin privileges

### Bot Model
- User association and configuration
- SMTP credentials (encrypted)
- AI prompt and daily email limits

### Campaign Model
- Campaign metadata and status
- Email list and AI-generated messages
- Progress tracking and analytics

### SentEmail Model
- Email delivery tracking
- Status updates (sent, delivered, opened, replied)
- Error logging for failed emails

### QueueJob Model
- Job queuing and processing
- Retry logic and priority handling
- Status tracking and error management

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing with configurable rounds
- **Rate Limiting**: Configurable rate limiting per IP address
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **Request Logging**: Comprehensive audit logging

## 📊 Monitoring & Logging

### Logging Levels
- **Error**: Application errors and failures
- **Warn**: Warning conditions
- **Info**: General information
- **Debug**: Detailed debugging information

### Log Files
- Application logs: `./logs/app.log`
- Error logs: `./logs/error.log`
- Access logs: `./logs/access.log`

### Health Checks
```http
GET /api/health
```
Returns server status, uptime, and environment information.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Set production environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-mongodb
REDIS_URL=redis://your-production-redis
JWT_SECRET=your-production-jwt-secret
```

### Process Management
Use PM2 for production process management:
```bash
npm install -g pm2
pm2 start dist/index.js --name "email-outreach-bot"
pm2 startup
pm2 save
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 🔧 Development

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (if configured)

### Hot Reload
Development server with nodemon for automatic restarts:
```bash
npm run dev
```

### TypeScript Compilation
```bash
npm run build
```

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Rate Limiting

- **Default Limit**: 100 requests per 15 minutes per IP
- **Admin Routes**: Excluded from rate limiting
- **Health Check**: Excluded from rate limiting
- **Configurable**: Adjustable via environment variables

## 🔄 Queue System

### Job Processing
- **Priority System**: Subscription-based priority
- **Retry Logic**: Configurable retry attempts
- **Rate Limiting**: Respects bot daily limits
- **Error Handling**: Comprehensive error logging

### Queue Status
Real-time monitoring of:
- Pending jobs
- Processing jobs
- Completed jobs
- Failed jobs
- Bot daily limits

## 🎯 Best Practices

### Email Sending
- Respect Gmail's 500 email daily limit
- Use app passwords for SMTP authentication
- Implement proper error handling
- Monitor delivery rates and bounces

### Security
- Use strong JWT secrets
- Implement proper input validation
- Log all admin actions
- Regular security updates

### Performance
- Use database indexes effectively
- Implement connection pooling
- Monitor queue performance
- Regular performance audits

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Redis Connection Failed**
   - Check Redis service status
   - Verify Redis URL
   - Check authentication

3. **Gemini AI API Errors**
   - Verify API key validity
   - Check API quota limits
   - Verify network connectivity

4. **Email Sending Failures**
   - Check SMTP credentials
   - Verify bot daily limits
   - Check email content for spam triggers

### Debug Mode
Enable debug logging:
```env
LOG_LEVEL=debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Check this README and inline code comments
- **Community**: Join our development discussions

---

**Built with ❤️ using Node.js, TypeScript, and modern web technologies**
