import crypto from 'crypto';
import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import SessionModel from '../models/Session';
import UserModel from '../models/User';
import { ActivityService } from '../services/ActivityService';
import { JwtService } from '../services/JwtService';
import { UserService } from '../services/UserService';
import { WelcomeEmailService } from '../services/WelcomeEmailService';
import { ActivityType } from '../types';
import { Logger } from '../utils/Logger';

export class AuthController {
  private static logger: Logger = new Logger();

  private static generateToken(user: any, rememberMe: boolean = false, sessionId?: string): { accessToken: string; refreshToken: string; expiresIn: number } {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin || false
    };
    
    const tokenPair = JwtService.generateTokenPair(payload, rememberMe, sessionId);
    return tokenPair;
  }

  /**
   * Get device information from request
   */
  private static getDeviceInfo(req: Request): any {
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Simple device type detection
    let deviceType = 'unknown';
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/desktop|windows|mac|linux/i.test(userAgent)) {
      deviceType = 'desktop';
    }

    return {
      userAgent,
      ipAddress,
      deviceType
    };
  }

  /**
   * Set HTTP-only authentication cookies
   */
  private static setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string; expiresIn: number }, rememberMe: boolean = false): void {
    // Check if we're running on localhost (development)
    const isLocalhost = process.env.API_BASE_URL?.includes('localhost') || 
                       process.env.API_BASE_URL?.includes('127.0.0.1') ||
                       process.env.NODE_ENV === 'development';
    
    // Get cookie configuration from environment
    const cookieDomain = isLocalhost 
      ? undefined // No domain for localhost
      : (process.env.COOKIE_DOMAIN_PROD || process.env.COOKIE_DOMAIN || '.agentworld.online');
    
    const cookieSecure = isLocalhost 
      ? false // Never secure for localhost
      : (process.env.COOKIE_SECURE_PROD === 'true' || process.env.COOKIE_SECURE === 'true' || true);
    
    const cookieSameSite = isLocalhost 
      ? 'lax' // Lax for localhost development
      : (process.env.COOKIE_SAME_SITE_PROD || process.env.COOKIE_SAME_SITE || 'none');

    // Debug logging for development
    if (isLocalhost) {
      console.log('🍪 Setting cookies for localhost development:', {
        cookieDomain,
        cookieSecure,
        cookieSameSite,
        apiBaseUrl: process.env.API_BASE_URL,
        nodeEnv: process.env.NODE_ENV
      });
    }
    
    // Access token cookie (15 minutes)
    // Ensure maxAge doesn't exceed 32-bit integer limit
    const maxAge = Math.min(tokens.expiresIn * 1000, 2147483647); // 32-bit signed integer max
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite as any,
      maxAge: maxAge,
      path: '/',
      domain: cookieDomain
    });

    // Refresh token cookie (7 days or 30 days if remember me)
    const refreshMaxAge = rememberMe ? 
      parseInt(process.env.COOKIE_MAX_AGE_REFRESH_REMEMBER || '2592000000') : 
      parseInt(process.env.COOKIE_MAX_AGE_REFRESH || '604800000');
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite as any,
      maxAge: refreshMaxAge,
      path: '/',
      domain: cookieDomain
    });

    // User session cookie (for frontend to know if user is logged in)
    res.cookie('isAuthenticated', 'true', {
      httpOnly: false, // Frontend can read this
      secure: cookieSecure,
      sameSite: cookieSameSite as any,
      maxAge: refreshMaxAge,
      path: '/',
      domain: cookieDomain
    });
  }

  /**
   * Clear authentication cookies
   */
  private static clearAuthCookies(res: Response): void {
    // Check if we're running on localhost (development)
    const isLocalhost = process.env.API_BASE_URL?.includes('localhost') || 
                       process.env.API_BASE_URL?.includes('127.0.0.1') ||
                       process.env.NODE_ENV === 'development';
    
    const cookieDomain = isLocalhost 
      ? undefined // No domain for localhost
      : (process.env.COOKIE_DOMAIN_PROD || process.env.COOKIE_DOMAIN || '.agentworld.online');
    
    const cookieOptions = {
      path: '/',
      domain: cookieDomain
    };
    
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('isAuthenticated', cookieOptions);
  }

  public static async register(req: Request, res: Response): Promise<void> {
    try {
      AuthController.logger.info('User registration attempt', {
        email: req.body.email,
        username: req.body.username,
        ip: req.ip
      });

      const result = await UserService.createUser(req.body);

      if (result.success && result.data) {
        // Remove sensitive fields from response and properly serialize
        const userData = { ...result.data.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        // Properly serialize MongoDB objects to JSON
        const serializedUserData = {
          _id: userData._id.toString(),
          email: userData.email,
          username: userData.username,
          subscription: userData.subscription,
          billingCycle: userData.billingCycle,
          isActive: userData.isActive,
          isAdmin: userData.isAdmin,
          subscriptionExpiresAt: userData.subscriptionExpiresAt?.toISOString(),
          createdAt: userData.createdAt?.toISOString(),
          updatedAt: userData.updatedAt?.toISOString(),
          lastLoginAt: userData.lastLoginAt?.toISOString(),
          apiKey: userData.apiKey,
          apiKeyCreatedAt: userData.apiKeyCreatedAt?.toISOString(),
          apiKeyLastUsed: userData.apiKeyLastUsed?.toISOString()
        };

        // Generate JWT tokens
        const tokens = AuthController.generateToken(result.data);

        // Set HTTP-only cookies
        AuthController.setAuthCookies(res, tokens);

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: serializedUserData
          },
          timestamp: new Date()
        });

        // Log user registration activity
        await ActivityService.logUserActivity(
          (result.data._id as any).toString(),
          ActivityType.USER_REGISTERED
        );

        // Send welcome email asynchronously (don't wait for it)
        WelcomeEmailService.sendWelcomeEmail(result.data).catch(error => {
          AuthController.logger.error('Failed to send welcome email after registration:', error);
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Registration error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { rememberMe = false } = req.body;
      
      // Detect mobile device
      const userAgent = req.get('User-Agent') || '';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

      // Only log login attempts in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        AuthController.logger.debug('User login attempt', {
          email: req.body.email,
          rememberMe,
          ip: req.ip,
          userAgent: userAgent,
          isMobile: isMobile
        });
      }

      const result = await UserService.loginUser(req.body);

      if (result.success && result.data) {
        const user = result.data.user;
        
        // Generate unique session ID
        const sessionId = crypto.randomUUID();
        
        // Get device information
        const deviceInfo = AuthController.getDeviceInfo(req);
        
        // Check if user allows multiple sessions
        if (!user.allowMultipleSessions) {
          // Invalidate all existing sessions for single session mode
          await SessionModel.invalidateUserSessions((user._id as any).toString());
          
          AuthController.logger.info('Invalidated existing sessions for single session mode', {
            userId: (user._id as any).toString(),
            email: user.email
          });
        }
        
        // Create new session
        await SessionModel.createSession((user._id as any).toString(), sessionId, deviceInfo);
        
        // Update user's current session ID
        await UserModel.findByIdAndUpdate(user._id, {
          currentSessionId: sessionId,
          lastLoginAt: new Date()
        });
        
        // Remove sensitive fields from response and properly serialize
        const userData = { ...user.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        // Properly serialize MongoDB objects to JSON
        const serializedUserData = {
          _id: userData._id.toString(),
          email: userData.email,
          username: userData.username,
          subscription: userData.subscription,
          billingCycle: userData.billingCycle,
          isActive: userData.isActive,
          isAdmin: userData.isAdmin,
          subscriptionExpiresAt: userData.subscriptionExpiresAt?.toISOString(),
          createdAt: userData.createdAt?.toISOString(),
          updatedAt: userData.updatedAt?.toISOString(),
          lastLoginAt: userData.lastLoginAt?.toISOString(),
          apiKey: userData.apiKey,
          apiKeyCreatedAt: userData.apiKeyCreatedAt?.toISOString(),
          apiKeyLastUsed: userData.apiKeyLastUsed?.toISOString()
        };

        // Generate tokens with session ID
        const tokens = AuthController.generateToken(user, rememberMe, sessionId);

        // Set HTTP-only cookies
        AuthController.setAuthCookies(res, tokens, rememberMe);

        // Only log successful login in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
          AuthController.logger.debug('User logged in successfully', {
            userId: result.data.user._id,
            email: result.data.user.email,
            ip: req.ip,
            userAgent: userAgent,
            isMobile: isMobile,
            rememberMe: rememberMe
          });
        }

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: serializedUserData
          },
          timestamp: new Date()
        });

        // Log user login activity
        await ActivityService.logUserActivity(
          (result.data.user._id as any).toString(),
          ActivityType.USER_LOGIN
        );
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Login error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      // Only log profile retrieval in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        AuthController.logger.debug('Profile retrieval request', {
          userId,
          ip: req.ip
        });
      }

      const result = await UserService.getUserById(userId);

      if (result.success && result.data) {
        // Remove sensitive fields from response and properly serialize
        const userData = { ...result.data.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        // Properly serialize MongoDB objects to JSON
        const serializedUserData = {
          _id: userData._id.toString(),
          email: userData.email,
          username: userData.username,
          subscription: userData.subscription,
          billingCycle: userData.billingCycle,
          isActive: userData.isActive,
          isAdmin: userData.isAdmin,
          subscriptionExpiresAt: userData.subscriptionExpiresAt?.toISOString(),
          createdAt: userData.createdAt?.toISOString(),
          updatedAt: userData.updatedAt?.toISOString(),
          lastLoginAt: userData.lastLoginAt?.toISOString(),
          apiKey: userData.apiKey,
          apiKeyCreatedAt: userData.apiKeyCreatedAt?.toISOString(),
          apiKeyLastUsed: userData.apiKeyLastUsed?.toISOString()
        };

        res.status(200).json({
          success: true,
          message: 'Profile retrieved successfully',
          data: serializedUserData,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Profile retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.email; // Email updates should go through a separate process
      delete updateData.subscriptionTier;
      delete updateData.isAdmin;

      AuthController.logger.info('Profile update request', {
        userId,
        updateFields: Object.keys(updateData),
        ip: req.ip
      });

      const result = await UserService.updateUser(userId, updateData);

      if (result.success && result.data) {
        // Only log activity if there were actual changes
        if (result.message === 'User updated successfully') {
          await ActivityService.logUserActivity(
            userId,
            ActivityType.USER_PROFILE_UPDATED,
            `Updated fields: ${Object.keys(updateData).join(', ')}`
          );
        }

        // Remove sensitive fields from response and properly serialize
        const userData = { ...result.data.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        // Properly serialize MongoDB objects to JSON
        const serializedUserData = {
          _id: userData._id.toString(),
          email: userData.email,
          username: userData.username,
          subscription: userData.subscription,
          billingCycle: userData.billingCycle,
          isActive: userData.isActive,
          isAdmin: userData.isAdmin,
          subscriptionExpiresAt: userData.subscriptionExpiresAt?.toISOString(),
          createdAt: userData.createdAt?.toISOString(),
          updatedAt: userData.updatedAt?.toISOString(),
          lastLoginAt: userData.lastLoginAt?.toISOString(),
          apiKey: userData.apiKey,
          apiKeyCreatedAt: userData.apiKeyCreatedAt?.toISOString(),
          apiKeyLastUsed: userData.apiKeyLastUsed?.toISOString()
        };

        res.status(200).json({
          success: true,
          message: result.message, // Use the message from UserService
          data: serializedUserData,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Profile update error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
          timestamp: new Date()
        });
        return;
      }

      // Validate new password
      const passwordValidation = ValidationMiddleware.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Password validation failed',
          errors: passwordValidation.errors,
          timestamp: new Date()
        });
        return;
      }

      AuthController.logger.info('Password change request', {
        userId,
        ip: req.ip
      });

      const result = await UserService.changePassword(userId, currentPassword, newPassword);

      if (result.success) {
        // Log user password change activity
        await ActivityService.logUserActivity(
          userId,
          ActivityType.USER_PASSWORD_CHANGED
        );

        res.status(200).json({
          success: true,
          message: 'Password changed successfully',
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Password change error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate email
      if (!ValidationMiddleware.validateEmail(email)) {
        res.status(400).json({
          success: false,
          message: 'Valid email is required',
          timestamp: new Date()
        });
        return;
      }

      AuthController.logger.info('Password reset request', {
        email: ValidationMiddleware.sanitizeEmail(email),
        ip: req.ip
      });

      const result = await UserService.resetPassword(email);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Password reset link sent',
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Password reset error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async resetPasswordWithToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required',
          timestamp: new Date()
        });
        return;
      }

      AuthController.logger.info('Password reset with token request', {   
        ip: req.ip
      });

      const result = await UserService.resetPasswordWithToken(token, newPassword);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Password reset successfully',
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Password reset with token error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      AuthController.logger.info('Reset token verification request', {
        ip: req.ip
      });

      const result = await UserService.verifyResetToken(token);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Reset token verification error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      AuthController.logger.info('User stats request', {
        userId,
        ip: req.ip
      });

      const result = await UserService.getUserStats(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'User stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      AuthController.logger.error('User stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
             const token = req.headers.authorization?.replace('Bearer ', '') || req.query['token'] as string;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token is required',
          timestamp: new Date()
        });
        return;
      }

      AuthController.logger.info('Token verification request', {
        ip: req.ip
      });

      const result = await UserService.verifyToken(token);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Token verified successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      AuthController.logger.error('Token verification error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not found',
          timestamp: new Date()
        });
        return;
      }

      AuthController.logger.info('Token refresh request', {
        ip: req.ip
      });

      // Verify refresh token
      const { userId } = JwtService.verifyRefreshToken(refreshToken);

      // Get user data
      const userResult = await UserService.getUserById(userId);
      if (!userResult.success || !userResult.data) {
        res.status(401).json({
          success: false,
          message: 'User not found',
          timestamp: new Date()
        });
        return;
      }

      // Generate new token pair
      const tokenPair = AuthController.generateToken(userResult.data);

      // Blacklist old refresh token
      JwtService.blacklistToken(refreshToken);

      // Set new cookies
      AuthController.setAuthCookies(res, tokenPair);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        timestamp: new Date()
      });
    } catch (error: any) {
      AuthController.logger.error('Token refresh error:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Clear cookies on refresh failure
      AuthController.clearAuthCookies(res);
      
      res.status(401).json({
        success: false,
        message: error?.message || 'Invalid refresh token',
        timestamp: new Date()
      });
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Get user info and session ID from token
      const user = (req as any).user;
      const sessionId = user?.sessionId;
      
      // Invalidate current session if sessionId exists
      if (sessionId) {
        await SessionModel.findOneAndUpdate(
          { sessionId, isActive: true },
          { isActive: false, lastAccessedAt: new Date() }
        );
        
        AuthController.logger.info('Session invalidated on logout', {
          userId: user?.id,
          sessionId
        });
      }
      
      // Clear authentication cookies
      AuthController.clearAuthCookies(res);

      // Log logout activity if user is authenticated
      const userId = user?.id;
      if (userId) {
        await ActivityService.logUserActivity(userId, ActivityType.USER_LOGOUT);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date()
      });
    } catch (error: any) {
      AuthController.logger.error('Logout error:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Still clear cookies even if logging fails
      AuthController.clearAuthCookies(res);
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date()
      });
    }
  }
}
