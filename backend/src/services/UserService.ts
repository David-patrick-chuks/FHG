import jwt from 'jsonwebtoken';
import { BotModel } from '../models/Bot';
import { CampaignModel } from '../models/Campaign';
import { SentEmailModel } from '../models/SentEmail';
import UserModel, { IUserDocument } from '../models/User';
import { ApiResponse, CreateUserRequest, LoginRequest } from '../types';
import { Logger } from '../utils/Logger';
import { EmailService } from './EmailService';

export class UserService {
  private static logger: Logger = new Logger();

  public static async createUser(userData: CreateUserRequest): Promise<ApiResponse<IUserDocument>> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          timestamp: new Date()
        };
      }

      const existingUsername = await UserModel.findOne({ username: userData.username });
      if (existingUsername) {
        return {
          success: false,
          message: 'Username already taken',
          timestamp: new Date()
        };
      }

      // Create new user
      const user = await UserModel.createUser(userData);
      
      UserService.logger.info('User created successfully', { userId: user._id, email: user.email });
      
      return {
        success: true,
        message: 'User created successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error creating user:', error);
      throw error;
    }
  }

  public static async loginUser(loginData: LoginRequest): Promise<ApiResponse<{ user: IUserDocument; token: string }>> {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address.',
          timestamp: new Date()
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
          timestamp: new Date()
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Incorrect password. Please try again.',
          timestamp: new Date()
        };
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const token = this.generateToken((user._id as any).toString());

      // Only log successful login in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        UserService.logger.debug('User logged in successfully', { userId: user._id, email: user.email });
      }
      
      return {
        success: true,
        message: 'Login successful',
        data: { user, token },
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error during login:', error);
      throw error;
    }
  }

  public static async getUserById(userId: string): Promise<ApiResponse<IUserDocument>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error retrieving user:', error);
      throw error;
    }
  }

  public static async updateUser(userId: string, updateData: Partial<IUserDocument>): Promise<ApiResponse<IUserDocument>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Check if there are actual changes
      const hasChanges = Object.keys(updateData).some(key => {
        const currentValue = user[key as keyof typeof user];
        const newValue = updateData[key as keyof typeof updateData];
        
        // Handle different data types
        if (currentValue instanceof Date && newValue instanceof Date) {
          return currentValue.getTime() !== newValue.getTime();
        }
        
        return currentValue !== newValue;
      });

      if (!hasChanges) {
        UserService.logger.info('No changes detected in user update', { userId: user._id });
        return {
          success: true,
          message: 'No changes detected',
          data: user,
          timestamp: new Date()
        };
      }

      // Update user data only if there are changes
      Object.assign(user, updateData);
      await user.save();

      UserService.logger.info('User updated successfully', { 
        userId: user._id,
        changedFields: Object.keys(updateData)
      });
      
      return {
        success: true,
        message: 'User updated successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error updating user:', error);
      throw error;
    }
  }

  public static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
          timestamp: new Date()
        };
      }

      // Update password
      user.password = newPassword;
      await user.save();

      UserService.logger.info('Password changed successfully', { userId: user._id });
      
      return {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error changing password:', error);
      throw error;
    }
  }

  public static async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Generate secure reset token
      const resetToken = this.generateResetToken((user._id as string).toString());
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Store reset token in user document (you might want to create a separate collection for this)
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetTokenExpiry;
      await user.save();

      // Send email with reset link
      try {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/confirm?token=${resetToken}`;
        await EmailService.sendPasswordResetLink(user.email, user.username, resetLink);
        UserService.logger.info('Password reset link sent successfully', { userId: user._id, email: user.email });
      } catch (emailError) {
        UserService.logger.error('Failed to send password reset email:', emailError);
        // Don't fail the entire operation if email fails
        // The reset token was still generated
      }
      
      UserService.logger.info('Password reset initiated', { userId: user._id, email: user.email });
      
      return {
        success: true,
        message: 'Password reset link sent',
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error resetting password:', error);
      throw error;
    }
  }

  public static async resetPasswordWithToken(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      // Find user with valid reset token
      const user = await UserModel.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid or expired reset token',
          timestamp: new Date()
        };
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      UserService.logger.info('Password reset completed successfully', { userId: user._id });
      
      return {
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error completing password reset:', error);
      throw error;
    }
  }

  public static async verifyResetToken(token: string): Promise<ApiResponse<{ valid: boolean; email?: string }>> {
    try {
      const user = await UserModel.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        return {
          success: true,
          message: 'Invalid or expired reset token',
          data: { valid: false },
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Reset token is valid',
        data: { valid: true, email: user.email },
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error verifying reset token:', error);
      throw error;
    }
  }

  public static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Soft delete - mark as inactive
      user.isActive = false;
      await user.save();

      UserService.logger.info('User deleted successfully', { userId: user._id });
      
      return {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error deleting user:', error);
      throw error;
    }
  }

  public static async getUserStats(userId: string): Promise<ApiResponse<{
    totalBots: number;
    totalCampaigns: number;
    totalEmailsSent: number;
    subscriptionStatus: string;
    daysUntilExpiry: number;
    activeCampaigns: number;
    pausedCampaigns: number;
    completedCampaigns: number;
    totalRecipients: number;
    averageOpenRate: number;
    averageReplyRate: number;
    lastActivityDate: Date | null;
  }>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Get actual stats from other models
      const [
        totalBots,
        totalCampaigns,
        totalEmailsSent,
        campaignStats,
        lastActivity
      ] = await Promise.all([
        // Count user's bots
        BotModel.getInstance().countDocuments({ userId, isActive: true }),
        
        // Count user's campaigns
        CampaignModel.getInstance().countDocuments({ userId }),
        
        // Count total emails sent by user
        SentEmailModel.getInstance().countDocuments({ 
          campaignId: { 
            $in: await CampaignModel.getInstance().find({ userId }).distinct('_id') 
          } 
        }),
        
        // Get campaign status breakdown
        CampaignModel.getInstance().aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Get last activity date
        SentEmailModel.getInstance().findOne({
          campaignId: { 
            $in: await CampaignModel.getInstance().find({ userId }).distinct('_id') 
          }
        }).sort({ sentAt: -1 }).select('sentAt')
      ]);

      // Calculate campaign status counts
      const statusCounts = campaignStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>);

      const activeCampaigns = statusCounts.running || 0;
      const pausedCampaigns = statusCounts.paused || 0;
      const completedCampaigns = statusCounts.completed || 0;

      // Calculate total recipients across all campaigns
      const totalRecipients = await CampaignModel.getInstance().aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalRecipients: { $sum: { $size: '$emailList' } }
          }
        }
      ]).then(result => result[0]?.totalRecipients || 0);

      // Calculate email performance metrics
      const emailMetrics = await SentEmailModel.getInstance().aggregate([
        {
          $match: {
            campaignId: { 
              $in: await CampaignModel.getInstance().find({ userId }).distinct('_id') 
            }
          }
        },
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            openedEmails: { $sum: { $cond: [{ $ne: ['$openedAt', null] }, 1, 0] } },
            repliedEmails: { $sum: { $cond: [{ $ne: ['$repliedAt', null] }, 1, 0] } }
          }
        }
      ]).then(result => result[0] || { totalEmails: 0, openedEmails: 0, repliedEmails: 0 });

      const averageOpenRate = emailMetrics.totalEmails > 0 
        ? Math.round((emailMetrics.openedEmails / emailMetrics.totalEmails) * 100 * 100) / 100 
        : 0;
      
      const averageReplyRate = emailMetrics.totalEmails > 0 
        ? Math.round((emailMetrics.repliedEmails / emailMetrics.totalEmails) * 100 * 100) / 100 
        : 0;

      const stats = {
        totalBots,
        totalCampaigns,
        totalEmailsSent,
        subscriptionStatus: user.hasActiveSubscription() ? 'active' : 'expired',
        daysUntilExpiry: user.hasActiveSubscription() ? 
          Math.ceil((user.subscriptionExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
        activeCampaigns,
        pausedCampaigns,
        completedCampaigns,
        totalRecipients,
        averageOpenRate,
        averageReplyRate,
        lastActivityDate: lastActivity?.sentAt || null
      };

      UserService.logger.info('User stats retrieved successfully', { userId, stats });

      return {
        success: true,
        message: 'User stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  public static async verifyToken(token: string): Promise<ApiResponse<{ userId: string }>> {
    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as { userId: string };
      
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Invalid or expired token',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Token verified successfully',
        data: { userId: decoded.userId },
        timestamp: new Date()
      };
    } catch (error) {
      UserService.logger.error('Error verifying token:', error);
      return {
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date()
      };
    }
  }

  private static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env['JWT_SECRET']!,
      { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' } as any
    );
  }

  private static generateResetToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env['JWT_SECRET']!,
      { expiresIn: '1h' } as any // 1 hour expiry
    );
  }
}
