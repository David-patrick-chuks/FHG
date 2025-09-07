import { Request, Response } from 'express';
import { EmailExtractorCore } from '../services/email-extractor/EmailExtractorCore';
import { Logger } from '../utils/Logger';

export class PublicApiController {
  private static logger: Logger = new Logger();

  /**
   * Start email extraction from URLs via public API
   */
  public static async startExtraction(req: Request, res: Response): Promise<void> {
    try {
      const { urls, extractionType = 'multiple' } = req.body;
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        res.status(400).json({
          success: false,
          message: 'URLs array is required and must not be empty',
          timestamp: new Date()
        });
        return;
      }

      // Limit number of URLs per request for API
      if (urls.length > 20) {
        res.status(400).json({
          success: false,
          message: 'Maximum 20 URLs allowed per API extraction request',
          timestamp: new Date()
        });
        return;
      }

      // Validate URLs
      const validUrls: string[] = [];
      for (const url of urls) {
        try {
          let normalizedUrl = url.trim();
          
          // If no protocol is provided, try adding https://
          if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = `https://${normalizedUrl}`;
          }
          
          const urlObj = new URL(normalizedUrl);
          if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            validUrls.push(normalizedUrl);
          }
        } catch (error) {
          PublicApiController.logger.warn('Invalid URL in API request', { url, error });
        }
      }

      if (validUrls.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid URLs provided',
          timestamp: new Date()
        });
        return;
      }

      const result = await EmailExtractorCore.startExtraction(userId, validUrls, extractionType);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Email extraction started successfully',
          data: {
            jobId: result.data?.jobId,
            urls: validUrls,
            extractionType,
            status: 'processing'
          },
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      PublicApiController.logger.error('Error in public API startExtraction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get extraction status and results via public API
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
      
      if (!result.success || !result.data) {
        res.status(404).json({
          success: false,
          message: 'Extraction not found',
          timestamp: new Date()
        });
        return;
      }

      // Check if user owns this extraction
      if (String(result.data.userId) !== String(userId)) {
        res.status(403).json({
          success: false,
          message: 'Access denied to this extraction',
          timestamp: new Date()
        });
        return;
      }

      // Format response for public API
      const apiResponse = {
        success: true,
        message: 'Extraction retrieved successfully',
        data: {
          jobId: result.data._id,
          status: result.data.status,
          createdAt: result.data.createdAt,
          completedAt: result.data.completedAt,
          totalUrls: result.data.results?.length || 0,
          totalEmails: result.data.results?.reduce((total: number, result: any) => 
            total + (result.emails?.length || 0), 0) || 0,
          results: result.data.results?.map((extractionResult: any) => ({
            url: extractionResult.url,
            status: extractionResult.status,
            emailCount: extractionResult.emails?.length || 0,
            emails: extractionResult.emails || [],
            extractedAt: extractionResult.extractedAt
          })) || []
        },
        timestamp: new Date()
      };

      res.status(200).json(apiResponse);
    } catch (error) {
      PublicApiController.logger.error('Error in public API getExtraction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Download extraction results as CSV via public API
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

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="email-extraction-${jobId}.csv"`);
      res.status(200).send(csvContent);
    } catch (error) {
      PublicApiController.logger.error('Error in public API downloadResults:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get API usage and limits
   */
  public static async getApiUsage(req: Request, res: Response): Promise<void> {
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
        res.status(200).json({
          success: true,
          message: 'API usage retrieved successfully',
          data: {
            limits: result.data?.limits,
            usage: result.data?.usage,
            canUseCsv: result.data?.canUseCsv,
            needsUpgrade: result.data?.needsUpgrade,
            upgradeRecommendation: result.data?.upgradeRecommendation
          },
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      PublicApiController.logger.error('Error in public API getApiUsage:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
