import nodemailer from 'nodemailer';
import BotModel from '../../models/Bot';
import SentEmailModel from '../../models/SentEmail';
import { ApiResponse } from '../../types';
import { Logger } from '../../utils/Logger';

/**
 * Email verification and testing service
 * Handles bot credential verification and connection testing
 */
export class EmailVerification {
  private static logger: Logger = new Logger();

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

      EmailVerification.logger.info('Bot credentials verification successful', { botEmail: email });

      return {
        success: true,
        message: 'Email credentials verified successfully',
        data: { verified: true, message: 'SMTP connection verified successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      EmailVerification.logger.error('Bot credentials verification failed:', error);

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

      EmailVerification.logger.info('Bot connection test successful', { botId, botEmail: bot.email });

      return {
        success: true,
        message: 'Bot connection test successful',
        data: { connected: true, message: 'SMTP connection verified successfully' },
        timestamp: new Date()
      };
    } catch (error) {
      EmailVerification.logger.error('Bot connection test failed:', error);

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

      // Import Campaign model to get campaigns for this bot
      const CampaignModel = await import('../../models/Campaign');
      
      // Get all campaigns that use this bot
      const campaigns = await CampaignModel.default.find({ botId });
      const campaignIds = campaigns.map(campaign => (campaign._id as any).toString());

      if (campaignIds.length === 0) {
        return {
          success: true,
          message: 'Email stats retrieved successfully',
          data: {
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalReplied: 0,
            totalFailed: 0,
            deliveryRate: 0,
            openRate: 0,
            replyRate: 0
          },
          timestamp: new Date()
        };
      }

      // Get aggregated stats for all campaigns using this bot
      const aggregateStats = await SentEmailModel.aggregate([
        {
          $match: {
            campaignId: { $in: campaignIds },
            sentAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalSent: { $sum: 1 },
            totalDelivered: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['delivered', 'opened', 'replied']] },
                  1,
                  0
                ]
              }
            },
            totalOpened: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['opened', 'replied']] },
                  1,
                  0
                ]
              }
            },
            totalReplied: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'replied'] },
                  1,
                  0
                ]
              }
            },
            totalFailed: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['failed', 'bounced']] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const stats = aggregateStats[0] || { 
        totalSent: 0, 
        totalDelivered: 0, 
        totalOpened: 0, 
        totalReplied: 0, 
        totalFailed: 0 
      };

      const deliveryRate = stats.totalSent > 0 ? Math.round((stats.totalDelivered / stats.totalSent) * 100) : 0;
      const openRate = stats.totalDelivered > 0 ? Math.round((stats.totalOpened / stats.totalDelivered) * 100) : 0;
      const replyRate = stats.totalDelivered > 0 ? Math.round((stats.totalReplied / stats.totalDelivered) * 100) : 0;

      return {
        success: true,
        message: 'Email stats retrieved successfully',
        data: {
          totalSent: stats.totalSent,
          totalDelivered: stats.totalDelivered,
          totalOpened: stats.totalOpened,
          totalReplied: stats.totalReplied,
          totalFailed: stats.totalFailed,
          deliveryRate,
          openRate,
          replyRate
        },
        timestamp: new Date()
      };
    } catch (error) {
      EmailVerification.logger.error('Error getting email stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve email stats',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}
