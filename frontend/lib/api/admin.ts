import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types";


export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  subscription: 'free' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  subscriptionExpiresAt: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalBots: number;
  activeBots: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalEmailsSent: number;
  emailsSentToday: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  monthlySubscriptions: number;
  yearlySubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  revenue: {
    total: number;
    monthly: number;
    yearly: number;
  };
}

export interface AdminActivityStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByAdmin: Record<string, number>;
  recentActions: Array<{
    _id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
  }>;
}

export interface SystemActivityStats {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByUser: Record<string, number>;
  recentActivities: Array<{
    _id: string;
    userId: string;
    type: string;
    title: string;
    description: string;
    metadata: any;
    createdAt: string;
  }>;
}

export interface UpdateSubscriptionRequest {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  duration: number;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'OTHER';
}

export interface SuspendUserRequest {
  reason: string;
}

export class AdminAPI {
  private static baseUrl = '/api/admin';

  /**
   * Get all users
   */
  static async getAllUsers(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get<{
      users: AdminUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${this.baseUrl}/users?page=${page}&limit=${limit}`);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<AdminUser>> {
    return apiClient.get<AdminUser>(`${this.baseUrl}/users/${userId}`);
  }

  /**
   * Update user subscription
   */
  static async updateUserSubscription(
    userId: string, 
    data: UpdateSubscriptionRequest
  ): Promise<ApiResponse<AdminUser>> {
    return apiClient.put<AdminUser>(`${this.baseUrl}/users/${userId}/subscription`, data);
  }

  /**
   * Suspend user
   */
  static async suspendUser(userId: string, data: SuspendUserRequest): Promise<ApiResponse<AdminUser>> {
    return apiClient.post<AdminUser>(`${this.baseUrl}/users/${userId}/suspend`, data);
  }

  /**
   * Activate user
   */
  static async activateUser(userId: string): Promise<ApiResponse<AdminUser>> {
    return apiClient.post<AdminUser>(`${this.baseUrl}/users/${userId}/activate`);
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseUrl}/users/${userId}`);
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    return apiClient.get<PlatformStats>(`${this.baseUrl}/stats/platform`);
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStats(): Promise<ApiResponse<SubscriptionStats>> {
    return apiClient.get<SubscriptionStats>(`${this.baseUrl}/stats/subscriptions`);
  }

  /**
   * Get admin activity statistics
   */
  static async getAdminActivityStats(
    adminId?: string, 
    days: number = 7
  ): Promise<ApiResponse<AdminActivityStats>> {
    const url = adminId 
      ? `${this.baseUrl}/actions/${adminId}?days=${days}`
      : `${this.baseUrl}/actions?days=${days}`;
    
    return apiClient.get<AdminActivityStats>(url);
  }

  /**
   * Get system activity statistics
   */
  static async getSystemActivityStats(days: number = 7): Promise<ApiResponse<SystemActivityStats>> {
    return apiClient.get<SystemActivityStats>(`${this.baseUrl}/stats/system-activity?days=${days}`);
  }

  /**
   * Cleanup old data
   */
  static async cleanupOldData(days: number = 90): Promise<ApiResponse<{
    deletedRecords: number;
    cleanedCollections: string[];
  }>> {
    return apiClient.post<{
      deletedRecords: number;
      cleanedCollections: string[];
    }>(`${this.baseUrl}/cleanup?days=${days}`);
  }
}
