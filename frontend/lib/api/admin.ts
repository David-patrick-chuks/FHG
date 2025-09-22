import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types";


export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  subscription: 'free' | 'basic' | 'premium';
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
  totalSubscriptions: number;
  activeSubscriptions: number;
  revenueStats: {
    totalRevenue: number;
    subscriptionCount: number;
    averageRevenue: number;
    revenueByTier: {
      free: number;
      basic: number;
      premium: number;
    };
  };
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
  recentActions?: Array<{
    _id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: any;
    ipAddress: string;
    userAgent?: string;
    createdAt: string;
  }>;
}

export interface SystemActivityStats {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesBySeverity: Record<string, number>;
  activitiesByCategory: Record<string, number>;
  resolvedCount: number;
  unresolvedCount: number;
  averageResolutionTime: number;
}

export interface SystemActivity {
  _id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'error' | 'maintenance' | 'backup' | 'security' | 'performance' | 'other';
  source: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  _id: string;
  title: string;
  description: string;
  impact: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  updates: IncidentUpdate[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface IncidentUpdate {
  timestamp: string;
  message: string;
  status: string;
  author?: string;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  impact: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  initialMessage?: string;
}

export interface UpdateIncidentData {
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  author?: string;
}

export interface UpdateSubscriptionRequest {
  tier: 'free' | 'basic' | 'premium';
  duration: number;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'OTHER';
}

export interface SuspendUserRequest {
  reason: string;
}

export class AdminAPI {
  private static baseUrl = '/admin';

  /**
   * Get all users
   */
  static async getAllUsers(page: number = 1, limit: number = 20): Promise<ApiResponse<AdminUser[] | {
    users: AdminUser[];
    stats: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      adminUsers: number;
      usersBySubscription: {
        free: number;
        basic: number;
        premium: number;
      };
      usersByStatus: {
        active: number;
        inactive: number;
      };
      recentUsers: number;
      usersWithApiKeys: number;
    };
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get<AdminUser[] | {
      users: AdminUser[];
      stats: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        adminUsers: number;
        usersBySubscription: {
          free: number;
          basic: number;
          premium: number;
        };
        usersByStatus: {
          active: number;
          inactive: number;
        };
        recentUsers: number;
        usersWithApiKeys: number;
      };
      pagination?: {
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
   * Get admin actions
   */
  static async getAdminActions(
    targetAdminId?: string,
    targetType?: string,
    days: number = 7
  ): Promise<ApiResponse<Array<{
    _id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: any;
    ipAddress: string;
    createdAt: string;
  }>>> {
    const params = new URLSearchParams();
    if (targetAdminId) params.append('targetAdminId', targetAdminId);
    if (targetType) params.append('targetType', targetType);
    params.append('days', days.toString());
    
    return apiClient.get<Array<{
      _id: string;
      adminId: string;
      action: string;
      targetType: string;
      targetId: string;
      details: any;
      ipAddress: string;
      createdAt: string;
    }>>(`${this.baseUrl}/actions?${params.toString()}`);
  }

  /**
   * Get general admin activity statistics
   */
  static async getGeneralAdminActivityStats(days: number = 7): Promise<ApiResponse<AdminActivityStats>> {
    return apiClient.get<AdminActivityStats>(`${this.baseUrl}/stats/admin-activity?days=${days}`);
  }

  /**
   * Get admin activity statistics for specific admin
   */
  static async getAdminActivityStats(
    adminId: string, 
    days: number = 7
  ): Promise<ApiResponse<AdminActivityStats>> {
    return apiClient.get<AdminActivityStats>(`${this.baseUrl}/actions/${adminId}?days=${days}`);
  }

  /**
   * Get system activity statistics
   */
  static async getSystemActivityStats(days: number = 7): Promise<ApiResponse<SystemActivityStats>> {
    return apiClient.get<SystemActivityStats>(`${this.baseUrl}/stats/system-activity?days=${days}`);
  }

  /**
   * Get system activities with filtering
   */
  static async getSystemActivities(params?: {
    limit?: number;
    skip?: number;
    days?: number;
    type?: string;
    severity?: string;
    category?: string;
    resolved?: boolean;
  }): Promise<ApiResponse<SystemActivity[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
    
    const query = queryParams.toString();
    return apiClient.get<SystemActivity[]>(`${this.baseUrl}/system-activities${query ? `?${query}` : ''}`);
  }

  /**
   * Get critical system activities
   */
  static async getCriticalSystemActivities(hours: number = 24): Promise<ApiResponse<SystemActivity[]>> {
    return apiClient.get<SystemActivity[]>(`${this.baseUrl}/system-activities/critical?hours=${hours}`);
  }

  /**
   * Resolve a system activity
   */
  static async resolveSystemActivity(activityId: string): Promise<ApiResponse<SystemActivity>> {
    return apiClient.put<SystemActivity>(`${this.baseUrl}/system-activities/${activityId}/resolve`);
  }

  /**
   * Get all incidents
   */
  static async getAllIncidents(): Promise<ApiResponse<Incident[]>> {
    return apiClient.get<Incident[]>(`${this.baseUrl}/incidents`);
  }

  /**
   * Get active incidents
   */
  static async getActiveIncidents(): Promise<ApiResponse<Incident[]>> {
    return apiClient.get<Incident[]>(`${this.baseUrl}/incidents/active`);
  }

  /**
   * Get incident by ID
   */
  static async getIncidentById(incidentId: string): Promise<ApiResponse<Incident>> {
    return apiClient.get<Incident>(`${this.baseUrl}/incidents/${incidentId}`);
  }

  /**
   * Create new incident
   */
  static async createIncident(incidentData: CreateIncidentData): Promise<ApiResponse<Incident>> {
    return apiClient.post<Incident>(`${this.baseUrl}/incidents`, incidentData);
  }

  /**
   * Update incident
   */
  static async updateIncident(incidentId: string, updateData: UpdateIncidentData): Promise<ApiResponse<Incident>> {
    return apiClient.put<Incident>(`${this.baseUrl}/incidents/${incidentId}`, updateData);
  }

  /**
   * Resolve incident
   */
  static async resolveIncident(incidentId: string): Promise<ApiResponse<Incident>> {
    return apiClient.put<Incident>(`${this.baseUrl}/incidents/${incidentId}/resolve`);
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
