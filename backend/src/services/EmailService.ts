import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import BotModel from '../models/Bot';
import SentEmailModel from '../models/SentEmail';
import { ApiResponse, EmailStatus } from '../types';
import { Logger } from '../utils/Logger';

export class EmailService {
  private static logger: Logger = new Logger();
  private static genAI: GoogleGenerativeAI;

  static {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  public static async generateAIMessages(prompt: string, count: number = 20): Promise<ApiResponse<string[]>> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const fullPrompt = `
        Generate ${count} unique, professional email outreach messages based on the following prompt:
        
        "${prompt}"
        
        Requirements:
        - Each message should be different and unique
        - Keep messages professional and engaging
        - Length: 100-200 words
        - Include a clear call-to-action
        - Avoid spam-like language
        - Make each message feel personal and authentic
        
        Format each message as a separate paragraph. Return only the messages, one per line.
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Split the response into individual messages
      const messages = text
        .split('\n')
        .map(msg => msg.trim())
        .filter(msg => msg.length > 50) // Filter out very short messages
        .slice(0, count);

      if (messages.length === 0) {
        return {
          success: false,
          message: 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }

      this.logger.info('AI messages generated successfully', { 
        count: messages.length, 
        promptLength: prompt.length 
      });

      return {
        success: true,
        message: `${messages.length} AI messages generated successfully`,
        data: messages,
        timestamp: new Date()
      };
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
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: bot.email,
          pass: bot.password // This should be decrypted
        }
      });

      // Send email
      const mailOptions = {
        from: bot.email,
        to: recipientEmail,
        subject: subject,
        html: message,
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Bot-ID': botId
        }
      };

      const info = await transporter.sendMail(mailOptions);

      // Increment bot's daily email count
      await bot.incrementDailyEmailCount();

      // Save sent email record
      const sentEmail = new SentEmailModel({
        campaignId,
        botId,
        recipientEmail,
        message,
        status: EmailStatus.SENT,
        sentAt: new Date()
      });
      await sentEmail.save();

      this.logger.info('Email sent successfully', {
        messageId: info.messageId,
        botId,
        recipientEmail,
        campaignId
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
        const { email, message } = emails[i];

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
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
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

      const stats = await SentEmailModel.getDeliveryStats(botId);

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

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
