import { Response } from 'express';
import { CookieMiddleware } from '../middleware/CookieMiddleware';
import { ApiResponse, CookiePreferences, CookieConsentData } from '../types';
import { Logger } from '../utils/Logger';

export class CookieService {
  private static logger: Logger = new Logger();

  /**
   * Set cookie consent preferences
   */
  public static async setCookieConsent(
    preferences: Partial<CookiePreferences>,
    res: Response
  ): Promise<ApiResponse<CookiePreferences>> {
    try {
      if (!preferences || typeof preferences !== 'object') {
        return {
          success: false,
          message: 'Invalid preferences data',
          timestamp: new Date()
        };
      }

      const { essential, functional, analytics, marketing } = preferences;

      // Set individual consent cookies
      if (typeof functional === 'boolean') {
        CookieMiddleware.setFunctionalConsent(res, functional);
      }

      if (typeof analytics === 'boolean') {
        CookieMiddleware.setAnalyticsConsent(res, analytics);
      }

      if (typeof marketing === 'boolean') {
        CookieMiddleware.setMarketingConsent(res, marketing);
      }

      // Set user preferences cookie
      const finalPreferences: CookiePreferences = {
        essential: essential !== undefined ? essential : true,
        functional: functional !== undefined ? functional : false,
        analytics: analytics !== undefined ? analytics : false,
        marketing: marketing !== undefined ? marketing : false,
      };

      CookieMiddleware.setUserPreferences(res, finalPreferences);

      // Set consent timestamp
      CookieMiddleware.setCookie(res, 'consent_timestamp', Date.now().toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });

      CookieService.logger.info('Cookie consent preferences updated', {
        preferences: finalPreferences
      });

      return {
        success: true,
        message: 'Cookie preferences updated successfully',
        data: finalPreferences,
        timestamp: new Date()
      };
    } catch (error) {
      CookieService.logger.error('Error setting cookie consent:', error);
      return {
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get current cookie consent status
   */
  public static async getCookieConsent(req: any): Promise<ApiResponse<CookieConsentData>> {
    try {
      const analyticsConsent = CookieMiddleware.getCookie(req, 'analytics_consent');
      const marketingConsent = CookieMiddleware.getCookie(req, 'marketing_consent');
      const userPreferences = CookieMiddleware.getCookie(req, 'user_preferences');
      const consentTimestamp = CookieMiddleware.getCookie(req, 'consent_timestamp');

      let preferences: CookiePreferences = {
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      };

      if (userPreferences) {
        try {
          preferences = { ...preferences, ...JSON.parse(userPreferences) };
        } catch (error) {
          CookieService.logger.error('Error parsing user preferences:', error);
        }
      }

      const consentData: CookieConsentData = {
        hasConsent: !!(analyticsConsent || marketingConsent || userPreferences),
        timestamp: consentTimestamp ? parseInt(consentTimestamp) : null,
        preferences,
      };

      return {
        success: true,
        message: 'Cookie consent data retrieved successfully',
        data: consentData,
        timestamp: new Date()
      };
    } catch (error) {
      CookieService.logger.error('Error getting cookie consent:', error);
      return {
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Clear all cookie consent data
   */
  public static async clearCookieConsent(res: Response): Promise<ApiResponse<null>> {
    try {
      // Clear all consent-related cookies
      CookieMiddleware.clearCookie(res, 'analytics_consent');
      CookieMiddleware.clearCookie(res, 'marketing_consent');
      CookieMiddleware.clearCookie(res, 'user_preferences');
      CookieMiddleware.clearCookie(res, 'consent_timestamp');

      CookieService.logger.info('Cookie consent data cleared');

      return {
        success: true,
        message: 'Cookie consent data cleared successfully',
        data: null,
        timestamp: new Date()
      };
    } catch (error) {
      CookieService.logger.error('Error clearing cookie consent:', error);
      return {
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Update specific cookie preference
   */
  public static async updateCookiePreference(
    type: keyof CookiePreferences,
    value: boolean,
    req: any,
    res: Response
  ): Promise<ApiResponse<CookiePreferences>> {
    try {
      if (!type || typeof value !== 'boolean') {
        return {
          success: false,
          message: 'Invalid preference data',
          timestamp: new Date()
        };
      }

      if (!['functional', 'analytics', 'marketing'].includes(type)) {
        return {
          success: false,
          message: 'Invalid preference type',
          timestamp: new Date()
        };
      }

      // Set the specific consent cookie
      switch (type) {
        case 'functional':
          CookieMiddleware.setFunctionalConsent(res, value);
          break;
        case 'analytics':
          CookieMiddleware.setAnalyticsConsent(res, value);
          break;
        case 'marketing':
          CookieMiddleware.setMarketingConsent(res, value);
          break;
      }

      // Update user preferences
      const currentPreferences = CookieMiddleware.getCookie(req, 'user_preferences');
      let preferences: CookiePreferences = {
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      };

      if (currentPreferences) {
        try {
          preferences = { ...preferences, ...JSON.parse(currentPreferences) };
        } catch (error) {
          CookieService.logger.error('Error parsing current preferences:', error);
        }
      }

      preferences[type] = value;
      CookieMiddleware.setUserPreferences(res, preferences);

      CookieService.logger.info('Cookie preference updated', { type, value });

      return {
        success: true,
        message: `${type} preference updated successfully`,
        data: preferences,
        timestamp: new Date()
      };
    } catch (error) {
      CookieService.logger.error('Error updating cookie preference:', error);
      return {
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      };
    }
  }
}
