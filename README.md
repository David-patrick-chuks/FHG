# Email Outreach Bot

A comprehensive AI-powered email outreach platform that automates personalized email campaigns using Google's Gemini AI and intelligent bot management.

## 🚀 Project Overview

The Email Outreach Bot is a sophisticated platform that combines artificial intelligence with email automation to create personalized outreach campaigns. It features multi-user support, subscription tiers, and intelligent bot management to maximize email deliverability and engagement.

## ✨ Key Features

- **AI-Powered Content Generation**: Uses Google Gemini AI to create unique, personalized email messages
- **Multi-Bot Management**: Support for multiple email bots with individual configurations
- **Campaign Management**: Create, manage, and track email campaigns with real-time analytics
- **Subscription Tiers**: Flexible pricing plans (Free, Pro, Enterprise) with different limits
- **Queue System**: Robust job queuing with Redis for reliable email delivery
- **Security & Compliance**: JWT authentication, rate limiting, and email deliverability best practices
- **Real-time Monitoring**: Comprehensive logging and monitoring of all email activities

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)   │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Queue   │
                       │   (Bull) │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Email Bots    │
                       │   (SMTP)        │
                       └─────────────────┘
```

## 📚 Documentation

- **[Backend README](./backend/README.md)** - Complete backend setup, API documentation, and development guide
- **API Endpoints** - Comprehensive API reference with examples
- **Database Schema** - MongoDB models and relationships
- **Deployment Guide** - Production deployment instructions

## 🔧 Configuration

The platform is highly configurable through environment variables:

- **Database**: MongoDB connection strings
- **AI**: Google Gemini API keys
- **Email**: SMTP server configurations
- **Security**: JWT secrets, rate limiting
- **Queue**: Redis connection settings

## 🚀 Deployment

The platform supports multiple deployment environments:

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Production-ready with monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Check the [Backend README](./backend/README.md) for detailed information
- **Community**: Join our community discussions

## 🔮 Roadmap

- [ ] Frontend React application
- [ ] Advanced analytics dashboard
- [ ] Email template builder
- [ ] A/B testing for campaigns
- [ ] Integration with CRM systems
- [ ] Mobile application
- [ ] Advanced AI personalization

---

**Built with ❤️ by David Patrick**
