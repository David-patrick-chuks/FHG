import { apiClient } from '../api-client';

// Analytics Types
export interface AnalyticsMetrics {
  totalEmails: number;
  totalOpened: number;
  totalDelivered: number;
  totalFailed: number;
  averageOpenRate: number;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  topPerformingCampaign: {
    campaignId: string;
    campaignName: string;
    openRate: number;
    totalEmails: number;
  } | null;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  status: string;
  totalEmails: number;
  delivered: number;
  opened: number;
  failed: number;
  openRate: number;
  createdAt: string;
  completedAt?: string;
}

export interface EmailTrends {
  date: string;
  emailsSent: number;
  emailsOpened: number;
  openRate: number;
}

export interface UserAnalytics {
  metrics: AnalyticsMetrics;
  campaignPerformance: CampaignPerformance[];
  emailTrends: EmailTrends[];
  subscriptionTier: 'free' | 'basic' | 'premium';
  hasAccess: boolean;
}

export interface AnalyticsSummary {
  totalEmails: number;
  totalCampaigns: number;
  hasAccess: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  upgradeMessage?: string;
}

export interface AnalyticsAccessCheck {
  hasAccess: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  message?: string;
}

// Analytics API
export class AnalyticsAPI {
  /**
   * Get comprehensive analytics for authenticated user
   * Requires paid subscription (Basic or Premium)
   */
  static async getUserAnalytics(): Promise<{
    success: boolean;
    message?: string;
    data?: UserAnalytics;
    timestamp?: string;
  }> {
    const response = await apiClient.get('/analytics');
    return response;
  }

  /**
   * Get analytics summary for dashboard
   * Available to all authenticated users (including free)
   */
  static async getAnalyticsSummary(): Promise<{
    success: boolean;
    message?: string;
    data?: AnalyticsSummary;
    timestamp?: string;
  }> {
    const response = await apiClient.get('/analytics/summary');
    return response;
  }

  /**
   * Check if user has access to analytics features
   * Available to all authenticated users
   */
  static async checkAnalyticsAccess(): Promise<{
    success: boolean;
    message?: string;
    data?: AnalyticsAccessCheck;
    timestamp?: string;
  }> {
    const response = await apiClient.get('/analytics/access');
    return response;
  }
}
