import { apiClient } from '../api-client';
import { DashboardStats, RecentActivity, ApiResponse } from '@/types';

export interface QuickOverview {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBots: number;
  activeBots: number;
  totalEmailsSent: number;
  emailsSentToday: number;
  averageOpenRate: number;
  averageReplyRate: number;
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    emailsSent: number;
    totalEmails: number;
    createdAt: Date;
  }>;
  recentBots: Array<{
    id: string;
    name: string;
    isActive: boolean;
    emailsSentToday: number;
    lastEmailSentAt?: Date;
  }>;
}

export class DashboardAPI {
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  }

  static async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
    return apiClient.get<RecentActivity[]>('/dashboard/activity');
  }

  static async getQuickOverview(): Promise<ApiResponse<QuickOverview>> {
    return apiClient.get<QuickOverview>('/dashboard/overview');
  }
}
