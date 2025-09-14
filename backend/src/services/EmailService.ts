import nodemailer from 'nodemailer';
import BotModel from '../models/Bot';
import CampaignModel from '../models/Campaign';
import SentEmailModel from '../models/SentEmail';
import { ApiResponse, EmailStatus } from '../types';
import { Logger } from '../utils/Logger';
import { TrackingUtils } from '../utils/TrackingUtils';

export class EmailService {
  private static logger: Logger = new Logger();
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize the email transporter
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_AUTH_USER || '',
          pass: process.env.SMTP_AUTH_PASS || ''
        }
      });

      // Verify connection configuration
      try {
        await this.transporter.verify();
        EmailService.logger.info('Email transporter configured successfully');
      } catch (error) {
        EmailService.logger.error('Email transporter configuration failed:', error);
        throw new Error('Email service configuration failed');
      }
    }

    return this.transporter;
  }

  /**
   * Send a simple email (for system emails like welcome, notifications, etc.)
   */
  public static async sendSimpleEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"MAILQUILL TEAM" <${process.env.SMTP_AUTH_USER || 'noreply@mailquill.com'}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
      };

      await transporter.sendMail(mailOptions);
      EmailService.logger.info('Simple email sent successfully', { to, subject });
    } catch (error) {
      EmailService.logger.error('Failed to send simple email:', error);
      throw error;
    }
  }

  /**
   * Send password reset link email
   */
  public static async sendPasswordResetLink(
    email: string, 
    username: string, 
    resetLink: string
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
        to: email,
        subject: 'Password Reset - Email Outreach Bot',
        html: this.generatePasswordResetLinkHTML(username, resetLink),
        text: this.generatePasswordResetLinkText(username, resetLink)
      };

      await transporter.sendMail(mailOptions);
      EmailService.logger.info('Password reset link email sent successfully', { email });
    } catch (error) {
      EmailService.logger.error('Failed to send password reset link email:', error);
      throw new Error('Failed to send password reset link email');
    }
  }


  /**
   * Send campaign completion notification
   */
  public static async sendCampaignCompletionEmail(
    email: string, 
    campaignName: string, 
    totalEmails: number, 
    successCount: number
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
        to: email,
        subject: `Campaign Completed: ${campaignName}`,
        html: this.generateCampaignCompletionHTML(campaignName, totalEmails, successCount),
        text: this.generateCampaignCompletionText(campaignName, totalEmails, successCount)
      };

      await transporter.sendMail(mailOptions);
      EmailService.logger.info('Campaign completion email sent successfully', { email, campaignName });
    } catch (error) {
      EmailService.logger.error('Failed to send campaign completion email:', error);
      throw new Error('Failed to send campaign completion email');
    }
  }

  /**
   * Send subscription expiry reminder
   */
  public static async sendSubscriptionExpiryReminder(
    email: string, 
    username: string, 
    daysUntilExpiry: number
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
        to: email,
        subject: `Subscription Expires in ${daysUntilExpiry} Days`,
        html: this.generateSubscriptionExpiryHTML(username, daysUntilExpiry),
        text: this.generateSubscriptionExpiryText(username, daysUntilExpiry)
      };

      await transporter.sendMail(mailOptions);
      EmailService.logger.info('Subscription expiry reminder sent successfully', { email, daysUntilExpiry });
    } catch (error) {
      EmailService.logger.error('Failed to send subscription expiry reminder:', error);
      throw new Error('Failed to send subscription expiry reminder');
    }
  }

  /**
   * Generate HTML for password reset link email
   */
  private static generatePasswordResetLinkHTML(username: string, resetLink: string): string {
    const currentYear = new Date().getFullYear();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - MailQuill Team</title>
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
            margin-bottom: 30px;
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
        .warning-section {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .warning-section h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .warning-section p {
            color: #92400e;
            margin: 0 0 8px 0;
        }
        .info-section {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-section h3 {
            color: #0c4a6e;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
        }
        .info-section p {
            color: #0c4a6e;
            margin: 0 0 8px 0;
        }
        .link-fallback {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: #6b7280;
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
        @media (max-width: 600px) {
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
            <h1>🔐 Password Reset</h1>
            <p>MailQuill Team - Secure Account Recovery</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h2>Hello ${username}! 👋</h2>
                <p>We received a request to reset your password for your MailQuill account.</p>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <h3 style="color: #1f2937; margin: 0 0 16px 0;">Ready to reset your password?</h3>
                <p style="color: #6b7280; margin: 0 0 20px 0;">Click the button below to create a new secure password for your account.</p>
                <a href="${resetLink}" class="cta-button">
                    Reset My Password 🔑
                </a>
            </div>

            <!-- Security Warning -->
            <div class="warning-section">
                <h3>⚠️ Important Security Information</h3>
                <p><strong>This link will expire in 1 hour</strong> for your security.</p>
                <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            </div>

            <!-- Additional Information -->
            <div class="info-section">
                <h3>💡 Need Help?</h3>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <div class="link-fallback">${resetLink}</div>
                <p>For any questions or concerns, please contact our support team.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>MailQuill Support Team</strong></p>
            <p>We're here to help you succeed with your AI email marketing journey.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © ${currentYear} MailQuill. All rights reserved.<br>
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text for password reset link email
   */
  private static generatePasswordResetLinkText(username: string, resetLink: string): string {
    return `
🔐 Password Reset - MailQuill
MailQuill - Secure Account Recovery

Hello ${username}! 👋

We received a request to reset your password for your MailQuill account.

READY TO RESET YOUR PASSWORD?
Click the link below to create a new secure password for your account:
${resetLink}

⚠️ IMPORTANT SECURITY INFORMATION:
• This link will expire in 1 hour for your security
• If you didn't request this password reset, please ignore this email or contact our support team immediately

💡 NEED HELP?
For any questions or concerns, please contact our support team.

Best regards,
MailQuill Support Team
We're here to help you succeed with your AI email marketing journey.

---
© ${new Date().getFullYear()} MailQuill. All rights reserved.
This is an automated email. Please do not reply to this message.
    `;
  }


  /**
   * Generate HTML for campaign completion email
   */
  private static generateCampaignCompletionHTML(
    campaignName: string, 
    totalEmails: number, 
    successCount: number
  ): string {
    const successRate = totalEmails > 0 ? Math.round((successCount / totalEmails) * 100) : 0;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Campaign Completed: ${campaignName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Completed!</h1>
          </div>
          <div class="content">
            <p>Your campaign <strong>${campaignName}</strong> has been completed successfully!</p>
            <div class="stats">
              <div class="stat-item">
                <span>Total Emails:</span>
                <strong>${totalEmails}</strong>
              </div>
              <div class="stat-item">
                <span>Successfully Sent:</span>
                <strong>${successCount}</strong>
              </div>
              <div class="stat-item">
                <span>Success Rate:</span>
                <strong>${successRate}%</strong>
              </div>
            </div>
            <p>View detailed analytics and performance metrics in your dashboard.</p>
            <p>Best regards,<br>The Email Outreach Bot Team</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Email Outreach Bot.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text for campaign completion email
   */
  private static generateCampaignCompletionText(
    campaignName: string, 
    totalEmails: number, 
    successCount: number
  ): string {
    const successRate = totalEmails > 0 ? Math.round((successCount / totalEmails) * 100) : 0;
    
    return `
Campaign Completed: ${campaignName}

Your campaign "${campaignName}" has been completed successfully!

Campaign Summary:
- Total Emails: ${totalEmails}
- Successfully Sent: ${successCount}
- Success Rate: ${successRate}%

View detailed analytics and performance metrics in your dashboard.

Best regards,
The Email Outreach Bot Team

---
This is an automated notification from Email Outreach Bot.
    `;
  }

  /**
   * Generate HTML for subscription expiry reminder
   */
  private static generateSubscriptionExpiryHTML(username: string, daysUntilExpiry: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Expires Soon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .cta { text-align: center; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Expires Soon</h1>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <div class="warning">
              <p><strong>Important:</strong> Your Email Outreach Bot subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.</p>
            </div>
            <p>To avoid any interruption to your email outreach campaigns, please renew your subscription before it expires.</p>
            <p>Current subscription benefits:</p>
            <ul>
              <li>AI-powered email generation</li>
              <li>Campaign management tools</li>
              <li>Performance analytics</li>
              <li>Priority support</li>
            </ul>
            <div class="cta">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscriptions" class="btn">Renew Subscription</a>
            </div>
            <p>If you have any questions about your subscription, please contact our support team.</p>
            <p>Best regards,<br>The Email Outreach Bot Team</p>
          </div>
          <div class="footer">
            <p>Thank you for using Email Outreach Bot!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text for subscription expiry reminder
   */
  private static generateSubscriptionExpiryText(username: string, daysUntilExpiry: number): string {
    return `
Subscription Expires Soon

Hello ${username},

IMPORTANT: Your Email Outreach Bot subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.

To avoid any interruption to your email outreach campaigns, please renew your subscription before it expires.

Current subscription benefits:
- AI-powered email generation
- Campaign management tools
- Performance analytics
- Priority support

Renew your subscription: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscriptions

If you have any questions about your subscription, please contact our support team.

Best regards,
The Email Outreach Bot Team

---
Thank you for using Email Outreach Bot!
    `;
  }

  /**
   * Send a single email using a bot
   */
  public static async sendEmail(
    botId: string,
    recipientEmail: string,
    subject: string,
    message: string,
    campaignId: string,
    generatedMessageId?: string
  ): Promise<ApiResponse<{ messageId: string; sentAt: Date }>> {
    try {
      // Get bot details
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot can send email
      if (!bot.canSendEmail()) {
        return {
          success: false,
          message: 'Bot has reached daily email limit',
          timestamp: new Date()
        };
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
        port: parseInt(process.env['SMTP_PORT'] || '587'),
        secure: false,
        auth: {
          user: bot.email,
          pass: bot.password // This should be decrypted
        }
      });

      // Save sent email record first to get the ID for tracking
      const sentEmail = new SentEmailModel({
        campaignId,
        botId,
        recipientEmail,
        message,
        status: EmailStatus.SENT,
        sentAt: new Date()
      });
      await sentEmail.save();

      // Add tracking pixel to the email content
      const trackingUrl = TrackingUtils.generateTrackingUrl(campaignId, (sentEmail._id as any).toString());
      const trackedMessage = TrackingUtils.addTrackingPixel(message, trackingUrl);

      // Send email
      const mailOptions = {
        from: bot.email,
        to: recipientEmail,
        subject: subject,
        html: trackedMessage,
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Bot-ID': botId,
          'X-Email-ID': (sentEmail._id as any).toString()
        }
      };

      const info = await transporter.sendMail(mailOptions);

      // Increment bot's daily email count
      await bot.incrementDailyEmailCount();

      // Mark generated message as sent if generatedMessageId is provided
      if (generatedMessageId) {
        try {
          const campaign = await CampaignModel.findById(campaignId);
          if (campaign) {
            await campaign.markMessageAsSent(recipientEmail);
            EmailService.logger.info('Generated message marked as sent', {
              campaignId,
              recipientEmail,
              generatedMessageId
            });
          }
        } catch (error) {
          EmailService.logger.warn('Failed to mark generated message as sent', {
            campaignId,
            recipientEmail,
            generatedMessageId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      EmailService.logger.info('Email sent successfully', {
        messageId: info.messageId,
        botId,
        recipientEmail,
        campaignId,
        emailId: (sentEmail._id as any),
        generatedMessageId
      });

      return {
        success: true,
        message: 'Email sent successfully',
        data: {
          messageId: info.messageId,
          sentAt: new Date()
        },
        timestamp: new Date()
      };
    } catch (error) {
      EmailService.logger.error('Error sending email:', error);

      // Save failed email record
      try {
        const sentEmail = new SentEmailModel({
          campaignId,
          botId,
          recipientEmail,
          message,
          status: EmailStatus.FAILED,
          sentAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        await sentEmail.save();
      } catch (saveError) {
        EmailService.logger.error('Error saving failed email record:', saveError);
      }

      return {
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Send multiple emails in bulk with rate limiting
   */
  public static async sendBulkEmails(
    botId: string,
    emails: Array<{ email: string; message: string }>,
    campaignId: string,
    subject: string,
    delayMs: number = 60000 // 1 minute delay between emails
  ): Promise<ApiResponse<{ sent: number; failed: number; total: number }>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      let sent = 0;
      let failed = 0;
      const total = emails.length;

      for (let i = 0; i < emails.length; i++) {
        const emailItem = emails[i];
        if (!emailItem) continue;
        const { email, message } = emailItem;

        // Check if bot can still send emails
        if (!bot.canSendEmail()) {
          EmailService.logger.warn('Bot reached daily limit during bulk send', { 
            botId, 
            sent, 
            failed, 
            remaining: emails.length - i 
          });
          break;
        }

        try {
          const result = await this.sendEmail(botId, email, subject, message, campaignId);
          if (result.success) {
            sent++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          EmailService.logger.error('Error sending email in bulk:', error);
        }

        // Add delay between emails (except for the last one)
        if (i < emails.length - 1) {
          await this.delay(delayMs);
        }
      }

      EmailService.logger.info('Bulk email sending completed', {
        botId,
        campaignId,
        sent,
        failed,
        total
      });

      return {
        success: true,
        message: 'Bulk email sending completed',
        data: { sent, failed, total },
        timestamp: new Date()
      };
    } catch (error) {
      EmailService.logger.error('Error in bulk email sending:', error);
      return {
        success: false,
        message: 'Bulk email sending failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Verify bot email credentials before creation
   */
  public static async verifyBotCredentials(email: string, password: string): Promise<ApiResponse<{ verified: boolean; message: string }>> {
    try {
      // Create transporter with the provided credentials
      const transporter = nodemailer.createTransport({
        host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
        port: parseInt(process.env['SMTP_PORT'] || '587'),
        secure: false,
        auth: {
          user: email,
          pass: password
        }
      });

      // Verify connection
      await transporter.verify();

      EmailService.logger.info('Bot credentials verification successful', { botEmail: email });

      return {
        success: true,
        message: 'Email credentials verified successfully',
        data: { verified: true, message: 'SMTP connection verified successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      EmailService.logger.error('Bot credentials verification failed:', error);

      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('Invalid login')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed - check your email and password';
        } else if (error.message.includes('Connection timeout')) {
          errorMessage = 'Connection timeout - check your internet connection';
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = 'SMTP server not found - check your email provider settings';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: 'Email verification failed',
        data: { 
          verified: false, 
          message: errorMessage
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Test bot SMTP connection
   */
  public static async testBotConnection(botId: string): Promise<ApiResponse<{ connected: boolean; message: string }>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
        port: parseInt(process.env['SMTP_PORT'] || '587'),
        secure: false,
        auth: {
          user: bot.email,
          pass: bot.password // This should be decrypted
        }
      });

      // Verify connection
      await transporter.verify();

      EmailService.logger.info('Bot connection test successful', { botId, botEmail: bot.email });

      return {
        success: true,
        message: 'Bot connection test successful',
        data: { connected: true, message: 'SMTP connection verified successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      EmailService.logger.error('Bot connection test failed:', error);

      return {
        success: false,
        message: 'Bot connection test failed',
        data: { 
          connected: false, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Get email statistics for a bot
   */
  public static async getEmailStats(botId: string, days: number = 30): Promise<ApiResponse<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalReplied: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    replyRate: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await SentEmailModel.getDeliveryStats(botId); // TODO: Fix this to use proper campaignId

      return {
        success: true,
        message: 'Email stats retrieved successfully',
        data: {
          totalSent: stats.total,
          totalDelivered: stats.delivered,
          totalOpened: stats.opened,
          totalReplied: stats.replied,
          totalFailed: stats.failed,
          deliveryRate: stats.deliveryRate,
          openRate: stats.openRate,
          replyRate: stats.replyRate
        },
        timestamp: new Date()
      };
    } catch (error) {
      EmailService.logger.error('Error getting email stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve email stats',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }



  /**
   * Utility method to add delay between operations
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
