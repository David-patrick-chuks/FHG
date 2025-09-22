import { Logger } from '../utils/Logger';
import { EmailService } from './EmailService';
import { IUserDocument } from '../models/User';

export class WelcomeEmailService {
  private static logger: Logger = new Logger();

  public static async sendWelcomeEmail(user: IUserDocument): Promise<void> {
    try {
      const welcomeEmailHtml = WelcomeEmailService.generateWelcomeEmailHtml(user);
      
      await EmailService.sendSimpleEmail(
        user.email,
        'Welcome to MailQuill - Your AI Email Marketing Journey Begins! 🚀',
        welcomeEmailHtml,
        WelcomeEmailService.generateWelcomeEmailText(user)
      );

      WelcomeEmailService.logger.info('Welcome email sent successfully', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      WelcomeEmailService.logger.error('Failed to send welcome email:', error);
      // Don't throw error to avoid breaking registration process
    }
  }

  private static generateWelcomeEmailHtml(user: IUserDocument): string {
    const currentYear = new Date().getFullYear();
    const userName = user.username || 'there';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to MailQuill</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 40px;
        }
        .welcome-section h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        .welcome-section p {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .feature-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            color: white;
            font-size: 20px;
        }
        .feature-card h3 {
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 8px 0;
        }
        .feature-card p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        .cta-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 16px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .plan-info {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .plan-info h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .plan-info ul {
            color: #92400e;
            margin: 0;
            padding-left: 20px;
        }
        .plan-info li {
            margin-bottom: 4px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .features-grid {
                grid-template-columns: 1fr;
            }
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>MailQuill</h1>
            <p>Your AI-Powered Email Marketing Assistant</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h2>Welcome aboard, ${userName}! 🎉</h2>
                <p>Thank you for joining MailQuill. You're now part of a community that's revolutionizing email marketing with the power of artificial intelligence.</p>
            </div>

            <!-- Plan Information -->
            <div class="plan-info">
                <h3>🎯 Your FREE Plan Includes:</h3>
                <ul>
                    <li><strong>2 AI Bots</strong> - Create intelligent email assistants</li>
                    <li><strong>1,000 Daily Emails</strong> - Send up to 1,000 emails per day</li>
                    <li><strong>2 Campaigns</strong> - Launch targeted email campaigns</li>
                    <li><strong>Basic Analytics</strong> - Track your email performance</li>
                    <li><strong>Email Support</strong> - Get help when you need it</li>
                </ul>
            </div>

            <!-- Features Grid -->
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🤖</div>
                    <h3>AI-Powered Bots</h3>
                    <p>Create intelligent email bots that understand your brand voice and engage your audience naturally.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Smart Analytics</h3>
                    <p>Track open rates, click rates, and engagement metrics to optimize your email campaigns.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Automated Campaigns</h3>
                    <p>Set up automated email sequences that nurture leads and convert prospects into customers.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h3>Professional Templates</h3>
                    <p>Choose from beautiful, responsive email templates that work across all devices.</p>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <h3 style="color: #1f2937; margin: 0 0 16px 0;">Ready to get started?</h3>
                <p style="color: #6b7280; margin: 0 0 20px 0;">Create your first AI bot and start sending professional emails in minutes!</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/bots/create" class="cta-button">
                    Create Your First Bot 🚀
                </a>
            </div>

            <!-- Getting Started Tips -->
            <div style="margin-top: 40px;">
                <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">💡 Quick Start Tips:</h3>
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                    <ol style="color: #374151; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Create Your First Bot:</strong> Set up an AI bot with your email credentials</li>
                        <li style="margin-bottom: 8px;"><strong>Import Your Contacts:</strong> Add your email list to start building relationships</li>
                        <li style="margin-bottom: 8px;"><strong>Launch a Campaign:</strong> Create your first email campaign and watch the magic happen</li>
                        <li style="margin-bottom: 8px;"><strong>Monitor Performance:</strong> Use our analytics to track and improve your results</li>
                    </ol>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Need help getting started?</strong></p>
            <p>Our support team is here to help you succeed. Reach out anytime!</p>
            <div class="social-links">
                <a href="mailto:support@mailquill.com">📧 support@mailquill.com</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © ${currentYear} MailQuill. All rights reserved.<br>
                You're receiving this email because you signed up for MailQuill.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private static generateWelcomeEmailText(user: IUserDocument): string {
    const userName = user.username || 'there';
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    
    return `
Welcome to MailQuill, ${userName}! 🎉

Thank you for joining MailQuill. You're now part of a community that's revolutionizing email marketing with the power of artificial intelligence.

YOUR FREE PLAN INCLUDES:
• 2 AI Bots - Create intelligent email assistants
• 1,000 Daily Emails - Send up to 1,000 emails per day
• 2 Campaigns - Launch targeted email campaigns
• Basic Analytics - Track your email performance
• Email Support - Get help when you need it

KEY FEATURES:
🤖 AI-Powered Bots - Create intelligent email bots that understand your brand voice
📊 Smart Analytics - Track open rates, click rates, and engagement metrics
⚡ Automated Campaigns - Set up automated email sequences
🎨 Professional Templates - Beautiful, responsive email templates

READY TO GET STARTED?
Create your first AI bot and start sending professional emails in minutes!
Visit: ${dashboardUrl}/bots/create

QUICK START TIPS:
1. Create Your First Bot: Set up an AI bot with your email credentials
2. Import Your Contacts: Add your email list to start building relationships
3. Launch a Campaign: Create your first email campaign and watch the magic happen
4. Monitor Performance: Use our analytics to track and improve your results

NEED HELP?
Our support team is here to help you succeed. Reach out anytime!
Email: support@mailquill.com

© ${new Date().getFullYear()} MailQuill. All rights reserved.
You're receiving this email because you signed up for MailQuill.
    `;
  }
}
