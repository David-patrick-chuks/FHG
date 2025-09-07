import Bull from 'bull';
import CampaignModel from '../models/Campaign';
import QueueJobModel from '../models/QueueJob';
import { Logger } from '../utils/Logger';
import { BotService } from './BotService';
import { EmailExtractorService } from './EmailExtractorService';
import { EmailService } from './EmailService';

export class QueueService {
  private static logger: Logger = new Logger();
  private static emailQueue: Bull.Queue;
  private static isInitialized = false;

  public static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create email queue
      const redisConfig: any = {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6379')
      };
      
      if (process.env['REDIS_PASSWORD']) {
        redisConfig.password = process.env['REDIS_PASSWORD'];
      }

      this.emailQueue = new Bull('email-queue', {
        redis: redisConfig,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      });

      // Process jobs
      this.emailQueue.process('send-email', this.processEmailJob.bind(this));
      this.emailQueue.process('extract-emails', this.processEmailExtractionJob.bind(this));

      // Handle events
      this.emailQueue.on('completed', this.onJobCompleted.bind(this));
      this.emailQueue.on('failed', this.onJobFailed.bind(this));
      this.emailQueue.on('stalled', this.onJobStalled.bind(this));

      this.isInitialized = true;
      QueueService.logger.info('Queue service initialized successfully');
    } catch (error) {
      QueueService.logger.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  public static async addEmailJob(
    campaignId: string,
    botId: string,
    recipientEmail: string,
    message: string,
    priority: number = 1,
    scheduledFor?: Date
  ): Promise<Bull.Job> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const jobData = {
        campaignId,
        botId,
        recipientEmail,
        message,
        priority,
        scheduledFor: scheduledFor || new Date()
      };

      const job = await this.emailQueue.add('send-email', jobData, {
        priority,
        delay: scheduledFor ? scheduledFor.getTime() - Date.now() : 0,
        jobId: `${campaignId}-${botId}-${recipientEmail}-${Date.now()}`
      });

      QueueService.logger.info('Email job added to queue', {
        jobId: job.id,
        campaignId,
        botId,
        recipientEmail,
        priority,
        scheduledFor: jobData.scheduledFor
      });

      return job;
    } catch (error) {
      QueueService.logger.error('Error adding email job to queue:', error);
      throw error;
    }
  }

  public static async addBulkEmailJobs(
    campaignId: string,
    botId: string,
    emails: Array<{ email: string; message: string }>,
    delayBetweenEmails: number = 60000 // 1 minute
  ): Promise<Bull.Job[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const jobs: Bull.Job[] = [];
      const now = Date.now();

      for (let i = 0; i < emails.length; i++) {
        const emailItem = emails[i];
        if (!emailItem) continue;
        const { email, message } = emailItem;
        const scheduledFor = new Date(now + (i * delayBetweenEmails));

        const job = await this.addEmailJob(
          campaignId,
          botId,
          email,
          message,
          1,
          scheduledFor
        );

        jobs.push(job);
      }

      QueueService.logger.info('Bulk email jobs added to queue', {
        campaignId,
        botId,
        totalJobs: jobs.length,
        delayBetweenEmails
      });

      return jobs;
    } catch (error) {
      QueueService.logger.error('Error adding bulk email jobs to queue:', error);
      throw error;
    }
  }

  public static async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.emailQueue.getCompleted(),
        this.emailQueue.getFailed(),
        this.emailQueue.getDelayed()
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused: await this.emailQueue.isPaused()
      };
    } catch (error) {
      QueueService.logger.error('Error getting queue status:', error);
      throw error;
    }
  }

  public static async pauseQueue(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.emailQueue.pause();
      QueueService.logger.info('Email queue paused');
    } catch (error) {
      QueueService.logger.error('Error pausing queue:', error);
    }
  }

  public static async resumeQueue(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.emailQueue.resume();
      QueueService.logger.info('Email queue resumed');
    } catch (error) {
      QueueService.logger.error('Error resuming queue:', error);
    }
  }

  public static async clearQueue(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.emailQueue.empty();
      QueueService.logger.info('Email queue cleared');
    } catch (error) {
      QueueService.logger.error('Error clearing queue:', error);
    }
  }

  public static async getJobById(jobId: string): Promise<Bull.Job | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.emailQueue.getJob(jobId);
    } catch (error) {
      QueueService.logger.error('Error getting job by ID:', error);
      return null;
    }
  }

  public static async removeJob(jobId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const job = await this.emailQueue.getJob(jobId);
      if (job) {
        await job.remove();
        QueueService.logger.info('Job removed from queue', { jobId });
      }
    } catch (error) {
      QueueService.logger.error('Error removing job:', error);
      throw error;
    }
  }

  public static async getJobsByCampaign(campaignId: string): Promise<Bull.Job[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const jobs = await this.emailQueue.getJobs(['waiting', 'active', 'delayed']);
      return jobs.filter(job => job.data.campaignId === campaignId);
    } catch (error) {
      QueueService.logger.error('Error getting jobs by campaign:', error);
      return [];
    }
  }

  public static async getJobsByBot(botId: string): Promise<Bull.Job[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const jobs = await this.emailQueue.getJobs(['waiting', 'active', 'delayed']);
      return jobs.filter(job => job.data.botId === botId);
    } catch (error) {
      QueueService.logger.error('Error getting jobs by bot:', error);
      return [];
    }
  }

  public static async addEmailExtractionJob(jobData: {
    jobId: string;
    userId: string;
    urls: string[];
  }): Promise<Bull.Job> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const job = await this.emailQueue.add('extract-emails', jobData, {
        priority: 1,
        jobId: jobData.jobId,
        attempts: 1, // Email extraction jobs should only run once
        backoff: {
          type: 'fixed',
          delay: 5000
        }
      });

      QueueService.logger.info('Email extraction job added to queue', {
        jobId: job.id,
        userId: jobData.userId,
        urlCount: jobData.urls.length
      });

      return job;
    } catch (error) {
      QueueService.logger.error('Error adding email extraction job to queue:', error);
      throw error;
    }
  }

  private static async processEmailJob(job: Bull.Job): Promise<void> {
    const { campaignId, botId, recipientEmail, message } = job.data;
    
    try {
      QueueService.logger.info('Processing email job', {
        jobId: job.id,
        campaignId,
        botId,
        recipientEmail
      });

      // Check if bot can send email
      const canSend = await BotService.canBotSendEmail(botId);
      if (!canSend) {
        throw new Error('Bot has reached daily email limit');
      }

      // Get campaign to extract subject
      let emailSubject = 'Campaign Email'; // Fallback subject
      try {
        const campaign = await CampaignModel.findById(campaignId);
        if (campaign) {
          emailSubject = campaign.name;
        }
      } catch (error) {
        QueueService.logger.warn('Could not fetch campaign for subject, using fallback', {
          campaignId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Send email
      const result = await EmailService.sendEmail(
        botId,
        recipientEmail,
        emailSubject,
        message,
        campaignId
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to send email');
      }

      // Update queue job status
      await this.updateQueueJobStatus(job.id.toString(), 'completed');

      QueueService.logger.info('Email job completed successfully', {
        jobId: job.id,
        campaignId,
        botId,
        recipientEmail
      });
    } catch (error) {
      QueueService.logger.error('Email job failed:', error);

      // Update queue job status
      await this.updateQueueJobStatus(job.id.toString(), 'failed', error instanceof Error ? error.message : 'Unknown error');

      // Re-throw error to mark job as failed
      throw error;
    }
  }

  private static async processEmailExtractionJob(job: Bull.Job): Promise<void> {
    const { jobId, userId, urls } = job.data;
    
    try {
      QueueService.logger.info('Processing email extraction job', {
        jobId: job.id,
        extractionJobId: jobId,
        userId,
        urlCount: urls.length
      });

      // Process the email extraction
      await EmailExtractorService.processExtractionJob({
        jobId,
        userId,
        urls
      });

      QueueService.logger.info('Email extraction job completed successfully', {
        jobId: job.id,
        extractionJobId: jobId,
        userId
      });
    } catch (error) {
      QueueService.logger.error('Email extraction job failed:', error);

      // Re-throw error to mark job as failed
      throw error;
    }
  }

  private static async onJobCompleted(job: Bull.Job, result: any): Promise<void> {
    QueueService.logger.info('Job completed', {
      jobId: job.id,
      jobType: job.name,
      result
    });
  }

  private static async onJobFailed(job: Bull.Job, error: Error): Promise<void> {
    QueueService.logger.error('Job failed', {
      jobId: job.id,
      jobType: job.name,
      error: error.message,
      attempts: job.attemptsMade
    });
  }

  private static async onJobStalled(job: Bull.Job): Promise<void> {
    QueueService.logger.warn('Job stalled', {
      jobId: job.id,
      jobType: job.name
    });
  }

  private static async updateQueueJobStatus(jobId: string, status: string, errorMessage?: string): Promise<void> {
    try {
      // Find and update the corresponding queue job in database
      const queueJob = await QueueJobModel.findOne({ _id: jobId });
      if (queueJob) {
        if (status === 'completed') {
          await queueJob.markAsCompleted();
        } else if (status === 'failed') {
          await queueJob.markAsFailed(errorMessage || 'Unknown error');
        }
      }
    } catch (error) {
      QueueService.logger.error('Error updating queue job status in database:', error);
    }
  }

  public static async cleanup(): Promise<void> {
    try {
      if (this.emailQueue) {
        await this.emailQueue.close();
        this.isInitialized = false;
        QueueService.logger.info('Queue service cleaned up successfully');
      }
    } catch (error) {
      QueueService.logger.error('Error cleaning up queue service:', error);
    }
  }
}
