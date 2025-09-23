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
            color: #1f2937;
            background-color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #1f2937;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #ffffff;
            letter-spacing: -0.025em;
        }
        .content {
            padding: 32px 24px;
        }
        .welcome-section {
            margin-bottom: 32px;
        }
        .welcome-section h2 {
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .welcome-section p {
            color: #6b7280;
            font-size: 16px;
            margin: 0 0 16px 0;
        }
        .plan-section {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .plan-section h3 {
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        .plan-list {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .plan-list li {
            color: #374151;
            font-size: 14px;
            margin-bottom: 8px;
            padding-left: 16px;
            position: relative;
        }
        .plan-list li:before {
            content: "•";
            color: #1f2937;
            position: absolute;
            left: 0;
        }
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #1f2937;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            transition: background-color 0.2s ease;
        }
        .cta-button:hover {
            background-color: #374151;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
        .footer a {
            color: #1f2937;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .copyright {
            margin-top: 16px;
            font-size: 12px;
            color: #9ca3af;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
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
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h2>Welcome, ${userName}</h2>
                <p>Thank you for joining MailQuill. You now have access to AI-powered email marketing tools designed to help you connect with your audience more effectively.</p>
            </div>

            <!-- Plan Information -->
            <div class="plan-section">
                <h3>Your Free Plan</h3>
                <ul class="plan-list">
                    <li>2 AI-powered email bots</li>
                    <li>1,000 emails per day</li>
                    <li>2 active campaigns</li>
                    <li>Basic analytics and reporting</li>
                    <li>Email support</li>
                </ul>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/bots/create" class="cta-button">
                    Get Started
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Questions? Contact us at <a href="mailto:support@mailquill.com">support@mailquill.com</a></p>
            <div class="copyright">
                © ${currentYear} MailQuill. All rights reserved.
            </div>
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
Welcome to MailQuill, ${userName}

Thank you for joining MailQuill. You now have access to AI-powered email marketing tools designed to help you connect with your audience more effectively.

YOUR FREE PLAN INCLUDES:
• 2 AI-powered email bots
• 1,000 emails per day
• 2 active campaigns
• Basic analytics and reporting
• Email support

GET STARTED:
Visit: ${dashboardUrl}/bots/create

SUPPORT:
Questions? Contact us at support@mailquill.com

© ${new Date().getFullYear()} MailQuill. All rights reserved.
    `;
  }
}
