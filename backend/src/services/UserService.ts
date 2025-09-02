import jwt from 'jsonwebtoken';
import UserModel, { IUserDocument } from '../models/User';
import { ApiResponse, CreateUserRequest, LoginRequest } from '../types';
import { Logger } from '../utils/Logger';

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
      
      this.logger.info('User created successfully', { userId: user._id, email: user.email });
      
      return {
        success: true,
        message: 'User created successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error creating user:', error);
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
          message: 'Invalid email or password',
          timestamp: new Date()
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated',
          timestamp: new Date()
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
          timestamp: new Date()
        };
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const token = this.generateToken((user._id as any).toString());

      this.logger.info('User logged in successfully', { userId: user._id, email: user.email });
      
      return {
        success: true,
        message: 'Login successful',
        data: { user, token },
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error during login:', error);
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
      this.logger.error('Error retrieving user:', error);
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

      // Update user data
      Object.assign(user, updateData);
      await user.save();

      this.logger.info('User updated successfully', { userId: user._id });
      
      return {
        success: true,
        message: 'User updated successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error updating user:', error);
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

      this.logger.info('Password changed successfully', { userId: user._id });
      
      return {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error changing password:', error);
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

      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword();
      user.password = tempPassword;
      await user.save();

      // TODO: Send email with temporary password
      this.logger.info('Password reset initiated', { userId: user._id, email: user.email });
      
      return {
        success: true,
        message: 'Password reset email sent',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error resetting password:', error);
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

      this.logger.info('User deleted successfully', { userId: user._id });
      
      return {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      throw error;
    }
  }

  public static async getUserStats(userId: string): Promise<ApiResponse<{
    totalBots: number;
    totalCampaigns: number;
    totalEmailsSent: number;
    subscriptionStatus: string;
    daysUntilExpiry: number;
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

      // TODO: Get actual stats from other models
      const stats = {
        totalBots: 0,
        totalCampaigns: 0,
        totalEmailsSent: 0,
        subscriptionStatus: user.hasActiveSubscription() ? 'active' : 'expired',
        daysUntilExpiry: user.hasActiveSubscription() ? 
          Math.ceil((user.subscriptionExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
      };

      return {
        success: true,
        message: 'User stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting user stats:', error);
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
      this.logger.error('Error verifying token:', error);
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

  private static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
