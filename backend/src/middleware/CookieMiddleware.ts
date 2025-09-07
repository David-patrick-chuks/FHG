import { NextFunction, Request, Response } from 'express';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

export class CookieMiddleware {
  /**
   * Middleware to parse and manage cookies
   */
  static parseCookies(req: Request, res: Response, next: NextFunction) {
    // Parse cookies from the Cookie header
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies: Record<string, string> = {};
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      });
      req.cookies = cookies;
    } else {
      req.cookies = {};
    }
    next();
  }

  /**
   * Set a cookie with proper security settings
   */
  static setCookie(
    res: Response,
    name: string,
    value: string,
    options: CookieOptions = {}
  ) {
    const {
      httpOnly = true,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax',
      maxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
      path = '/',
      domain
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (maxAge) {
      cookieString += `; Max-Age=${Math.floor(maxAge / 1000)}`;
    }

    cookieString += `; Path=${path}`;

    if (domain) {
      cookieString += `; Domain=${domain}`;
    }

    if (secure) {
      cookieString += '; Secure';
    }

    if (httpOnly) {
      cookieString += '; HttpOnly';
    }

    cookieString += `; SameSite=${sameSite}`;

    res.setHeader('Set-Cookie', cookieString);
  }

  /**
   * Clear a cookie
   */
  static clearCookie(res: Response, name: string, path: string = '/') {
    res.setHeader('Set-Cookie', `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`);
  }

  /**
   * Get a cookie value from request
   */
  static getCookie(req: Request, name: string): string | undefined {
    return req.cookies?.[name];
  }

  /**
   * Set session cookie for authentication
   */
  static setSessionCookie(res: Response, sessionId: string) {
    this.setCookie(res, 'session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Set CSRF token cookie
   */
  static setCSRFToken(res: Response, token: string) {
    this.setCookie(res, 'csrf_token', token, {
      httpOnly: false, // Needs to be accessible to JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  /**
   * Set user preferences cookie
   */
  static setUserPreferences(res: Response, preferences: any) {
    this.setCookie(res, 'user_preferences', JSON.stringify(preferences), {
      httpOnly: false, // Needs to be accessible to JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  /**
   * Set functional consent cookie
   */
  static setFunctionalConsent(res: Response, consented: boolean) {
    this.setCookie(res, 'functional_consent', consented.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  /**
   * Set analytics consent cookie
   */
  static setAnalyticsConsent(res: Response, consented: boolean) {
    this.setCookie(res, 'analytics_consent', consented.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  /**
   * Set marketing consent cookie
   */
  static setMarketingConsent(res: Response, consented: boolean) {
    this.setCookie(res, 'marketing_consent', consented.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  /**
   * Middleware to handle cookie consent
   */
  static handleCookieConsent(req: Request, res: Response, next: NextFunction) {
    const analyticsConsent = this.getCookie(req, 'analytics_consent');
    const marketingConsent = this.getCookie(req, 'marketing_consent');

    // Add consent information to request object
    req.cookieConsent = {
      analytics: analyticsConsent === 'true',
      marketing: marketingConsent === 'true',
    };

    next();
  }

  /**
   * Middleware to validate CSRF token
   */
  static validateCSRFToken(req: Request, res: Response, next: NextFunction): void {
    const csrfToken = this.getCookie(req, 'csrf_token');
    const headerToken = req.headers['x-csrf-token'] as string;

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      if (!csrfToken || !headerToken || csrfToken !== headerToken) {
        res.status(403).json({
          success: false,
          message: 'Invalid CSRF token'
        });
        return;
      }
    }

    next();
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      cookies?: Record<string, string>;
      cookieConsent?: {
        analytics: boolean;
        marketing: boolean;
      };
    }
  }
}
