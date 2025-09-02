# 🤖 Email Outreach Bot

A powerful, AI-powered email outreach platform that allows users to create multiple bots for automated email campaigns using Gemini AI and Gmail SMTP.

## ✨ Features

- **Multi-Bot Management**: Create and manage up to 5 email bots, each with its own Gmail SMTP configuration
- **AI-Powered Messages**: Generate 20 unique email variations using Google's Gemini AI with customizable bot prompts
- **Flexible Email Input**: Upload CSV files or paste email addresses directly
- **Campaign Tracking**: Monitor sent emails, track campaign progress, and manage outreach campaigns
- **User Authentication**: Secure login system with password reset functionality
- **High-Volume Sending**: Built with Nodemailer for reliable email delivery with intelligent rate limiting
- **Smart Queue System**: Real-time job queue to manage email sending and respect Gmail's 500 email daily limit
- **Bot Prompts**: Customizable prompts per bot for personalized AI message generation
- **Subscription Plans**: 3-tier pricing (Free, Pro, Enterprise) with different limits and features
- **Admin Panel**: Manual subscription management for physical payments
- **Modern Web Interface**: Clean, responsive React-based user interface

## 🏗️ Architecture

```
User → Bots → Campaigns → Email Lists → AI Messages → Sent Emails
```

- **Users** can create up to 5 **Bots**
- Each **Bot** has its own Gmail SMTP credentials
- **Campaigns** are associated with specific bots
- **AI Messages** are generated in batches of 20 using bot-specific prompts
- **Queue Management** ensures each bot respects Gmail's 500 email daily limit
- **Email Tracking** for monitoring campaign performance

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Gmail account(s) with SMTP access
- Google Gemini API key
- Stripe account (for subscription payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd email-outreach-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/email-outreach-bot
   
   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_here
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   
   # Admin
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_admin_password_here
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📧 Gmail SMTP Setup

### Option 1: App Passwords (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your Gmail address and the generated app password

### Option 2: Less Secure App Access (Not Recommended)
1. Allow less secure apps in your Google Account settings
2. Use your regular Gmail password

## 🎯 Usage

### 1. Create an Account
- Sign up with your email and password
- Verify your email address

### 2. Create Your First Bot
- Click "Create New Bot"
- Give your bot a name and description
- Enter your Gmail SMTP credentials
- Add a custom prompt for AI message generation
- Test the connection

### 3. Start a Campaign
- Select a bot for your campaign
- Choose your email list (upload CSV or paste addresses)
- The bot's custom prompt will be used for AI message generation
- Generate 20 unique message variations
- Review and send your campaign

### 4. Monitor Progress
- Track sent emails
- Monitor campaign status
- View delivery reports

## 🔄 Queue System & Bot Prompts

### Bot Prompts
- **Customizable Prompts**: Each bot can have its own AI prompt that defines the tone, style, and purpose of generated messages
- **Prompt Examples**:
  - "Professional networking outreach for software developers"
  - "Casual follow-up for potential clients"
  - "Warm introduction for partnership opportunities"
- **Dynamic Generation**: Prompts are automatically appended to Gemini AI requests for consistent, branded messaging

### Smart Queue Management
- **Daily Limit Enforcement**: Each bot is limited to 500 emails per 24-hour period
- **User Daily Limit**: Maximum 3000 emails per day across all user's bots
- **Real-Time Tracking**: Live monitoring of email counts with automatic queue pausing when limits are reached
- **Intelligent Scheduling**: Emails are queued and sent at optimal intervals (1-2 per minute) to maximize deliverability
- **Queue Status**: Real-time dashboard showing pending emails, daily counts, and bot status
- **Automatic Resume**: Queue automatically resumes at midnight when daily limits reset

## 👑 Admin Panel

### Admin Features
- **User Management**: View all users, their subscription status, and usage statistics
- **Manual Subscription Updates**: Upgrade/downgrade user subscriptions when physical payments are received
- **Subscription Management**: Create, edit, and delete subscriptions manually
- **Platform Analytics**: Monitor overall system usage, revenue, and user growth
- **Payment Tracking**: Track which users have paid physically vs. online

### Admin Workflow
1. **User pays you physically** (cash, bank transfer, etc.)
2. **Admin logs into admin panel**
3. **Finds user by email or username**
4. **Updates subscription plan** (Free → Pro, Pro → Enterprise, etc.)
5. **Sets subscription duration** (monthly, yearly, custom)
6. **User immediately gets access** to new features and limits

### Admin Security
- **Super Admin Access**: Only designated admin accounts can access admin panel
- **Audit Logging**: All admin actions are logged for security and accountability
- **IP Restrictions**: Optional IP whitelisting for admin access
- **Two-Factor Authentication**: Enhanced security for admin accounts

## 💳 Subscription Plans

### Free Tier
- **Bots**: 1 bot maximum
- **Daily Emails**: 500 emails per day
- **AI Messages**: 10 variations per campaign
- **Campaigns**: 3 campaigns per month
- **Support**: Community support only

### Pro Tier ($29/month)
- **Bots**: 3 bots maximum
- **Daily Emails**: 1500 emails per day
- **AI Messages**: 20 variations per campaign
- **Campaigns**: Unlimited campaigns
- **Priority Queue**: Faster email processing
- **Support**: Email support + priority queue

### Enterprise Tier ($99/month)
- **Bots**: 5 bots maximum
- **Daily Emails**: 3000 emails per day
- **AI Messages**: 20 variations per campaign
- **Campaigns**: Unlimited campaigns
- **Priority Queue**: Highest priority processing
- **Advanced Analytics**: Detailed campaign insights
- **API Access**: REST API for integrations
- **Support**: Priority support + dedicated account manager

## 📏 System Limits & Constraints

### User Limits (Based on Subscription)
- **Free**: 1 bot, 500 emails/day
- **Pro**: 3 bots, 1500 emails/day
- **Enterprise**: 5 bots, 3000 emails/day
- **Concurrent Campaigns**: Unlimited campaigns per bot

### Bot Limits
- **Daily Email Limit**: 500 emails per bot per 24-hour period
- **Sending Rate**: 1-2 emails per minute per bot
- **SMTP Credentials**: One Gmail account per bot

### Queue Behavior
- **Automatic Pausing**: Queue pauses when any limit is reached
- **Priority System**: Subscription-based priority (Enterprise > Pro > Free)
- **Limit Reset**: All counters reset at midnight UTC
- **Overflow Protection**: System prevents exceeding daily limits

## 📁 Project Structure

```
email-outreach-bot/
├── backend/                 # Node.js + Express server
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── utils/         # Helper functions
│   │   ├── admin/         # Admin panel components
│   │   └── dashboard/     # User dashboard components
├── shared/                 # Shared types and utilities
└── docs/                   # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/logout` - User logout

### Bots
- `GET /api/bots` - Get user's bots
- `POST /api/bots` - Create new bot
- `PUT /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot
- `POST /api/bots/:id/test` - Test bot connection
- `PUT /api/bots/:id/prompt` - Update bot's AI prompt

### Campaigns
- `GET /api/campaigns` - Get user's campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns/:id/generate-messages` - Generate AI messages
- `POST /api/campaigns/:id/send` - Send campaign

### Queue Management
- `GET /api/queue/status` - Get queue status and bot limits
- `GET /api/queue/jobs/:botId` - Get pending jobs for a specific bot
- `POST /api/queue/pause/:botId` - Pause email sending for a bot
- `POST /api/queue/resume/:botId` - Resume email sending for a bot

### Subscriptions
- `GET /api/subscription/current` - Get current subscription details
- `POST /api/subscription/upgrade` - Upgrade subscription plan
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/usage` - Get current usage statistics
- `POST /api/subscription/webhook` - Stripe webhook for payment processing

### Admin (Protected Routes)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get specific user details (admin only)
- `PUT /api/admin/users/:id/subscription` - Update user subscription manually (admin only)
- `GET /api/admin/subscriptions` - Get all subscription data (admin only)
- `POST /api/admin/subscriptions/create` - Create manual subscription (admin only)
- `PUT /api/admin/subscriptions/:id` - Update subscription details (admin only)
- `DELETE /api/admin/subscriptions/:id` - Delete subscription (admin only)
- `GET /api/admin/analytics` - Get platform analytics (admin only)

## 🛡️ Security Features

- **Password Encryption**: Bcrypt hashing for user passwords
- **JWT Authentication**: Secure token-based authentication
- **SMTP Credentials**: Encrypted storage of email credentials
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive input sanitization

## 📊 Email Limits & Best Practices

- **Gmail Daily Limit**: 500 emails per account (strictly enforced)
- **User Daily Limit**: 3000 emails maximum per day across all bots
- **Bot Limit**: Maximum 5 bots per user
- **Smart Rate Limiting**: Automatic queue management to prevent limit violations
- **Recommended Sending Rate**: 1-2 emails per minute per bot
- **Campaign Size**: Start with smaller lists (50-100 emails)
- **Content Guidelines**: Avoid spam triggers, use personalization
- **Unsubscribe**: Always include unsubscribe options
- **Queue Monitoring**: Real-time tracking of daily email counts per bot and user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is intended for legitimate business outreach and networking purposes only. Users are responsible for:
- Complying with email marketing laws (CAN-SPAM, GDPR)
- Obtaining proper consent from recipients
- Following best practices for email outreach
- Respecting recipient preferences and unsubscribe requests

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our Discord/Telegram for community support

## 🔮 Roadmap

- [ ] Email template library
- [ ] Advanced analytics and reporting
- [ ] A/B testing for campaigns
- [ ] Integration with CRM systems
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced AI personalization
- [ ] Email deliverability optimization
- [ ] Multi-account rotation for higher daily limits
- [ ] Advanced queue scheduling and optimization

---

**Built with ❤️ using Node.js, React, MongoDB, and Gemini AI**
