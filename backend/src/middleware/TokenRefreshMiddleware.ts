import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../services/JwtService';
import { UserService } from '../services/UserService';
import { Logger } from '../utils/Logger';

export class TokenRefreshMiddleware {
  private static logger: Logger = new Logger();

  /**
   * Middleware to automatically refresh expired access tokens using refresh tokens
   */
  public static async autoRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only process if we have a refresh token and no valid access token
      const refreshToken = req.cookies.refreshToken;
      const accessToken = req.cookies.accessToken;

      if (!refreshToken) {
        // No refresh token, continue without authentication
        next();
        return;
      }

      // If we have a valid access token, continue normally
      if (accessToken) {
        try {
          await JwtService.verifyAccessToken(accessToken);
          // Access token is valid, continue
          next();
          return;
        } catch (error) {
          // Only try to refresh if the error is specifically about expiration
          // Don't refresh for other errors like "Token has been revoked" or "Session has been invalidated"
          if (error instanceof Error && error.message === 'Token expired') {
            TokenRefreshMiddleware.logger.info('Access token expired, attempting refresh', {
              ip: req.ip,
              userAgent: req.get('User-Agent')
            });
          } else {
            // For other errors (like revoked tokens or invalidated sessions), don't try to refresh
            TokenRefreshMiddleware.logger.warn('Access token invalid, not attempting refresh', {
              error: error instanceof Error ? error.message : 'Unknown error',
              ip: req.ip
            });
            next();
            return;
          }
        }
      }

      // Try to refresh the token
      try {
        const { userId } = JwtService.verifyRefreshToken(refreshToken);
        
        // Detect mobile device for logging
        const userAgent = req.get('User-Agent') || '';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Get user data
        const userResult = await UserService.getUserById(userId);
        if (!userResult.success || !userResult.data) {
          throw new Error('User not found');
        }

        // Generate new token pair
        const tokenPair = JwtService.generateTokenPair({
          userId: (userResult.data._id as any).toString(),
          email: userResult.data.email,
          username: userResult.data.username,
          isAdmin: userResult.data.isAdmin || false
        });

        // Blacklist old refresh token
        JwtService.blacklistToken(refreshToken);

        // Set new cookies with consistent settings
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Get cookie configuration from environment
        const cookieDomain = isProduction 
          ? (process.env.COOKIE_DOMAIN_PROD || process.env.COOKIE_DOMAIN || '.agentworld.online')
          : (process.env.COOKIE_DOMAIN_DEV || process.env.COOKIE_DOMAIN || undefined);
        
        const cookieSecure = isProduction 
          ? (process.env.COOKIE_SECURE_PROD === 'true' || process.env.COOKIE_SECURE === 'true' || true)
          : (process.env.COOKIE_SECURE_DEV === 'true' || process.env.COOKIE_SECURE === 'true' || false);
        
        const cookieSameSite = isProduction 
          ? (process.env.COOKIE_SAME_SITE_PROD || process.env.COOKIE_SAME_SITE || 'none')
          : (process.env.COOKIE_SAME_SITE_DEV || process.env.COOKIE_SAME_SITE || 'lax');
        
        // Ensure maxAge doesn't exceed 32-bit integer limit
        const maxAge = Math.min(tokenPair.expiresIn * 1000, 2147483647); // 32-bit signed integer max
        res.cookie('accessToken', tokenPair.accessToken, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: cookieSameSite as any,
          maxAge: maxAge,
          path: '/',
          domain: cookieDomain
        });

        const refreshMaxAge = parseInt(process.env.COOKIE_MAX_AGE_REFRESH || '604800000'); // 7 days
        res.cookie('refreshToken', tokenPair.refreshToken, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: cookieSameSite as any,
          maxAge: refreshMaxAge,
          path: '/',
          domain: cookieDomain
        });

        // Set isAuthenticated cookie for frontend
        res.cookie('isAuthenticated', 'true', {
          httpOnly: false, // Frontend can read this
          secure: cookieSecure,
          sameSite: cookieSameSite as any,
          maxAge: refreshMaxAge,
          path: '/',
          domain: cookieDomain
        });

        // Add user to request object
        (req as any).user = {
          id: (userResult.data._id as any).toString(),
          email: userResult.data.email,
          username: userResult.data.username,
          subscriptionTier: userResult.data.subscription,
          subscriptionExpiresAt: userResult.data.subscriptionExpiresAt,
          isAdmin: userResult.data.isAdmin
        };

        // Only log token refresh in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
          TokenRefreshMiddleware.logger.debug('Token refreshed successfully', {
            userId: (userResult.data._id as any).toString(),
            email: userResult.data.email,
            ip: req.ip,
            userAgent: userAgent,
            isMobile: isMobile
          });
        }

        next();
      } catch (refreshError) {
        // Refresh failed, clear cookies and continue without authentication
        TokenRefreshMiddleware.logger.warn('Token refresh failed', {
          error: refreshError instanceof Error ? refreshError.message : 'Unknown error',
          ip: req.ip
        });

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          path: '/',
          // domain: isProduction ? 'agentworld.online' : undefined // Commented out to allow default domain behavior
        };
        
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('isAuthenticated', cookieOptions);

        next();
      }
    } catch (error) {
      TokenRefreshMiddleware.logger.error('Token refresh middleware error:', error);
      next();
    }
  }
}
