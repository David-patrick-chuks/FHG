import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

export class WebhookBodyParser {
  private static logger: Logger = new Logger();

  /**
   * Middleware to capture raw body for webhook signature verification
   * This must be used BEFORE express.json() middleware
   */
  public static captureRawBody(req: Request, res: Response, next: NextFunction): void {
    if (req.path.includes('/webhook')) {
      let data = '';
      
      req.setEncoding('utf8');
      
      req.on('data', (chunk: string) => {
        data += chunk;
      });
      
      req.on('end', () => {
        try {
          // Store raw body for signature verification
          (req as any).rawBody = data;
          
          // Parse JSON for normal processing
          req.body = JSON.parse(data);
          
          WebhookBodyParser.logger.info('Webhook raw body captured', {
            path: req.path,
            bodyLength: data.length,
            hasBody: !!req.body
          });
          
          next();
        } catch (error) {
          WebhookBodyParser.logger.error('Error parsing webhook body:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path,
            bodyLength: data.length
          });
          
          res.status(400).json({
            success: false,
            message: 'Invalid JSON in webhook body',
            timestamp: new Date()
          });
        }
      });
    } else {
      // For non-webhook routes, just continue
      next();
    }
  }
}
