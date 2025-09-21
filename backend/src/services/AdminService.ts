import AdminActionModel, { IAdminActionDocument } from '../models/AdminAction';
import BotModel from '../models/Bot';
import CampaignModel from '../models/Campaign';
import SubscriptionModel from '../models/Subscription';
import UserModel from '../models/User';
import { ApiResponse, SubscriptionStatus, SubscriptionTier } from '../types';
import { Logger } from '../utils/Logger';

export class AdminService {
  private static logger: Logger = new Logger();

  public static async logAdminAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      const adminAction = new AdminActionModel({
        adminId,
        action,
        targetType,
        targetId,
        details,
        ipAddress,
        userAgent
      });

      await adminAction.save();
      AdminService.logger.info('Admin action logged', { adminId, action, targetType, targetId });
    } catch (error) {
      AdminService.logger.error('Error logging admin action:', error);
    }
  }

  public static async getAllUsers(): Promise<ApiResponse<any[]>> {
    try {
      const users = await UserModel.find({}).select('-password');
      
      // Serialize users to convert ObjectIds to strings
      const serializedUsers = users.map(user => ({
        ...user.toObject(),
        _id: (user._id as any).toString()
      }));
      
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: serializedUsers,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving users:', error);
      throw error;
    }
  }

  public static async getUserById(userId: string): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId).select('-password');
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Serialize user to convert ObjectId to string
      const serializedUser = {
        ...user.toObject(),
        _id: (user._id as any).toString()
      };

      return {
        success: true,
        message: 'User retrieved successfully',
        data: serializedUser,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving user:', error);
      throw error;
    }
  }

  public static async updateUserSubscription(
    userId: string,
    adminId: string,
    tier: SubscriptionTier,
    duration: number,
    amount: number,
    paymentMethod: string,
    ipAddress: string,
    userAgent: string
  ): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duration);

      // Create or update subscription
      let subscription = await SubscriptionModel.findActiveByUserId(userId);
      
      if (subscription) {
        // Update existing subscription
        subscription.tier = tier;
        subscription.endDate = endDate;
        subscription.amount = amount;
        subscription.paymentMethod = paymentMethod as any;
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.isActive = true as any;
        await subscription.save();
      } else {
        // Create new subscription
        subscription = new SubscriptionModel({
          userId,
          tier,
          startDate,
          endDate,
          amount,
          paymentMethod,
          status: SubscriptionStatus.ACTIVE,
          isActive: true
        });
        await subscription.save();
      }

      // Update user's subscription info
      user.subscription = tier;
      user.subscriptionExpiresAt = endDate;
      await user.save();

      // Log admin action
      await this.logAdminAction(
        adminId,
        'UPDATE_SUBSCRIPTION',
        'user',
        userId,
        { tier, duration, amount, paymentMethod, oldTier: user.subscription },
        ipAddress,
        userAgent
      );

      AdminService.logger.info('User subscription updated by admin', {
        adminId,
        userId,
        tier,
        duration,
        amount
      });

      // Serialize user and subscription to convert ObjectIds to strings
      const serializedUser = {
        ...user.toObject(),
        _id: (user._id as any).toString()
      };
      
      const serializedSubscription = {
        ...subscription.toObject(),
        _id: (subscription._id as any).toString(),
        userId: (subscription.userId as any).toString()
      };

      return {
        success: true,
        message: 'User subscription updated successfully',
        data: { user: serializedUser, subscription: serializedSubscription },
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error updating user subscription:', error);
      throw error;
    }
  }

  public static async suspendUser(userId: string, adminId: string, reason: string, ipAddress: string, userAgent: string): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Suspend user
      user.isActive = false;
      await user.save();

      // Suspend user's subscription if exists
      const subscription = await SubscriptionModel.findActiveByUserId(userId);
      if (subscription) {
        subscription.status = SubscriptionStatus.SUSPENDED;
        (subscription as any).isActive = false;
        await subscription.save();
      }

      // Log admin action
      await this.logAdminAction(
        adminId,
        'SUSPEND_USER',
        'user',
        userId,
        { reason, previousStatus: 'active' },
        ipAddress,
        userAgent
      );

      AdminService.logger.info('User suspended by admin', {
        adminId,
        userId,
        reason
      });

      // Serialize user to convert ObjectId to string
      const serializedUser = {
        ...user.toObject(),
        _id: (user._id as any).toString()
      };

      return {
        success: true,
        message: 'User suspended successfully',
        data: serializedUser,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error suspending user:', error);
      throw error;
    }
  }

  public static async activateUser(userId: string, adminId: string, ipAddress: string, userAgent: string): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Activate user
      user.isActive = true;
      await user.save();

      // Log admin action
      await this.logAdminAction(
        adminId,
        'ACTIVATE_USER',
        'user',
        userId,
        { previousStatus: 'suspended' },
        ipAddress,
        userAgent
      );

      AdminService.logger.info('User activated by admin', {
        adminId,
        userId
      });

      // Serialize user to convert ObjectId to string
      const serializedUser = {
        ...user.toObject(),
        _id: (user._id as any).toString()
      };

      return {
        success: true,
        message: 'User activated successfully',
        data: serializedUser,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error activating user:', error);
      throw error;
    }
  }

  public static async deleteUser(userId: string, adminId: string, ipAddress: string, userAgent: string): Promise<ApiResponse<void>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Check if user has active campaigns
      const activeCampaigns = await CampaignModel.find({
        userId,
        status: { $in: ['RUNNING', 'PAUSED'] }
      });

      if (activeCampaigns.length > 0) {
        return {
          success: false,
          message: 'Cannot delete user with active campaigns',
          timestamp: new Date()
        };
      }

      // Soft delete user
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      user.username = `deleted_${Date.now()}_${user.username}`;
      await user.save();

      // Log admin action
      await this.logAdminAction(
        adminId,
        'DELETE_USER',
        'user',
        userId,
        { previousEmail: user.email, previousUsername: user.username },
        ipAddress,
        userAgent
      );

      AdminService.logger.info('User deleted by admin', {
        adminId,
        userId
      });

      return {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error deleting user:', error);
      throw error;
    }
  }

  public static async getPlatformStats(): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    totalBots: number;
    activeBots: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    revenueStats: any;
  }>> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalBots,
        activeBots,
        totalCampaigns,
        activeCampaigns,
        totalSubscriptions,
        activeSubscriptions
      ] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ isActive: true }),
        BotModel.countDocuments(),
        BotModel.countDocuments({ isActive: true }),
        CampaignModel.countDocuments(),
        CampaignModel.countDocuments({ status: { $in: ['RUNNING', 'PAUSED'] } }),
        SubscriptionModel.countDocuments(),
        SubscriptionModel.countDocuments({ status: SubscriptionStatus.ACTIVE, isActive: true })
      ]);

      // Get revenue stats for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const revenueStats = await SubscriptionModel.getRevenueStats(startDate, endDate);

      const stats = {
        totalUsers,
        activeUsers,
        totalBots,
        activeBots,
        totalCampaigns,
        activeCampaigns,
        totalSubscriptions,
        activeSubscriptions,
        revenueStats
      };

      return {
        success: true,
        message: 'Platform stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving platform stats:', error);
      throw error;
    }
  }

  public static async getAdminActions(adminId?: string, targetType?: string, days: number = 7): Promise<ApiResponse<IAdminActionDocument[]>> {
    try {
      let actions: IAdminActionDocument[];

      if (adminId) {
        actions = await AdminActionModel.findByAdminId(adminId);
      } else if (targetType) {
        actions = await AdminActionModel.findByTargetType(targetType);
      } else {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        actions = await AdminActionModel.findByDateRange(startDate, new Date());
      }

      // Serialize actions to convert ObjectIds to strings
      const serializedActions = actions.map(action => ({
        ...action.toObject(),
        _id: (action._id as any).toString()
      }));

      return {
        success: true,
        message: 'Admin actions retrieved successfully',
        data: serializedActions,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving admin actions:', error);
      throw error;
    }
  }

  public static async getAdminActivityStats(adminId: string, days: number = 7): Promise<ApiResponse<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActions: number;
    averageActionsPerDay: number;
  }>> {
    try {
      const stats = await AdminActionModel.getAdminActivityStats(adminId, days);

      return {
        success: true,
        message: 'Admin activity stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving admin activity stats:', error);
      throw error;
    }
  }

  public static async getSystemActivityStats(days: number = 7): Promise<ApiResponse<{
    totalActions: number;
    uniqueAdmins: number;
    actionsByType: Record<string, number>;
    actionsByTarget: Record<string, number>;
    averageActionsPerDay: number;
  }>> {
    try {
      const stats = await AdminActionModel.getSystemActivityStats(days);

      return {
        success: true,
        message: 'System activity stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving system activity stats:', error);
      throw error;
    }
  }

  public static async getSubscriptionStats(): Promise<ApiResponse<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    subscriptionsByTier: Record<string, number>;
    revenueStats: any;
  }>> {
    try {
      const [
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        subscriptionsByTier
      ] = await Promise.all([
        SubscriptionModel.countDocuments(),
        SubscriptionModel.countDocuments({ status: SubscriptionStatus.ACTIVE, isActive: true }),
        SubscriptionModel.countDocuments({ status: SubscriptionStatus.EXPIRED }),
        SubscriptionModel.aggregate([
          {
            $group: {
              _id: '$tier',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      // Get revenue stats for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const revenueStats = await SubscriptionModel.getRevenueStats(startDate, endDate);

      // Format subscriptions by tier
      const subscriptionsByTierFormatted: Record<string, number> = {
        free: 0,
        pro: 0,
        enterprise: 0
      };

      subscriptionsByTier.forEach((item: any) => {
        if (item._id && typeof item._id === 'string') {
          subscriptionsByTierFormatted[item._id.toLowerCase()] = item.count;
        }
      });

      const stats = {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        subscriptionsByTier: subscriptionsByTierFormatted,
        revenueStats
      };

      return {
        success: true,
        message: 'Subscription stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error retrieving subscription stats:', error);
      throw error;
    }
  }

  public static async cleanupOldData(days: number = 90): Promise<ApiResponse<{
    deletedUsers: number;
    deletedBots: number;
    deletedCampaigns: number;
    deletedSubscriptions: number;
    deletedAdminActions: number;
  }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Delete old inactive users
      const deletedUsers = await UserModel.deleteMany({
        isActive: false,
        updatedAt: { $lt: cutoffDate }
      });

      // Delete old inactive bots
      const deletedBots = await BotModel.deleteMany({
        isActive: false,
        updatedAt: { $lt: cutoffDate }
      });

      // Delete old completed/cancelled campaigns
      const deletedCampaigns = await CampaignModel.deleteMany({
        status: { $in: ['COMPLETED', 'CANCELLED'] },
        updatedAt: { $lt: cutoffDate }
      });

      // Delete old expired subscriptions
      const deletedSubscriptions = await SubscriptionModel.deleteMany({
        status: SubscriptionStatus.EXPIRED,
        updatedAt: { $lt: cutoffDate }
      });

      // Delete old admin actions
      const deletedAdminActions = await AdminActionModel.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      const cleanupStats = {
        deletedUsers: deletedUsers.deletedCount || 0,
        deletedBots: deletedBots.deletedCount || 0,
        deletedCampaigns: deletedCampaigns.deletedCount || 0,
        deletedSubscriptions: deletedSubscriptions.deletedCount || 0,
        deletedAdminActions: deletedAdminActions.deletedCount || 0
      };

      AdminService.logger.info('Data cleanup completed', cleanupStats);

      return {
        success: true,
        message: 'Data cleanup completed successfully',
        data: cleanupStats,
        timestamp: new Date()
      };
    } catch (error) {
      AdminService.logger.error('Error during data cleanup:', error);
      throw error;
    }
  }
}
