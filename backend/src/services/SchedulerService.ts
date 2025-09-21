import CampaignModel from '../models/Campaign';
import { CampaignStatus } from '../types';
import { Logger } from '../utils/Logger';
import { CampaignService } from './CampaignService';

export class SchedulerService {
  private static logger: Logger = new Logger();
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

  public static async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    // Only log scheduler start in debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      this.logger.debug('Scheduler service started');
    }

    // Check for scheduled campaigns every minute
    this.intervalId = setInterval(async () => {
      try {
        await this.processScheduledCampaigns();
        // Clean up sent messages every hour (60 minutes)
        if (Date.now() % (60 * 60 * 1000) < 60000) {
          await CampaignService.cleanupSentMessages();
        }
      } catch (error) {
        this.logger.error('Error processing scheduled campaigns:', error);
      }
    }, 60000); // Check every minute

    // Process immediately on start
    await this.processScheduledCampaigns();
  }

  public static async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.logger.info('Scheduler service stopped');
  }

  private static async processScheduledCampaigns(): Promise<void> {
    try {
      const now = new Date();
      
      // Find campaigns that are scheduled and ready to start
      const scheduledCampaigns = await CampaignModel.find({
        status: CampaignStatus.SCHEDULED,
        isScheduled: true,
        scheduledFor: { $lte: now }
      });

      // Only log campaign count in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        this.logger.debug(`Found ${scheduledCampaigns.length} campaigns ready to start`);
      }

      for (const campaign of scheduledCampaigns) {
        try {
          // Only log campaign start in debug mode
          if (process.env.LOG_LEVEL === 'debug') {
            this.logger.debug(`Starting scheduled campaign: ${campaign.name} (${campaign._id})`);
          }
          
          // Start the campaign
          const result = await CampaignService.startCampaign(
            String(campaign._id),
            campaign.userId
          );

          if (result.success) {
            // Only log campaign start in debug mode
            if (process.env.LOG_LEVEL === 'debug') {
              this.logger.debug(`Successfully started scheduled campaign: ${campaign.name}`);
            }
          } else {
            this.logger.error(`Failed to start scheduled campaign: ${campaign.name}`, {
              error: result.message
            });
          }
        } catch (error) {
          this.logger.error(`Error starting scheduled campaign: ${campaign.name}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error processing scheduled campaigns:', error);
    }
  }

  public static async getScheduledCampaigns(): Promise<any[]> {
    try {
      const now = new Date();
      
      return await CampaignModel.find({
        status: CampaignStatus.SCHEDULED,
        isScheduled: true,
        scheduledFor: { $gt: now }
      }).sort({ scheduledFor: 1 });
    } catch (error) {
      this.logger.error('Error getting scheduled campaigns:', error);
      return [];
    }
  }

  public static async cancelScheduledCampaign(campaignId: string): Promise<boolean> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return false;
      }

      if (campaign.isScheduled && campaign.status === CampaignStatus.SCHEDULED) {
        campaign.isScheduled = false;
        campaign.scheduledFor = undefined;
        await campaign.save();
        
        this.logger.info(`Cancelled scheduled campaign: ${campaign.name}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error cancelling scheduled campaign:', error);
      return false;
    }
  }
}