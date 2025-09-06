import { EmailExtractionModel, ExtractionStatus, IEmailExtractionDocument } from '../../models/EmailExtractor';
import { ApiResponse } from '../../types';
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
      // Validate URLs
      const validUrls = this.validateUrls(urls);
      if (validUrls.length === 0) {
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

      EmailExtractorCore.logger.info('Email extraction job started', {
        userId,
        jobId,
        urlCount: validUrls.length
      });

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
      EmailExtractorCore.logger.info('Processing email extraction job', { jobId, urlCount: urls.length });
      
      // Update status to processing
      await EmailExtractionModel.updateExtractionStatus(jobId, ExtractionStatus.PROCESSING);

      // Process each URL
      for (const url of urls) {
        try {
          EmailExtractorCore.logger.info('Extracting emails from URL', { jobId, url });
          
          const emails = await this.extractEmailsFromUrl(url);
          totalEmails += emails.length;
          successfulUrls++;
          
          await EmailExtractionModel.updateExtractionResult(
            jobId,
            url,
            emails,
            'success'
          );
          
          EmailExtractorCore.logger.info('Successfully extracted emails', {
            jobId,
            url,
            emailCount: emails.length
          });
        } catch (error) {
          failedUrls++;
          failedUrlList.push(url);
          
          EmailExtractorCore.logger.error('Error extracting emails from URL', {
            jobId,
            url,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          await EmailExtractionModel.updateExtractionResult(
            jobId,
            url,
            [],
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Mark job as completed
      await EmailExtractionModel.updateExtractionStatus(jobId, ExtractionStatus.COMPLETED);
      
      // Log completion activity
      await EmailExtractorActivityService.logExtractionCompleted(
        userId,
        jobId,
        totalEmails,
        successfulUrls,
        failedUrls,
        'multiple' // Default to multiple, could be enhanced to track actual type
      );
      
      EmailExtractorCore.logger.info('Email extraction job completed', { 
        jobId, 
        totalEmails, 
        successfulUrls, 
        failedUrls 
      });
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
      
      return {
        success: true,
        data: extractions,
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
      
      return {
        success: true,
        data: extraction,
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
   * Extract emails from a single URL - Main orchestration method
   */
  private static async extractEmailsFromUrl(url: string): Promise<string[]> {
    const found = new Set<string>();
    const scannedUrls = new Set<string>();
    const urlsToScan = new Set<string>();

    try {
      EmailExtractorCore.logger.info('Starting aggressive email extraction', { url });

      // Step 1: Always start with homepage
      const homepageHtml = await this.fetchHtml(url);
      if (homepageHtml) {
        this.extractEmailsFromHtml(homepageHtml).forEach(email => found.add(email));
        scannedUrls.add(url);
        
        // Extract all internal links from homepage
        const internalLinks = this.extractAllInternalLinks(url, homepageHtml);
        internalLinks.forEach(link => urlsToScan.add(link));
      }

      // Step 2: Try all predefined paths
      const allPaths = [
        ...this.CONTACT_PATHS,
        ...this.BUSINESS_PATHS,
        ...this.COMMON_CHECKOUT_PATHS
      ];

      for (const path of allPaths) {
        const testUrl = this.normalizeUrl(url, path);
        if (testUrl && !scannedUrls.has(testUrl)) {
          urlsToScan.add(testUrl);
        }
      }

      // Step 3: Scan discovered URLs (limited to prevent infinite loops)
      let scanCount = 0;
      const urlsArray = Array.from(urlsToScan);
      
      for (const scanUrl of urlsArray) {
        if (scanCount >= this.MAX_PAGES_TO_SCAN || scannedUrls.has(scanUrl)) {
          continue;
        }

        try {
          EmailExtractorCore.logger.info('Scanning page for emails', { url: scanUrl, scanCount });
          const html = await this.fetchHtml(scanUrl);
          if (html) {
            scannedUrls.add(scanUrl);
            scanCount++;
            
            // Extract emails from this page
            this.extractEmailsFromHtml(html).forEach(email => found.add(email));
            
            // Extract more internal links (but limit depth)
            if (scanCount < this.MAX_PAGES_TO_SCAN / 2) {
              const newLinks = this.extractAllInternalLinks(url, html);
              newLinks.forEach(link => {
                if (!scannedUrls.has(link) && !urlsToScan.has(link)) {
                  urlsToScan.add(link);
                }
              });
            }
          }
        } catch (error) {
          EmailExtractorCore.logger.warn('Failed to scan page', { url: scanUrl, error });
        }
      }

      // Step 4: If still no emails found, use Puppeteer for deep scanning
      if (found.size === 0) {
        EmailExtractorCore.logger.info('No emails found with basic scanning, using Puppeteer', { url });
        const puppeteerEmails = await this.extractEmailsWithPuppeteer(url);
        puppeteerEmails.forEach(email => found.add(email));
      }

      // Step 5: Try common email patterns and social media
      if (found.size === 0) {
        EmailExtractorCore.logger.info('Trying social media and common patterns', { url });
        const socialEmails = await this.extractEmailsFromSocialMedia(url);
        socialEmails.forEach(email => found.add(email));
      }

      // Step 6: Try WHOIS lookup for domain emails
      if (found.size === 0) {
        EmailExtractorCore.logger.info('Trying WHOIS lookup', { url });
        const whoisEmails = await this.extractEmailsFromWhois(url);
        whoisEmails.forEach(email => found.add(email));
      }

      EmailExtractorCore.logger.info('Email extraction completed', { 
        url, 
        emailsFound: found.size, 
        pagesScanned: scannedUrls.size 
      });

      return Array.from(found);
    } catch (error) {
      EmailExtractorCore.logger.error('Error extracting emails from URL', { url, error });
      throw error;
    }
  }

  // Configuration constants
  private static readonly CONTACT_PATHS = [
    '/contact', '/contact-us', '/contactus', '/about', '/about-us', '/aboutus',
    '/support', '/help', '/faq', '/customer-service', '/customer-support',
    '/get-in-touch', '/reach-us', '/connect', '/team', '/staff', '/company',
    '/info', '/information', '/legal', '/privacy', '/terms', '/disclaimer'
  ];
  private static readonly BUSINESS_PATHS = [
    '/business', '/partnership', '/partners', '/affiliate', '/wholesale',
    '/b2b', '/enterprise', '/corporate', '/investor', '/investors',
    '/press', '/media', '/news', '/blog', '/careers', '/jobs'
  ];
  private static readonly COMMON_CHECKOUT_PATHS = [
    '/checkout', '/checkout/', '/checkout/onepage/', '/cart', '/basket',
    '/payment', '/billing', '/order', '/purchase', '/buy'
  ];
  private static readonly MAX_PAGES_TO_SCAN = 20;

  // Import methods from other modules
  private static fetchHtml = HtmlFetcher.fetchHtml;
  private static extractEmailsFromHtml = EmailParser.extractEmailsFromHtml;
  private static extractAllInternalLinks = LinkExtractor.extractAllInternalLinks;
  private static normalizeUrl = UrlUtils.normalizeUrl;
  private static extractEmailsWithPuppeteer = PuppeteerExtractor.extractEmailsWithPuppeteer;
  private static extractEmailsFromSocialMedia = SocialMediaExtractor.extractEmailsFromSocialMedia;
  private static extractEmailsFromWhois = WhoisExtractor.extractEmailsFromWhois;
  private static validateUrls = UrlUtils.validateUrls;
}
