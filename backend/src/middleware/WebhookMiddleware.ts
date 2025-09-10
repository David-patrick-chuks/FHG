import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

export class WebhookMiddleware {
  private static logger: Logger = new Logger();

  // Paystack webhook IP addresses (from documentation)
  private static readonly PAYSTACK_IPS = [
    '52.31.139.75',
    '52.49.173.169',
    '52.214.14.220'
  ];

  /**
   * Middleware to verify webhook requests come from Paystack IPs
   */
  public static verifyPaystackIP(req: Request, res: Response, next: NextFunction): void {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Extract IP from forwarded headers if behind proxy
    const forwardedIP = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    
    const actualIP = forwardedIP?.split(',')[0]?.trim() || realIP || clientIP;

    WebhookMiddleware.logger.info('Webhook IP verification', {
      clientIP,
      forwardedIP,
      realIP,
      actualIP,
      userAgent: req.headers['user-agent']
    });

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development' && 
        (actualIP === '127.0.0.1' || actualIP === '::1' || actualIP === '::ffff:127.0.0.1')) {
      WebhookMiddleware.logger.info('Development mode: allowing localhost IP', { actualIP });
      return next();
    }

    // Check if IP is in Paystack whitelist
    if (!actualIP || !WebhookMiddleware.PAYSTACK_IPS.includes(actualIP)) {
      WebhookMiddleware.logger.warn('Webhook request from unauthorized IP', {
        actualIP,
        allowedIPs: WebhookMiddleware.PAYSTACK_IPS
      });
      
      res.status(403).json({
        success: false,
        message: 'Unauthorized IP address',
        timestamp: new Date()
      });
      return;
    }

    WebhookMiddleware.logger.info('Webhook IP verified successfully', { actualIP });
    next();
  }
}
