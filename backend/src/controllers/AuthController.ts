import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { ActivityType } from '../models/Activity';
import { ActivityService } from '../services/ActivityService';
import { UserService } from '../services/UserService';
import { WelcomeEmailService } from '../services/WelcomeEmailService';
import { Logger } from '../utils/Logger';

export class AuthController {
  private static logger: Logger = new Logger();

  private static generateToken(userId: string, rememberMe: boolean = false): string {
    const expiresIn = rememberMe ? '30d' : '24h'; // 30 days for remember me, 24 hours for session
    return jwt.sign(
      { userId },
      process.env['JWT_SECRET']!,
      { expiresIn } as any
    );
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
        // Remove sensitive fields from response
        const userData = { ...result.data.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        // Generate JWT token
        const token = AuthController.generateToken((result.data._id as any).toString());

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: userData,
            token: token
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
      
      AuthController.logger.info('User login attempt', {
        email: req.body.email,
        rememberMe,
        ip: req.ip
      });

      const result = await UserService.loginUser(req.body);

      if (result.success && result.data) {
        // Remove sensitive fields from response
        const userData = { ...result.data.user.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        // Generate token with appropriate expiration based on rememberMe
        const token = AuthController.generateToken((result.data.user._id as any).toString(), rememberMe);

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: userData,
            token: token
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

      AuthController.logger.info('Profile retrieval request', {
        userId,
        ip: req.ip
      });

      const result = await UserService.getUserById(userId);

      if (result.success && result.data) {
        // Remove sensitive fields from response
        const userData = { ...result.data.toObject() };
        delete userData.password;
        delete userData.passwordResetToken;
        delete userData.passwordResetExpires;

        res.status(200).json({
          success: true,
          message: 'Profile retrieved successfully',
          data: userData,
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
         // Remove sensitive fields from response
         const userData = { ...result.data.toObject() };
         delete userData.password;
         delete userData.passwordResetToken;
         delete userData.passwordResetExpires;

        res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: userData,
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

  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      AuthController.logger.info('User logout', {
        userId,
        ip: req.ip
      });

      // In a stateless JWT system, logout is handled client-side
      // But we can log the action for audit purposes
      res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date()
      });
    } catch (error) {
      AuthController.logger.error('Logout error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}
