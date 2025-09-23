import nodemailer from 'nodemailer';
import { Logger } from '../../utils/Logger';
import { EmailTemplates } from './EmailTemplates';

/**
 * System email service
 * Handles system emails like welcome, notifications, password resets, etc.
 */
export class SystemEmailService {
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
        SystemEmailService.logger.info('Email transporter configured successfully');
      } catch (error) {
        SystemEmailService.logger.error('Email transporter configuration failed:', error);
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
      SystemEmailService.logger.info('Simple email sent successfully', { to, subject });
    } catch (error) {
      SystemEmailService.logger.error('Failed to send simple email:', error);
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
        from: `"MAILQUILL TEAM" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_AUTH_USER || 'noreply@mailquill.com'}>`,
        to: email,
        subject: 'Password Reset - Email Outreach Bot',
        html: EmailTemplates.generatePasswordResetLinkHTML(username, resetLink),
        text: EmailTemplates.generatePasswordResetLinkText(username, resetLink)
      };

      await transporter.sendMail(mailOptions);
      SystemEmailService.logger.info('Password reset link email sent successfully', { email });
    } catch (error) {
      SystemEmailService.logger.error('Failed to send password reset link email:', error);
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
        from: `"MAILQUILL TEAM" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_AUTH_USER || 'noreply@mailquill.com'}>`,
        to: email,
        subject: `Campaign Completed: ${campaignName}`,
        html: EmailTemplates.generateCampaignCompletionHTML(campaignName, totalEmails, successCount),
        text: EmailTemplates.generateCampaignCompletionText(campaignName, totalEmails, successCount)
      };

      await transporter.sendMail(mailOptions);
      SystemEmailService.logger.info('Campaign completion email sent successfully', { email, campaignName });
    } catch (error) {
      SystemEmailService.logger.error('Failed to send campaign completion email:', error);
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
        from: `"MAILQUILL TEAM" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_AUTH_USER || 'noreply@mailquill.com'}>`,
        to: email,
        subject: `Subscription Expires in ${daysUntilExpiry} Days`,
        html: EmailTemplates.generateSubscriptionExpiryHTML(username, daysUntilExpiry),
        text: EmailTemplates.generateSubscriptionExpiryText(username, daysUntilExpiry)
      };

      await transporter.sendMail(mailOptions);
      SystemEmailService.logger.info('Subscription expiry reminder sent successfully', { email, daysUntilExpiry });
    } catch (error) {
      SystemEmailService.logger.error('Failed to send subscription expiry reminder:', error);
      throw new Error('Failed to send subscription expiry reminder');
    }
  }
}
