import { Request, Response } from 'express';
import { CookieService } from '../services/CookieService';
import { Logger } from '../utils/Logger';

export class CookieController {
  private static logger: Logger = new Logger();

  /**
   * Handle cookie consent preferences
   */
  public static async setCookieConsent(req: Request, res: Response): Promise<void> {
    try {
      const { preferences } = req.body;

      CookieController.logger.info('Cookie consent request', {
        preferences,
        ip: req.ip
      });

      const result = await CookieService.setCookieConsent(preferences, res);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CookieController.logger.error('Error in setCookieConsent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get current cookie consent status
   */
  public static async getCookieConsent(req: Request, res: Response): Promise<void> {
    try {
      CookieController.logger.info('Get cookie consent request', {
        ip: req.ip
      });

      const result = await CookieService.getCookieConsent(req);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      CookieController.logger.error('Error in getCookieConsent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Clear all cookie consent data
   */
  public static async clearCookieConsent(req: Request, res: Response): Promise<void> {
    try {
      CookieController.logger.info('Clear cookie consent request', {
        ip: req.ip
      });

      const result = await CookieService.clearCookieConsent(res);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      CookieController.logger.error('Error in clearCookieConsent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Update specific cookie preference
   */
  public static async updateCookiePreference(req: Request, res: Response): Promise<void> {
    try {
      const { type, value } = req.body;

      CookieController.logger.info('Update cookie preference request', {
        type,
        value,
        ip: req.ip
      });

      const result = await CookieService.updateCookiePreference(type, value, req, res);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CookieController.logger.error('Error in updateCookiePreference controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
