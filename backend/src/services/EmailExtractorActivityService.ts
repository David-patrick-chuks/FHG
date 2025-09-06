import { ActivityService } from './ActivityService';
import { ActivityType } from '../models/Activity';
import { Logger } from '../utils/Logger';

export class EmailExtractorActivityService {
  private static logger = new Logger();

  /**
   * Log email extraction started activity
   */
  public static async logExtractionStarted(
    userId: string,
    jobId: string,
    urlCount: number,
    urls: string[],
    extractionType: 'single' | 'multiple' | 'csv'
  ): Promise<void> {
    try {
      const activityType = this.getExtractionStartedType(extractionType);
      const title = 'Email extraction started';
      const description = `Email extraction job has been started for ${urlCount} URL${urlCount > 1 ? 's' : ''}.`;
      
      await ActivityService.createActivity(
        userId,
        activityType,
        title,
        description,
        {
          jobId,
          urlCount,
          urls: urls.slice(0, 10), // Store only first 10 URLs to avoid large metadata
          extractionType,
          totalUrls: urls.length
        }
      );

      this.logger.info(`Email extraction started logged for user ${userId}, job ${jobId}`);
    } catch (error) {
      this.logger.error('Error logging extraction started activity:', error);
    }
  }

  /**
   * Log email extraction completed activity
   */
  public static async logExtractionCompleted(
    userId: string,
    jobId: string,
    totalEmails: number,
    successfulUrls: number,
    failedUrls: number,
    extractionType: 'single' | 'multiple' | 'csv'
  ): Promise<void> {
    try {
      const activityType = this.getExtractionCompletedType(extractionType);
      const title = 'Email extraction completed';
      const description = `Email extraction completed successfully. Found ${totalEmails} email${totalEmails > 1 ? 's' : ''} from ${successfulUrls} URL${successfulUrls > 1 ? 's' : ''}.`;
      
      await ActivityService.createActivity(
        userId,
        activityType,
        title,
        description,
        {
          jobId,
          totalEmails,
          successfulUrls,
          failedUrls,
          extractionType,
          successRate: successfulUrls > 0 ? Math.round((successfulUrls / (successfulUrls + failedUrls)) * 100) : 0
        }
      );

      this.logger.info(`Email extraction completed logged for user ${userId}, job ${jobId}`);
    } catch (error) {
      this.logger.error('Error logging extraction completed activity:', error);
    }
  }

  /**
   * Log email extraction failed activity
   */
  public static async logExtractionFailed(
    userId: string,
    jobId: string,
    error: string,
    failedUrls: string[],
    extractionType: 'single' | 'multiple' | 'csv'
  ): Promise<void> {
    try {
      const activityType = this.getExtractionFailedType(extractionType);
      const title = 'Email extraction failed';
      const description = `Email extraction job failed due to ${error}.`;
      
      await ActivityService.createActivity(
        userId,
        activityType,
        title,
        description,
        {
          jobId,
          error,
          failedUrls: failedUrls.slice(0, 10), // Store only first 10 URLs
          extractionType,
          totalFailedUrls: failedUrls.length
        }
      );

      this.logger.info(`Email extraction failed logged for user ${userId}, job ${jobId}`);
    } catch (error) {
      this.logger.error('Error logging extraction failed activity:', error);
    }
  }

  /**
   * Log email extraction cancelled activity
   */
  public static async logExtractionCancelled(
    userId: string,
    jobId: string,
    urlsProcessed: number,
    extractionType: 'single' | 'multiple' | 'csv'
  ): Promise<void> {
    try {
      const title = 'Email extraction cancelled';
      const description = `Email extraction job was cancelled after processing ${urlsProcessed} URL${urlsProcessed > 1 ? 's' : ''}.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_CANCELLED,
        title,
        description,
        {
          jobId,
          urlsProcessed,
          extractionType
        }
      );

      this.logger.info(`Email extraction cancelled logged for user ${userId}, job ${jobId}`);
    } catch (error) {
      this.logger.error('Error logging extraction cancelled activity:', error);
    }
  }

  /**
   * Log results downloaded activity
   */
  public static async logResultsDownloaded(
    userId: string,
    jobId: string,
    emailCount: number,
    format: 'csv' | 'json' | 'txt'
  ): Promise<void> {
    try {
      const title = 'Results downloaded';
      const description = `Downloaded email extraction results as ${format.toUpperCase()}.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_RESULTS_DOWNLOADED,
        title,
        description,
        {
          jobId,
          emailCount,
          format
        }
      );

      this.logger.info(`Results downloaded logged for user ${userId}, job ${jobId}`);
    } catch (error) {
      this.logger.error('Error logging results downloaded activity:', error);
    }
  }

  /**
   * Log results viewed activity
   */
  public static async logResultsViewed(
    userId: string,
    jobId: string,
    emailCount: number
  ): Promise<void> {
    try {
      const title = 'Results viewed';
      const description = `Viewed email extraction results.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_RESULTS_VIEWED,
        title,
        description,
        {
          jobId,
          emailCount
        }
      );

      this.logger.info(`Results viewed logged for user ${userId}, job ${jobId}`);
    } catch (error) {
      this.logger.error('Error logging results viewed activity:', error);
    }
  }

  /**
   * Log limit reached activity
   */
  public static async logLimitReached(
    userId: string,
    limit: number,
    used: number,
    resetTime: Date,
    limitType: 'daily' | 'monthly'
  ): Promise<void> {
    try {
      const title = 'Extraction limit reached';
      const description = `You've reached your ${limitType} extraction limit of ${limit} URLs.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_LIMIT_REACHED,
        title,
        description,
        {
          limit,
          used,
          resetTime,
          limitType
        }
      );

      this.logger.info(`Limit reached logged for user ${userId}`);
    } catch (error) {
      this.logger.error('Error logging limit reached activity:', error);
    }
  }

  /**
   * Log invalid URLs activity
   */
  public static async logInvalidUrls(
    userId: string,
    invalidUrls: string[],
    validUrls: string[]
  ): Promise<void> {
    try {
      const title = 'Invalid URLs detected';
      const description = `${invalidUrls.length} invalid URL${invalidUrls.length > 1 ? 's' : ''} were skipped from extraction.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_INVALID_URL,
        title,
        description,
        {
          invalidUrls: invalidUrls.slice(0, 10), // Store only first 10 URLs
          validUrls: validUrls.slice(0, 10),
          totalInvalidUrls: invalidUrls.length,
          totalValidUrls: validUrls.length
        }
      );

      this.logger.info(`Invalid URLs logged for user ${userId}`);
    } catch (error) {
      this.logger.error('Error logging invalid URLs activity:', error);
    }
  }

  /**
   * Log rate limited activity
   */
  public static async logRateLimited(
    userId: string,
    retryAfter: number,
    urlsRemaining: number
  ): Promise<void> {
    try {
      const title = 'Rate limited';
      const description = `Extraction temporarily paused due to rate limiting. Retry after ${retryAfter} seconds.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_RATE_LIMITED,
        title,
        description,
        {
          retryAfter,
          urlsRemaining
        }
      );

      this.logger.info(`Rate limited logged for user ${userId}`);
    } catch (error) {
      this.logger.error('Error logging rate limited activity:', error);
    }
  }

  /**
   * Log performance alert activity
   */
  public static async logPerformanceAlert(
    userId: string,
    avgTimePerUrl: number,
    totalTime: number,
    urlCount: number
  ): Promise<void> {
    try {
      const title = 'Slow extraction detected';
      const description = `Extraction is taking longer than expected. Average time per URL: ${avgTimePerUrl}s.`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_PERFORMANCE_ALERT,
        title,
        description,
        {
          avgTimePerUrl,
          totalTime,
          urlCount
        }
      );

      this.logger.info(`Performance alert logged for user ${userId}`);
    } catch (error) {
      this.logger.error('Error logging performance alert activity:', error);
    }
  }

  /**
   * Log extraction method used activity
   */
  public static async logMethodUsed(
    userId: string,
    method: string,
    url: string,
    success: boolean,
    emailsFound: number
  ): Promise<void> {
    try {
      const title = 'Extraction method used';
      const description = `Used ${method} for ${url}. ${success ? `Found ${emailsFound} email${emailsFound > 1 ? 's' : ''}.` : 'No emails found.'}`;
      
      await ActivityService.createActivity(
        userId,
        ActivityType.EMAIL_EXTRACTION_METHOD_USED,
        title,
        description,
        {
          method,
          url,
          success,
          emailsFound
        }
      );

      this.logger.info(`Method used logged for user ${userId}, method: ${method}`);
    } catch (error) {
      this.logger.error('Error logging method used activity:', error);
    }
  }

  /**
   * Get the appropriate activity type for extraction started
   */
  private static getExtractionStartedType(extractionType: 'single' | 'multiple' | 'csv'): ActivityType {
    switch (extractionType) {
      case 'single':
        return ActivityType.EMAIL_EXTRACTION_SINGLE_URL;
      case 'multiple':
        return ActivityType.EMAIL_EXTRACTION_MULTIPLE_URLS;
      case 'csv':
        return ActivityType.EMAIL_EXTRACTION_CSV_UPLOAD;
      default:
        return ActivityType.EMAIL_EXTRACTION_STARTED;
    }
  }

  /**
   * Get the appropriate activity type for extraction completed
   */
  private static getExtractionCompletedType(extractionType: 'single' | 'multiple' | 'csv'): ActivityType {
    switch (extractionType) {
      case 'single':
        return ActivityType.EMAIL_EXTRACTION_SINGLE_URL;
      case 'multiple':
        return ActivityType.EMAIL_EXTRACTION_MULTIPLE_URLS;
      case 'csv':
        return ActivityType.EMAIL_EXTRACTION_CSV_UPLOAD;
      default:
        return ActivityType.EMAIL_EXTRACTION_COMPLETED;
    }
  }

  /**
   * Get the appropriate activity type for extraction failed
   */
  private static getExtractionFailedType(extractionType: 'single' | 'multiple' | 'csv'): ActivityType {
    switch (extractionType) {
      case 'single':
        return ActivityType.EMAIL_EXTRACTION_SINGLE_URL;
      case 'multiple':
        return ActivityType.EMAIL_EXTRACTION_MULTIPLE_URLS;
      case 'csv':
        return ActivityType.EMAIL_EXTRACTION_CSV_UPLOAD;
      default:
        return ActivityType.EMAIL_EXTRACTION_FAILED;
    }
  }
}
