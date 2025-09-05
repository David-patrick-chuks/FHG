import nodemailer from 'nodemailer';
import BotModel from '../models/Bot';
import SentEmailModel from '../models/SentEmail';
import { ApiResponse, EmailStatus } from '../types';
import { Logger } from '../utils/Logger';
import { TrackingUtils } from '../utils/TrackingUtils';
import { AIService } from './AIService';

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
        this.logger.info('Email transporter configured successfully');
      } catch (error) {
        this.logger.error('Email transporter configuration failed:', error);
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
        from: `"FHG AI Bot" <${process.env.SMTP_AUTH_USER || 'noreply@fhgaibot.com'}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
      };

      await transporter.sendMail(mailOptions);
      this.logger.info('Simple email sent successfully', { to, subject });
    } catch (error) {
      this.logger.error('Failed to send simple email:', error);
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
      this.logger.info('Password reset link email sent successfully', { email });
    } catch (error) {
      this.logger.error('Failed to send password reset link email:', error);
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
      this.logger.info('Campaign completion email sent successfully', { email, campaignName });
    } catch (error) {
      this.logger.error('Failed to send campaign completion email:', error);
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
      this.logger.info('Subscription expiry reminder sent successfully', { email, daysUntilExpiry });
    } catch (error) {
      this.logger.error('Failed to send subscription expiry reminder:', error);
      throw new Error('Failed to send subscription expiry reminder');
    }
  }

  /**
   * Generate HTML for password reset link email
   */
  private static generatePasswordResetLinkHTML(username: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .cta { text-align: center; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <p>We received a request to reset your password for your Email Outreach Bot account.</p>
            <p>Click the button below to reset your password:</p>
            <div class="cta">
              <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p>Best regards,<br>The Email Outreach Bot Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
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
Password Reset - Email Outreach Bot

Hello ${username},

We received a request to reset your password for your Email Outreach Bot account.

Click the link below to reset your password:
${resetLink}

IMPORTANT: This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email or contact our support team immediately.

Best regards,
The Email Outreach Bot Team

---
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
    campaignId: string
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

      this.logger.info('Email sent successfully', {
        messageId: info.messageId,
        botId,
        recipientEmail,
        campaignId,
        emailId: (sentEmail._id as any)
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
      this.logger.error('Error sending email:', error);

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
        this.logger.error('Error saving failed email record:', saveError);
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
          this.logger.warn('Bot reached daily limit during bulk send', { 
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
          this.logger.error('Error sending email in bulk:', error);
        }

        // Add delay between emails (except for the last one)
        if (i < emails.length - 1) {
          await this.delay(delayMs);
        }
      }

      this.logger.info('Bulk email sending completed', {
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
      this.logger.error('Error in bulk email sending:', error);
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

      this.logger.info('Bot credentials verification successful', { botEmail: email });

      return {
        success: true,
        message: 'Email credentials verified successfully',
        data: { verified: true, message: 'SMTP connection verified successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Bot credentials verification failed:', error);

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

      this.logger.info('Bot connection test successful', { botId, botEmail: bot.email });

      return {
        success: true,
        message: 'Bot connection test successful',
        data: { connected: true, message: 'SMTP connection verified successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Bot connection test failed:', error);

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
      this.logger.error('Error getting email stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve email stats',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate AI-powered email messages using AIService
   */
  public static async generateAIMessages(
    prompt: string,
    count: number = 3
  ): Promise<ApiResponse<string[]>> {
    try {
      const result = await AIService.generateEmailMessages(prompt, count);
      
      if (result.success && result.data) {
        this.logger.info('AI messages generated successfully', {
          prompt,
          count,
          generatedCount: result.data.length
        });
        
        return {
          success: true,
          message: 'AI messages generated successfully',
          data: result.data,
          timestamp: new Date()
        };
      } else {
        this.logger.error('Failed to generate AI messages', {
          prompt,
          count,
          error: result.message
        });
        
        return {
          success: false,
          message: result.message || 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }
    } catch (error) {
      this.logger.error('Error generating AI messages:', error);
      
      return {
        success: false,
        message: 'Failed to generate AI messages',
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
