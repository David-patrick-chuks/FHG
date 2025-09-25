import nodemailer from 'nodemailer';
import BotModel from '../../models/Bot';
import CampaignModel from '../../models/Campaign';
import SentEmailModel from '../../models/SentEmail';
import { ApiResponse, EmailStatus } from '../../types';
import { Logger } from '../../utils/Logger';
import { TrackingUtils } from '../../utils/TrackingUtils';

/**
 * Email sending service
 * Handles individual and bulk email sending operations
 */
export class EmailSender {
  private static logger: Logger = new Logger();

  /**
   * Send a single email using a bot
   */
  public static async sendEmail(
    botId: string,
    recipientEmail: string,
    subject: string,
    message: string,
    campaignId: string,
    generatedMessageId?: string,
    senderName?: string
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
      const canSend = await bot.canSendEmail();
      if (!canSend) {
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
        subject,
        message,
        status: EmailStatus.SENT,
        sentAt: new Date()
      });
      await sentEmail.save();

      // Add tracking pixel to the email content
      const trackingUrl = TrackingUtils.generateTrackingUrl(campaignId, (sentEmail._id as any).toString());
      const trackedMessage = TrackingUtils.addTrackingPixel(message, trackingUrl);

      // Send email
      const fromAddress = senderName ? `${senderName} <${bot.email}>` : bot.email;
      const mailOptions = {
        from: fromAddress,
        to: recipientEmail,
        subject: subject,
        html: trackedMessage,
        headers: {
          // Keep internal tracking headers for our system
          'X-Campaign-ID': campaignId,
          'X-Bot-ID': botId,
          'X-Email-ID': (sentEmail._id as any).toString(),
          // Add legitimate-looking headers
          'List-Unsubscribe': `<mailto:unsubscribe@${bot.email.split('@')[1]}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Mailer': 'MailQuill Email Marketing Platform',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal'
        }
      };

      const info = await transporter.sendMail(mailOptions);

      // Increment bot's daily email count
      await bot.incrementDailyEmailCount();

      // Mark generated message as sent and add to campaign's sentEmails array
      if (generatedMessageId) {
        try {
          const campaign = await CampaignModel.findById(campaignId);
          if (campaign) {
            await campaign.markMessageAsSent(recipientEmail);
            await campaign.addSentEmail({
              ...sentEmail.toObject(),
              _id: (sentEmail._id as any).toString()
            });
            EmailSender.logger.info('Generated message marked as sent', {
              campaignId,
              recipientEmail,
              generatedMessageId
            });
          }
        } catch (error) {
          EmailSender.logger.warn('Failed to mark generated message as sent', {
            campaignId,
            recipientEmail,
            generatedMessageId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        // Even if no generatedMessageId is provided, we should still try to mark the message as sent
        // This handles cases where the email is sent directly without going through the generation process
        try {
          const campaign = await CampaignModel.findById(campaignId);
          if (campaign) {
            await campaign.markMessageAsSent(recipientEmail);
            await campaign.addSentEmail({
              ...sentEmail.toObject(),
              _id: (sentEmail._id as any).toString()
            });
            EmailSender.logger.info('Message marked as sent (no generatedMessageId)', {
              campaignId,
              recipientEmail
            });
          }
        } catch (error) {
          EmailSender.logger.warn('Failed to mark message as sent (no generatedMessageId)', {
            campaignId,
            recipientEmail,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      EmailSender.logger.info('Email sent successfully', {
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
      EmailSender.logger.error('Error sending email:', error);

      // Save failed email record
      try {
        const sentEmail = new SentEmailModel({
          campaignId,
          botId,
          recipientEmail,
          subject,
          message,
          status: EmailStatus.FAILED,
          sentAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        await sentEmail.save();
      } catch (saveError) {
        EmailSender.logger.error('Error saving failed email record:', saveError);
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
        const canStillSend = await bot.canSendEmail();
        if (!canStillSend) {
          EmailSender.logger.warn('Bot reached daily limit during bulk send', { 
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
          EmailSender.logger.error('Error sending email in bulk:', error);
        }

        // Add delay between emails (except for the last one)
        if (i < emails.length - 1) {
          await this.delay(delayMs);
        }
      }

      EmailSender.logger.info('Bulk email sending completed', {
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
      EmailSender.logger.error('Error in bulk email sending:', error);
      return {
        success: false,
        message: 'Bulk email sending failed',
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
