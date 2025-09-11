import { Request, Response } from 'express';
import { EmailExtractorCore } from '../services/email-extractor/EmailExtractorCore';
import { EmailExtractorActivityService } from '../services/EmailExtractorActivityService';
import { FileUploadService } from '../services/FileUploadService';
import { SubscriptionLimitsService } from '../services/SubscriptionLimitsService';
import { ValidationService } from '../services/ValidationService';
import { Logger } from '../utils/Logger';

export class EmailExtractorController {
  private static logger: Logger = new Logger();

  /**
   * Start email extraction from single or multiple URLs
   */
  public static async startExtraction(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      // Validate and sanitize input
      const { urls, extractionType = 'multiple' } = req.body;

      // Validate extraction type
      const extractionTypeResult = ValidationService.validateEnum(
        extractionType,
        ['single', 'multiple', 'csv'],
        { required: true }
      );

      if (!extractionTypeResult.isValid) {
        res.status(400).json({
          success: false,
          message: `Invalid extraction type: ${extractionTypeResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      // Validate URLs with SSRF protection
      const urlValidationResult = ValidationService.validateUrlArray(urls, {
        maxCount: 50,
        allowedProtocols: ['http:', 'https:'],
        allowLocalhost: false,
        allowPrivateIPs: false
      });

      if (!urlValidationResult.isValid) {
        res.status(400).json({
          success: false,
          message: `URL validation failed: ${urlValidationResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      const urlArray = urlValidationResult.sanitizedValue as string[];

      EmailExtractorController.logger.info('Starting extraction with URLs', { 
        userId, 
        urlArray, 
        extractionType,
        urlCount: urlArray.length 
      });
      
      const result = await EmailExtractorCore.startExtraction(userId, urlArray, extractionType);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      EmailExtractorController.logger.error('Error in startExtraction controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get user's extraction history
   */
  public static async getExtractions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      // Validate pagination parameters
      if (limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Limit cannot exceed 100',
          timestamp: new Date()
        });
        return;
      }

      const result = await EmailExtractorCore.getUserExtractions(userId, limit, skip);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      EmailExtractorController.logger.error('Error in getExtractions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get specific extraction by job ID
   */
  public static async getExtraction(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      if (!jobId) {
        res.status(400).json({
          success: false,
          message: 'Job ID is required',
          timestamp: new Date()
        });
        return;
      }

      const result = await EmailExtractorCore.getExtractionByJobId(jobId);
      
      if (result.success) {
        if (result.data && String(result.data.userId) !== String(userId)) {
          res.status(403).json({
            success: false,
            message: 'Access denied to this extraction',
            timestamp: new Date()
          });
          return;
        }
        
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      EmailExtractorController.logger.error('Error in getExtraction controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Download extraction results as CSV
   */
  public static async downloadResults(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      if (!jobId) {
        res.status(400).json({
          success: false,
          message: 'Job ID is required',
          timestamp: new Date()
        });
        return;
      }

      const result = await EmailExtractorCore.getExtractionByJobId(jobId);
      
      if (!result.success || !result.data) {
        res.status(404).json({
          success: false,
          message: 'Extraction not found',
          timestamp: new Date()
        });
        return;
      }

      if (String(result.data.userId) !== String(userId)) {
        res.status(403).json({
          success: false,
          message: 'Access denied to this extraction',
          timestamp: new Date()
        });
        return;
      }

      // Generate CSV content
      let csvContent = 'URL,Email,Status,Extracted At\n';
      
      for (const extractionResult of result.data.results) {
        if (extractionResult.emails && extractionResult.emails.length > 0) {
          for (const email of extractionResult.emails) {
            csvContent += `"${extractionResult.url}","${email}","${extractionResult.status}","${extractionResult.extractedAt}"\n`;
          }
        } else {
          csvContent += `"${extractionResult.url}","","${extractionResult.status}","${extractionResult.extractedAt}"\n`;
        }
      }

      // Log download activity
      let emailCount = 0;
      for (const extractionResult of result.data.results) {
        if (extractionResult.emails) {
          emailCount += extractionResult.emails.length;
        }
      }
      
      await EmailExtractorActivityService.logResultsDownloaded(userId, jobId, emailCount, 'csv');

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="email-extraction-${jobId}.csv"`);
      res.status(200).send(csvContent);
    } catch (error) {
      EmailExtractorController.logger.error('Error in downloadResults controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Parse CSV file and extract URLs
   */
  public static async parseCsvFile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      // Check if user can use CSV upload
      const canUseCsv = await SubscriptionLimitsService.needsUpgradeForCsv(userId);
      if (canUseCsv) {
        res.status(403).json({
          success: false,
          message: 'CSV upload is not available in your current plan. Please upgrade to Pro or Enterprise.',
          timestamp: new Date(),
          requiresUpgrade: true
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate CSV file content
      const csvValidationResult = FileUploadService.validateCsvFile(req.file, {
        maxRows: 1000,
        maxColumns: 10,
        maxCellLength: 500
      });

      if (!csvValidationResult.isValid) {
        res.status(400).json({
          success: false,
          message: `CSV validation failed: ${csvValidationResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      // Extract URLs from validated CSV content
      const csvContent = csvValidationResult.sanitizedContent || req.file.buffer.toString('utf-8');
      const urls = FileUploadService.extractUrlsFromCsv(csvContent);
      
      if (urls.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid URLs found in CSV file',
          timestamp: new Date()
        });
        return;
      }

      // Validate extracted URLs with SSRF protection
      const urlValidationResult = ValidationService.validateUrlArray(urls, {
        maxCount: 1000,
        allowedProtocols: ['http:', 'https:'],
        allowLocalhost: false,
        allowPrivateIPs: false
      });

      if (!urlValidationResult.isValid) {
        res.status(400).json({
          success: false,
          message: `URL validation failed: ${urlValidationResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      const validUrls = urlValidationResult.sanitizedValue as string[];

      // Check subscription limits for CSV upload
      const canExtract = await SubscriptionLimitsService.canPerformExtraction(
        userId,
        validUrls.length,
        true // isCsvUpload
      );

      if (!canExtract.canExtract) {
        res.status(400).json({
          success: false,
          message: canExtract.reason || 'Extraction limit reached',
          timestamp: new Date()
        });
        return;
      }

      // Limit number of URLs based on subscription
      const maxUrls = canExtract.limits.isUnlimited ? 1000 : canExtract.limits.dailyExtractionLimit;
      const limitedUrls = validUrls.slice(0, Math.min(maxUrls, 1000));

      res.status(200).json({
        success: true,
        data: {
          totalUrls: urls.length,
          validUrls: validUrls.length,
          urls: limitedUrls,
          limits: canExtract.limits,
          usage: canExtract.usage
        },
        message: `Parsed ${limitedUrls.length} valid URLs from CSV`,
        timestamp: new Date()
      });
    } catch (error) {
      EmailExtractorController.logger.error('Error in parseCsvFile controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get subscription limits and usage info
   */
  public static async getSubscriptionInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      const result = await EmailExtractorCore.getSubscriptionInfo(userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      EmailExtractorController.logger.error('Error in getSubscriptionInfo controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Log results viewed activity
   */
  public static async logResultsViewed(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      if (!jobId) {
        res.status(400).json({
          success: false,
          message: 'Job ID is required',
          timestamp: new Date()
        });
        return;
      }

      // Get extraction to count emails
      const result = await EmailExtractorCore.getExtractionByJobId(jobId);
      
      if (result.success && result.data && result.data.userId === userId) {
        let emailCount = 0;
        if (result.data.results) {
          result.data.results.forEach((extractionResult: any) => {
            if (extractionResult.emails) {
              emailCount += extractionResult.emails.length;
            }
          });
        }

        // Log the activity
        await EmailExtractorActivityService.logResultsViewed(userId, jobId, emailCount);
      }

      res.status(200).json({
        success: true,
        message: 'Results viewed activity logged',
        timestamp: new Date()
      });
    } catch (error) {
      EmailExtractorController.logger.error('Error in logResultsViewed controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
