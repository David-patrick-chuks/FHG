import { EmailExtractionModel, IEmailExtractionDocument } from '../../models/EmailExtractor';
import { ApiResponse, ExtractionStatus } from '../../types';
import { Logger } from '../../utils/Logger';
import { EmailExtractorActivityService } from '../EmailExtractorActivityService';
import { QueueService } from '../QueueService';
import { SubscriptionLimitsService } from '../SubscriptionLimitsService';
import { EmailParser } from './EmailParser';
import { HtmlFetcher } from './HtmlFetcher';
import { LinkExtractor } from './LinkExtractor';
import { PuppeteerExtractor } from './PuppeteerExtractor';
import { SocialMediaExtractor } from './SocialMediaExtractor';
import { UrlUtils } from './UrlUtils';
import { WhoisExtractor } from './WhoisExtractor';

export class EmailExtractorCore {
  private static logger: Logger = new Logger();

  /**
   * Start email extraction job
   */
  public static async startExtraction(
    userId: string,
    urls: string[],
    extractionType: 'single' | 'multiple' | 'csv' = 'multiple'
  ): Promise<ApiResponse<{ jobId: string }>> {
    try {
      // Only log extraction start in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('EmailExtractorCore.startExtraction called', { 
          userId, 
          urls, 
          extractionType,
          urlCount: urls.length 
        });
      }
      
      // Validate URLs
      const validUrls = this.validateUrls(urls);
      // Only log URL validation in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('URL validation result', { 
          inputUrls: urls, 
          validUrls, 
          validCount: validUrls.length 
        });
      }
      
      if (validUrls.length === 0) {
        EmailExtractorCore.logger.warn('No valid URLs found after validation', { inputUrls: urls });
        return {
          success: false,
          message: 'No valid URLs provided',
          timestamp: new Date()
        };
      }

      // Check subscription limits
      const canExtract = await SubscriptionLimitsService.canPerformExtraction(
        userId,
        validUrls.length,
        extractionType === 'csv'
      );

      if (!canExtract.canExtract) {
        // Log limit reached activity
        if (canExtract.reason?.includes('limit')) {
          await EmailExtractorActivityService.logLimitReached(
            userId,
            canExtract.limits.dailyExtractionLimit,
            canExtract.usage.used,
            canExtract.usage.resetTime,
            'daily'
          );
        }

        return {
          success: false,
          message: canExtract.reason || 'Extraction limit reached',
          timestamp: new Date()
        };
      }

      // Generate unique job ID
      const jobId = `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create extraction record
      await EmailExtractionModel.createExtraction(userId, jobId, validUrls);

      // Log extraction started activity
      await EmailExtractorActivityService.logExtractionStarted(
        userId,
        jobId,
        validUrls.length,
        validUrls,
        extractionType
      );

      // Add job to queue
      await QueueService.addEmailExtractionJob({
        jobId,
        userId,
        urls: validUrls
      });

      // Only log job start in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('Email extraction job started', {
          userId,
          jobId,
          urlCount: validUrls.length
        });
      }

      return {
        success: true,
        data: { jobId },
        message: 'Email extraction job started successfully',
        timestamp: new Date()
      };
    } catch (error) {
      EmailExtractorCore.logger.error('Error starting email extraction:', error);
      return {
        success: false,
        message: 'Failed to start email extraction',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process email extraction job
   */
  public static async processExtractionJob(jobData: {
    jobId: string;
    userId: string;
    urls: string[];
  }): Promise<void> {
    const { jobId, userId, urls } = jobData;
    const startTime = Date.now();
    let totalEmails = 0;
    let successfulUrls = 0;
    let failedUrls = 0;
    const failedUrlList: string[] = [];
    
    try {
      // Only log job processing in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('Processing email extraction job', { jobId, urlCount: urls.length });
      }
      
      // Update status to processing and set startedAt
      await EmailExtractionModel.updateExtractionStatus(jobId, ExtractionStatus.PROCESSING);
      const model = EmailExtractionModel.getInstance();
      await model.updateOne(
        { jobId },
        { startedAt: new Date() }
      );

      // Process each URL with detailed progress tracking
      for (const url of urls) {
        const urlStartTime = Date.now();
        try {
          // Only log extraction start in debug mode
          if (process.env.LOG_LEVEL === 'debug') {
            EmailExtractorCore.logger.debug('Extracting emails from URL', { jobId, url });
          }
          
          // Create progress updater for this URL
          const updateProgress = async (step: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped', message?: string, details?: any) => {
            await EmailExtractionModel.updateExtractionProgress(jobId, url, step, status, message, details);
          };
          
          const emails = await this.extractEmailsFromUrlWithProgress(url, jobId, updateProgress);
          const urlDuration = Date.now() - urlStartTime;
          totalEmails += emails.length;
          successfulUrls++;
          
          await EmailExtractionModel.updateExtractionResult(
            jobId,
            url,
            emails,
            'success',
            undefined,
            urlDuration
          );
          
          EmailExtractorCore.logger.info('Successfully extracted emails', {
            jobId,
            url,
            emailCount: emails.length,
            duration: urlDuration
          });
        } catch (error) {
          const urlDuration = Date.now() - urlStartTime;
          failedUrls++;
          failedUrlList.push(url);
          
          EmailExtractorCore.logger.error('Error extracting emails from URL', {
            jobId,
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: urlDuration
          });
          
          await EmailExtractionModel.updateExtractionResult(
            jobId,
            url,
            [],
            'failed',
            error instanceof Error ? error.message : 'Unknown error',
            urlDuration
          );
        }
      }

      // Mark job as completed and set duration
      const totalDuration = Date.now() - startTime;
      await EmailExtractionModel.updateExtractionStatus(jobId, ExtractionStatus.COMPLETED);
      await model.updateOne(
        { jobId },
        { 
          completedAt: new Date(),
          duration: totalDuration
        }
      );
      
      // Log completion activity
      await EmailExtractorActivityService.logExtractionCompleted(
        userId,
        jobId,
        totalEmails,
        successfulUrls,
        failedUrls,
        'multiple', // Default to multiple, could be enhanced to track actual type
        urls
      );
      
      // Only log job completion in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('Email extraction job completed', { 
          jobId, 
          totalEmails, 
          successfulUrls, 
          failedUrls 
        });
      }
    } catch (error) {
      EmailExtractorCore.logger.error('Error processing email extraction job', {
        jobId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Log failure activity
      await EmailExtractorActivityService.logExtractionFailed(
        userId,
        jobId,
        error instanceof Error ? error.message : 'Unknown error',
        failedUrlList,
        'multiple'
      );
      
      await EmailExtractionModel.updateExtractionStatus(
        jobId,
        ExtractionStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get user's extraction history
   */
  public static async getUserExtractions(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<ApiResponse<IEmailExtractionDocument[]>> {
    try {
      const extractions = await EmailExtractionModel.getUserExtractions(userId, limit, skip);
      
      // Properly serialize the documents to fix _id serialization issues
      const serializedExtractions = extractions.map(extraction => {
        const obj = extraction.toObject();
        return {
          ...obj,
          _id: (obj._id as any).toString() // Convert ObjectId to string
        };
      });
      
      return {
        success: true,
        data: serializedExtractions as any,
        message: 'Extractions retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      EmailExtractorCore.logger.error('Error fetching user extractions:', error);
      return {
        success: false,
        message: 'Failed to fetch extractions',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get extraction by job ID
   */
  public static async getExtractionByJobId(
    jobId: string
  ): Promise<ApiResponse<IEmailExtractionDocument | null>> {
    try {
      const extraction = await EmailExtractionModel.getExtractionByJobId(jobId);
      
      // Properly serialize the document to fix _id serialization issues
      let serializedExtraction = null;
      if (extraction) {
        const obj = extraction.toObject();
        serializedExtraction = {
          ...obj,
          _id: (obj._id as any).toString() // Convert ObjectId to string
        };
      }
      
      return {
        success: true,
        data: serializedExtraction as any,
        message: extraction ? 'Extraction found' : 'Extraction not found',
        timestamp: new Date()
      };
    } catch (error) {
      EmailExtractorCore.logger.error('Error fetching extraction by job ID:', error);
      return {
        success: false,
        message: 'Failed to fetch extraction',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get subscription limits and usage for a user
   */
  public static async getSubscriptionInfo(userId: string): Promise<ApiResponse<{
    limits: any;
    usage: any;
    canUseCsv: boolean;
    needsUpgrade: boolean;
    upgradeRecommendation?: any;
  }>> {
    try {
      const limits = await SubscriptionLimitsService.getSubscriptionLimits(userId);
      const usage = await SubscriptionLimitsService.getDailyUsage(userId);
      const upgradeRecommendation = await SubscriptionLimitsService.getUpgradeRecommendations(userId);
      
      return {
        success: true,
        data: {
          limits,
          usage,
          canUseCsv: limits.canUseCsvUpload,
          needsUpgrade: upgradeRecommendation.needsUpgrade,
          upgradeRecommendation: upgradeRecommendation.needsUpgrade ? upgradeRecommendation : undefined
        },
        message: 'Subscription info retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      EmailExtractorCore.logger.error('Error fetching subscription info:', error);
      return {
        success: false,
        message: 'Failed to fetch subscription info',
        timestamp: new Date()
      };
    }
  }

  /**
   * Extract emails from a single URL with optimized speed and detailed progress tracking
   */
  private static async extractEmailsFromUrlWithProgress(
    url: string, 
    jobId: string, 
    updateProgress: (step: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped', message?: string, details?: any) => Promise<void>
  ): Promise<string[]> {
    let foundEmails: string[] = [];
    
    try {
      // Add timeout to prevent hanging extractions, but preserve any emails found
      const result = await Promise.race([
        this.performExtraction(url, jobId, updateProgress),
        new Promise<string[]>((_, reject) => 
          setTimeout(() => reject(new Error('Extraction timeout')), this.EXTRACTION_TIMEOUT)
        )
      ]);
      
      return result;
    } catch (error) {
      // If we get a timeout error, check if we have any emails from the progress
      if (error instanceof Error && error.message === 'Extraction timeout') {
        // Try to get emails from the final progress step
        try {
          const extraction = await EmailExtractionModel.getExtractionByJobId(jobId);
          if (extraction) {
            const result = extraction.results.find(r => r.url === url);
            if (result && result.progress) {
              // Look for the final extraction step that contains emails
              const finalStep = result.progress.find(p => 
                p.step === 'extraction_complete' && 
                p.status === 'completed' && 
                p.details && 
                p.details.emails && 
                Array.isArray(p.details.emails)
              );
              
              if (finalStep && finalStep.details.emails.length > 0) {
                EmailExtractorCore.logger.info('Recovered emails from timeout', {
                  jobId,
                  url,
                  emailCount: finalStep.details.emails.length,
                  message: 'Extraction timed out but emails were successfully extracted'
                });
                
                // Update the progress to show timeout but with recovered emails
                await updateProgress('extraction_timeout_recovery', 'completed', 
                  `Extraction timed out but recovered ${finalStep.details.emails.length} email(s) from completed steps`);
                
                return finalStep.details.emails;
              }
            }
          }
        } catch (recoveryError) {
          EmailExtractorCore.logger.error('Failed to recover emails from timeout', {
            jobId,
            url,
            recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown error'
          });
        }
      }
      
      // If no emails could be recovered, throw the original error
      throw error;
    }
  }

  private static async performExtraction(
    url: string, 
    jobId: string, 
    updateProgress: (step: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped', message?: string, details?: any) => Promise<void>
  ): Promise<string[]> {
    const found = new Set<string>();
    const scannedUrls = new Set<string>();

    try {
      // Only log extraction start in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('Starting optimized email extraction', { url });
      }

      // Step 1: Fast homepage scan (most important - emails are usually on homepage)
      await updateProgress('homepage_scan', 'processing', 'Analyzing homepage content...');
      const homepageHtml = await this.fetchHtml(url);
      if (homepageHtml) {
        await updateProgress('homepage_scan', 'completed', 'Homepage content retrieved successfully', { 
          contentLength: homepageHtml.length 
        });
        
        await updateProgress('homepage_email_extraction', 'processing', 'Scanning homepage for email addresses...');
        const homepageEmails = this.extractEmailsFromHtml(homepageHtml);
        if (homepageEmails && Array.isArray(homepageEmails)) {
          homepageEmails.forEach(email => found.add(email));
        }
        scannedUrls.add(url);
        
        await updateProgress('homepage_email_extraction', 'completed', `Found ${homepageEmails?.length || 0} email(s) on homepage`, {
          emails: homepageEmails || [],
          totalEmailsSoFar: found.size
        });
      } else {
        await updateProgress('homepage_scan', 'failed', 'Failed to fetch homepage content');
      }

      // Step 2: Quick contact page check (most likely to have emails)
      await updateProgress('contact_pages', 'processing', 'Scanning contact and about pages...');
      const contactUrls = this.getTopContactUrls(url);
      const contactEmails = await this.scanUrlsInParallel(contactUrls, updateProgress, 'contact_pages');
      if (contactEmails && Array.isArray(contactEmails)) {
        contactEmails.forEach(email => found.add(email));
      }
      
      await updateProgress('contact_pages', 'completed', `Found ${contactEmails?.length || 0} email(s) from contact pages`, {
        emails: contactEmails || [],
        totalEmailsSoFar: found.size
      });

      // Step 3: Enhanced Puppeteer scan with comprehensive crawling
      await updateProgress('puppeteer_scan', 'processing', 'Launching advanced browser scanning with stealth mode...');
      // Only log Puppeteer usage in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('Using enhanced Puppeteer for comprehensive deep scanning', { url });
      }
      const puppeteerEmails = await this.extractEmailsWithPuppeteer(url);
      if (puppeteerEmails && Array.isArray(puppeteerEmails)) {
        puppeteerEmails.forEach(email => found.add(email));
      }
      
      await updateProgress('puppeteer_scan', 'completed', `Advanced browser scan found ${puppeteerEmails?.length || 0} email(s)`, {
        emails: puppeteerEmails || [],
        totalEmailsSoFar: found.size
      });

      // Step 4: WHOIS lookup (fast and often effective)
      await updateProgress('whois_lookup', 'processing', 'Querying domain registration database (WHOIS)...');
      const whoisEmails = await WhoisExtractor.extractEmailsFromWhois(url);
      if (whoisEmails && Array.isArray(whoisEmails)) {
        whoisEmails.forEach(email => found.add(email));
      }
      
      if (whoisEmails && whoisEmails.length > 0) {
        await updateProgress('whois_lookup', 'completed', `WHOIS database found ${whoisEmails.length} email(s)`, {
          emails: whoisEmails,
          totalEmailsSoFar: found.size
        });
      } else {
        await updateProgress('whois_lookup', 'completed', 'WHOIS lookup completed - no emails found', {
          totalEmailsSoFar: found.size
        });
      }

      // Step 5: Social Media extraction (comprehensive social platform scanning)
      await updateProgress('social_media_scan', 'processing', 'Scanning social media platforms for contact information...');
      const socialMediaEmails = await this.extractEmailsFromSocialMedia(url);
      if (socialMediaEmails && Array.isArray(socialMediaEmails)) {
        socialMediaEmails.forEach(email => found.add(email));
      }
      
      if (socialMediaEmails && socialMediaEmails.length > 0) {
        await updateProgress('social_media_scan', 'completed', `Social media scan found ${socialMediaEmails.length} email(s)`, {
          emails: socialMediaEmails,
          totalEmailsSoFar: found.size
        });
      } else {
        await updateProgress('social_media_scan', 'completed', 'Social media scan completed - no emails found', {
          totalEmailsSoFar: found.size
        });
      }

      // Step 6: Final deduplication and validation
      await updateProgress('final_deduplication', 'processing', 'Performing final deduplication and validation...');
      const finalEmails = Array.from(found);
      const uniqueEmails = [...new Set(finalEmails)]; // Remove duplicates
      
      await updateProgress('final_deduplication', 'completed', `Final deduplication complete! ${finalEmails.length} total emails found, ${uniqueEmails.length} unique emails`, {
        totalEmailsFound: finalEmails.length,
        uniqueEmails: uniqueEmails.length,
        duplicatesRemoved: finalEmails.length - uniqueEmails.length,
        finalEmails: uniqueEmails
      });

      await updateProgress('extraction_complete', 'completed', `Comprehensive email extraction completed successfully! Found ${uniqueEmails.length} unique email(s)`, {
        totalEmails: uniqueEmails.length,
        totalEmailsBeforeDeduplication: finalEmails.length,
        duplicatesRemoved: finalEmails.length - uniqueEmails.length,
        scannedUrls: scannedUrls.size,
        emails: uniqueEmails
      });

      // Only log extraction completion in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        EmailExtractorCore.logger.debug('Email extraction completed', { 
          url, 
          emailsFound: uniqueEmails.length,
          totalEmailsBeforeDeduplication: finalEmails.length,
          duplicatesRemoved: finalEmails.length - uniqueEmails.length,
          pagesScanned: scannedUrls.size 
        });
      }

      return uniqueEmails;
    } catch (error) {
      await updateProgress('extraction_failed', 'failed', `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      EmailExtractorCore.logger.error('Error extracting emails from URL', { url, error });
      throw error;
    }
  }

  /**
   * Get top priority contact URLs (most likely to have emails)
   */
  private static getTopContactUrls(baseUrl: string): string[] {
    const topPaths = ['/contact', '/contact-us', '/about', '/about-us', '/support'];
    const urls: string[] = [];
    
    for (const path of topPaths) {
      const testUrl = this.normalizeUrl(baseUrl, path);
      if (testUrl) {
        urls.push(testUrl);
      }
    }
    
    return urls;
  }

  /**
   * Scan multiple URLs in parallel for faster extraction
   */
  private static async scanUrlsInParallel(
    urls: string[], 
    updateProgress: (step: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped', message?: string, details?: any) => Promise<void>,
    stepName: string
  ): Promise<string[]> {
    const found = new Set<string>();
    
    if (urls.length === 0) return Array.from(found);
    
    // Process URLs in parallel with a limit to avoid overwhelming the server
    const batchSize = 3;
    const batches: string[][] = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      await updateProgress(stepName, 'processing', `Scanning batch ${batchIndex + 1}/${batches.length} (${batch.length} URLs)...`);
      
      const promises = batch.map(async (url) => {
        try {
          const html = await this.fetchHtml(url);
          if (html) {
            const emails = this.extractEmailsFromHtml(html);
            return emails;
          }
        } catch (error) {
          // Only log unexpected errors, not common failures like 404s
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (!errorMessage.includes('404') && !errorMessage.includes('timeout')) {
            EmailExtractorCore.logger.warn('Failed to scan URL in parallel', { url, error: errorMessage });
          }
        }
        return [];
      });
      
      const results = await Promise.all(promises);
      results.forEach(emails => {
        if (emails && Array.isArray(emails)) {
          emails.forEach(email => found.add(email));
        }
      });
    }
    
    return Array.from(found);
  }

  /**
   * Extract emails from a single URL - Main orchestration method (backward compatibility)
   */
  private static async extractEmailsFromUrl(url: string): Promise<string[]> {
    // Create a no-op progress updater for backward compatibility
    const noOpUpdateProgress = async () => {};
    return this.extractEmailsFromUrlWithProgress(url, '', noOpUpdateProgress);
  }

  // Configuration constants - Optimized for speed
  private static readonly CONTACT_PATHS = [
    '/contact', '/contact-us', '/about', '/about-us', '/support'
  ];
  private static readonly EXTRACTION_TIMEOUT = 60000; // 60 seconds max per URL (increased for comprehensive extraction)
  private static readonly BUSINESS_PATHS = [
    '/business', '/partnership', '/team', '/company'
  ];
  private static readonly COMMON_CHECKOUT_PATHS = [
    '/checkout', '/cart', '/payment'
  ];
  private static readonly MAX_PAGES_TO_SCAN = 5; // Reduced from 20 to 5 for speed


  // Import methods from other modules
  private static fetchHtml = HtmlFetcher.fetchHtml;
  private static extractEmailsFromHtml = EmailParser.extractEmailsFromHtml;
  private static extractAllInternalLinks = LinkExtractor.extractAllInternalLinks;
  private static normalizeUrl = UrlUtils.normalizeUrl;
  private static extractEmailsWithPuppeteer = PuppeteerExtractor.extractEmailsWithPuppeteer;
  private static extractEmailsFromSocialMedia = SocialMediaExtractor.extractEmailsFromSocialMedia;
  private static validateUrls = UrlUtils.validateUrls;
}
