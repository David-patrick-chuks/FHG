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
      EmailExtractorCore.logger.info('EmailExtractorCore.startExtraction called', { 
        userId, 
        urls, 
        extractionType,
        urlCount: urls.length 
      });
      
      // Validate URLs
      const validUrls = this.validateUrls(urls);
      EmailExtractorCore.logger.info('URL validation result', { 
        inputUrls: urls, 
        validUrls, 
        validCount: validUrls.length 
      });
      
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
          EmailExtractorCore.logger.info('Extracting emails from URL', { jobId, url });
          
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
    // Add timeout to prevent hanging extractions
    return Promise.race([
      this.performExtraction(url, jobId, updateProgress),
      new Promise<string[]>((_, reject) => 
        setTimeout(() => reject(new Error('Extraction timeout')), this.EXTRACTION_TIMEOUT)
      )
    ]);
  }

  private static async performExtraction(
    url: string, 
    jobId: string, 
    updateProgress: (step: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped', message?: string, details?: any) => Promise<void>
  ): Promise<string[]> {
    const found = new Set<string>();
    const scannedUrls = new Set<string>();

    try {
      EmailExtractorCore.logger.info('Starting optimized email extraction', { url });

      // Step 1: Fast homepage scan (most important - emails are usually on homepage)
      await updateProgress('homepage_scan', 'processing', '🌐 Analyzing homepage content...');
      const homepageHtml = await this.fetchHtml(url);
      if (homepageHtml) {
        await updateProgress('homepage_scan', 'completed', '✅ Homepage content retrieved successfully', { 
          contentLength: homepageHtml.length 
        });
        
        await updateProgress('homepage_email_extraction', 'processing', '🔍 Scanning homepage for email addresses...');
        const homepageEmails = this.extractEmailsFromHtml(homepageHtml);
        homepageEmails.forEach(email => found.add(email));
        scannedUrls.add(url);
        
        await updateProgress('homepage_email_extraction', 'completed', `📧 Found ${homepageEmails.length} email(s) on homepage`, {
          emails: homepageEmails
        });
      } else {
        await updateProgress('homepage_scan', 'failed', '❌ Failed to fetch homepage content');
      }

      // Step 2: Quick contact page check (most likely to have emails)
      if (found.size === 0) {
        await updateProgress('contact_pages', 'processing', '📞 Scanning contact and about pages...');
        const contactUrls = this.getTopContactUrls(url);
        const contactEmails = await this.scanUrlsInParallel(contactUrls, updateProgress, 'contact_pages');
        contactEmails.forEach(email => found.add(email));
        
        await updateProgress('contact_pages', 'completed', `📧 Found ${contactEmails.length} email(s) from contact pages`, {
          emails: contactEmails
        });
      } else {
        await updateProgress('contact_pages', 'skipped', '⏭️ Skipped contact pages - emails already found');
      }

      // Step 3: Enhanced Puppeteer scan with comprehensive crawling
      if (found.size === 0) {
        await updateProgress('puppeteer_scan', 'processing', '🤖 Launching advanced browser scanning with stealth mode...');
        EmailExtractorCore.logger.info('Using enhanced Puppeteer for comprehensive deep scanning', { url });
        const puppeteerEmails = await this.extractEmailsWithPuppeteer(url);
        puppeteerEmails.forEach(email => found.add(email));
        
        await updateProgress('puppeteer_scan', 'completed', `🎯 Advanced browser scan found ${puppeteerEmails.length} email(s)`, {
          emails: puppeteerEmails
        });
      } else {
        await updateProgress('puppeteer_scan', 'skipped', '⏭️ Skipped advanced browser scan - emails already found');
      }

      // Step 4: WHOIS lookup (fast and often effective)
      if (found.size === 0) {
        await updateProgress('whois_lookup', 'processing', '🌍 Querying domain registration database (WHOIS)...');
        const whoisEmails = await this.extractEmailsFromWhois(url);
        whoisEmails.forEach(email => found.add(email));
        
        if (whoisEmails.length > 0) {
          await updateProgress('whois_lookup', 'completed', `📋 WHOIS database found ${whoisEmails.length} email(s)`, {
            emails: whoisEmails
          });
        } else {
          await updateProgress('whois_lookup', 'completed', '📋 WHOIS lookup completed - no emails found');
        }
      } else {
        await updateProgress('whois_lookup', 'skipped', '⏭️ Skipped WHOIS lookup - emails already found');
      }

      // Step 5: Generate common business emails as final fallback
      if (found.size === 0) {
        await updateProgress('fallback_generation', 'processing', '💡 Generating common business email patterns...');
        const domain = new URL(url).hostname;
        const commonEmails = this.generateCommonBusinessEmails(domain);
        commonEmails.forEach(email => found.add(email));
        
        await updateProgress('fallback_generation', 'completed', `🎯 Generated ${commonEmails.length} common business email patterns`, {
          emails: commonEmails
        });
      } else {
        await updateProgress('fallback_generation', 'skipped', '⏭️ Skipped fallback generation - emails already found');
      }

      await updateProgress('extraction_complete', 'completed', `🎉 Email extraction completed successfully! Found ${found.size} email(s)`, {
        totalEmails: found.size,
        scannedUrls: scannedUrls.size,
        emails: Array.from(found)
      });

      EmailExtractorCore.logger.info('Email extraction completed', { 
        url, 
        emailsFound: found.size, 
        pagesScanned: scannedUrls.size 
      });

      return Array.from(found);
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
      results.forEach(emails => emails.forEach(email => found.add(email)));
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
  private static readonly EXTRACTION_TIMEOUT = 30000; // 30 seconds max per URL
  private static readonly BUSINESS_PATHS = [
    '/business', '/partnership', '/team', '/company'
  ];
  private static readonly COMMON_CHECKOUT_PATHS = [
    '/checkout', '/cart', '/payment'
  ];
  private static readonly MAX_PAGES_TO_SCAN = 5; // Reduced from 20 to 5 for speed

  /**
   * Generate common business email patterns as fallback
   */
  private static generateCommonBusinessEmails(domain: string): string[] {
    const commonPatterns = [
      'contact',
      'info',
      'support',
      'sales',
      'hello',
      'admin',
      'webmaster',
      'help',
      'business',
      'inquiries',
      'general',
      'office',
      'team',
      'service',
      'customer',
      'clients',
      'partnership',
      'media',
      'press',
      'careers',
      'jobs',
      'hr',
      'legal',
      'billing',
      'accounts',
      'finance',
      'marketing',
      'social',
      'community',
      'feedback'
    ];

    return commonPatterns.map(pattern => `${pattern}@${domain}`);
  }

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
