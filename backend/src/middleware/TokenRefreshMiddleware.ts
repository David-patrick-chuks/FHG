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
          JwtService.verifyAccessToken(accessToken);
          // Access token is valid, continue
          next();
          return;
        } catch (error) {
          // Access token is invalid/expired, try to refresh
          TokenRefreshMiddleware.logger.info('Access token expired, attempting refresh', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
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
        res.cookie('accessToken', tokenPair.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'lax' : 'lax', // Use 'lax' for better mobile compatibility
          maxAge: tokenPair.expiresIn * 1000,
          path: '/',
          // domain: isProduction ? 'agentworld.online' : undefined // Commented out to allow default domain behavior
        });

        res.cookie('refreshToken', tokenPair.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'lax' : 'lax', // Use 'lax' for better mobile compatibility
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
          // domain: isProduction ? 'agentworld.online' : undefined // Commented out to allow default domain behavior
        });

        // Set isAuthenticated cookie for frontend
        res.cookie('isAuthenticated', 'true', {
          httpOnly: false, // Frontend can read this
          secure: isProduction,
          sameSite: isProduction ? 'lax' : 'lax', // Use 'lax' for better mobile compatibility
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
          // domain: isProduction ? 'agentworld.online' : undefined // Commented out to allow default domain behavior
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

        TokenRefreshMiddleware.logger.info('Token refreshed successfully', {
          userId: (userResult.data._id as any).toString(),
          email: userResult.data.email,
          ip: req.ip,
          userAgent: userAgent,
          isMobile: isMobile
        });

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
