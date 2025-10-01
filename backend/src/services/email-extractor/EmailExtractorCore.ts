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
        EmailExtractorCore.logger.debug('Starting Puppeteer-first email extraction', { url });
      }

      // Step 1: Browser Initialization - Launch Puppeteer with stealth mode
      await updateProgress('browser_initialization', 'processing', 'Launching stealth browser for dynamic content analysis...');
      try {
        await PuppeteerExtractor.initializeBrowserForExtraction();
        await updateProgress('browser_initialization', 'completed', 'Browser initialized successfully');
        EmailExtractorCore.logger.info('✅ Browser initialization successful', { url });
      } catch (error) {
        await updateProgress('browser_initialization', 'failed', `Browser initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        EmailExtractorCore.logger.error('❌ Browser initialization failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
        throw error; // Critical failure - cannot continue without browser
      }

      // Step 2: E-commerce Checkout Extraction (Most effective for e-commerce sites)
      await updateProgress('ecommerce_checkout', 'processing', 'Extracting emails from checkout process...');
      try {
        const checkoutEmails = await PuppeteerExtractor.extractEmailsFromEcommerceCheckout(url);
        if (checkoutEmails && Array.isArray(checkoutEmails)) {
          checkoutEmails.forEach(email => found.add(email));
        }
        
        await updateProgress('ecommerce_checkout', 'completed', `Checkout extraction found ${checkoutEmails?.length || 0} email(s)`, {
          emails: checkoutEmails || [],
          totalEmailsSoFar: found.size
        });
        
        if (checkoutEmails && checkoutEmails.length > 0) {
          EmailExtractorCore.logger.info('✅ Checkout extraction successful', { 
            url, 
            count: checkoutEmails.length, 
            emails: checkoutEmails 
          });
        } else {
          EmailExtractorCore.logger.info('ℹ️ Checkout extraction completed - no emails found', { url });
        }
      } catch (error: any) {
        await updateProgress('ecommerce_checkout', 'failed', `Checkout extraction failed: ${error?.message || 'Unknown error'}`);
        EmailExtractorCore.logger.warn('Checkout extraction failed, continuing with other methods', {
          url,
          error: error?.message || 'Unknown error'
        });
      }

      // Step 3: Homepage Analysis - Puppeteer-based homepage scanning
      await updateProgress('homepage_analysis', 'processing', 'Analyzing homepage with browser automation...');
      try {
        const homepageEmails = await PuppeteerExtractor.extractEmailsFromHomepage(url);
        if (homepageEmails && Array.isArray(homepageEmails)) {
          homepageEmails.forEach(email => found.add(email));
        }
        
        await updateProgress('homepage_analysis', 'completed', `Homepage analysis found ${homepageEmails?.length || 0} email(s)`, {
          emails: homepageEmails || [],
          totalEmailsSoFar: found.size
        });
      } catch (error: any) {
        await updateProgress('homepage_analysis', 'failed', `Homepage analysis failed: ${error?.message || 'Unknown error'}`);
        EmailExtractorCore.logger.warn('Homepage analysis failed', { url, error: error?.message || 'Unknown error' });
      }

      // Step 4: Contact Page Discovery - Puppeteer-based contact page crawling
      await updateProgress('contact_discovery', 'processing', 'Finding and scanning contact pages...');
      try {
        const contactEmails = await PuppeteerExtractor.extractEmailsFromContactPages(url);
        if (contactEmails && Array.isArray(contactEmails)) {
          contactEmails.forEach(email => found.add(email));
        }
        
        await updateProgress('contact_discovery', 'completed', `Contact page discovery found ${contactEmails?.length || 0} email(s)`, {
          emails: contactEmails || [],
          totalEmailsSoFar: found.size
        });
      } catch (error: any) {
        await updateProgress('contact_discovery', 'failed', `Contact page discovery failed: ${error?.message || 'Unknown error'}`);
        EmailExtractorCore.logger.warn('Contact page discovery failed', { url, error: error?.message || 'Unknown error' });
      }

      // Step 5: Deep Site Crawling - Comprehensive site exploration (only if no emails found yet)
      if (found.size === 0) {
        await updateProgress('deep_crawling', 'processing', 'Comprehensive site exploration...');
        try {
          const deepCrawlEmails = await PuppeteerExtractor.extractEmailsFromDeepCrawling(url);
          if (deepCrawlEmails && Array.isArray(deepCrawlEmails)) {
            deepCrawlEmails.forEach(email => found.add(email));
          }
          
          await updateProgress('deep_crawling', 'completed', `Deep site crawling found ${deepCrawlEmails?.length || 0} email(s)`, {
            emails: deepCrawlEmails || [],
            totalEmailsSoFar: found.size
          });
        } catch (error: any) {
          await updateProgress('deep_crawling', 'failed', `Deep site crawling failed: ${error?.message || 'Unknown error'}`);
          EmailExtractorCore.logger.warn('Deep site crawling failed', { url, error: error?.message || 'Unknown error' });
        }
      } else {
        await updateProgress('deep_crawling', 'skipped', 'Skipping deep crawling - emails already found');
      }

      // Step 6: WHOIS Database - Domain registration lookup (fast and sometimes effective)
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

      // Step 5: Social Media extraction (disabled due to false positives)
      // TODO: Re-enable when better filtering is implemented
      /*
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
      */

      // Step 7: Final Deduplication - Clean and validate results
      await updateProgress('final_deduplication', 'processing', 'Cleaning and validating results...');
      const finalEmails = Array.from(found);
      const uniqueEmails = [...new Set(finalEmails)]; // Remove duplicates
      
      await updateProgress('final_deduplication', 'completed', `Final deduplication complete! ${finalEmails.length} total emails found, ${uniqueEmails.length} unique emails`, {
        totalEmailsFound: finalEmails.length,
        uniqueEmails: uniqueEmails.length,
        duplicatesRemoved: finalEmails.length - uniqueEmails.length,
        finalEmails: uniqueEmails
      });

      await updateProgress('extraction_complete', 'completed', `Puppeteer-first email extraction completed successfully! Found ${uniqueEmails.length} unique email(s)`, {
        totalEmails: uniqueEmails.length,
        totalEmailsBeforeDeduplication: finalEmails.length,
        duplicatesRemoved: finalEmails.length - uniqueEmails.length,
        scannedUrls: scannedUrls.size,
        emails: uniqueEmails
      });

      // Close browser after extraction is complete
      try {
        await PuppeteerExtractor.closeBrowser();
        EmailExtractorCore.logger.info('🔒 Browser closed successfully');
      } catch (error) {
        EmailExtractorCore.logger.warn('⚠️ Failed to close browser', { error: error instanceof Error ? error.message : 'Unknown error' });
      }

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
      // Ensure browser is closed even on error
      try {
        await PuppeteerExtractor.closeBrowser();
      } catch (closeError) {
        EmailExtractorCore.logger.warn('⚠️ Failed to close browser after error', { error: closeError instanceof Error ? closeError.message : 'Unknown error' });
      }
      
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


  /**
   * Extract emails from homepage using Puppeteer (replaces unreliable HTML fetching)
   */
  private static async extractEmailsFromHomepageWithPuppeteer(url: string): Promise<string[]> {
    try {
      // Use a lightweight Puppeteer instance for homepage scanning
      const { PuppeteerExtractor } = await import('./PuppeteerExtractor');
      return await PuppeteerExtractor.extractEmailsFromCheckoutOnly(url);
    } catch (error) {
      EmailExtractorCore.logger.warn('Homepage Puppeteer extraction failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }

  /**
   * Extract emails from contact pages using Puppeteer (replaces unreliable HTML fetching)
   */
  private static async extractEmailsFromContactPagesWithPuppeteer(url: string): Promise<string[]> {
    try {
      // For now, use the main Puppeteer extraction which includes contact page discovery
      // This could be optimized further with dedicated contact page extraction
      const { PuppeteerExtractor } = await import('./PuppeteerExtractor');
      return await PuppeteerExtractor.extractEmailsWithPuppeteer(url);
    } catch (error) {
      EmailExtractorCore.logger.warn('Contact pages Puppeteer extraction failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }

  // Import methods from other modules
  private static fetchHtml = HtmlFetcher.fetchHtml;
  private static extractEmailsFromHtml = EmailParser.extractEmailsFromHtml;
  private static extractAllInternalLinks = LinkExtractor.extractAllInternalLinks;
  private static normalizeUrl = UrlUtils.normalizeUrl;
  private static extractEmailsWithPuppeteer = PuppeteerExtractor.extractEmailsWithPuppeteer;
  private static extractEmailsFromSocialMedia = SocialMediaExtractor.extractEmailsFromSocialMedia;
  private static validateUrls = UrlUtils.validateUrls;
}
