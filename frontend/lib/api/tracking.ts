import { apiClient } from '../api-client';
import { ApiResponse } from '@/types';

export interface TrackingStats {
  campaignId: string;
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  failed: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  replyRate: number;
}

export interface TrackingLog {
  emailId: string;
  recipientEmail: string;
  status: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
}

export interface TrackingLogsResponse {
  campaignId: string;
  logs: TrackingLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserTrackingSummary {
  totalCampaigns: number;
  totalEmails: number;
  totalOpened: number;
  averageOpenRate: number;
  topPerformingCampaigns: Array<{
    campaignId: string;
    openRate: number;
    totalEmails: number;
  }>;
}

export class TrackingAPI {
  // Public tracking endpoints (no authentication required)
  static async getCampaignStats(campaignId: string): Promise<ApiResponse<TrackingStats>> {
    return apiClient.get<TrackingStats>(`/track/stats/${campaignId}`);
  }

  static async getCampaignLogs(campaignId: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<ApiResponse<TrackingLogsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return apiClient.get<TrackingLogsResponse>(`/track/logs/${campaignId}${query ? `?${query}` : ''}`);
  }

  // Authenticated tracking endpoints
  static async getMultipleCampaignStats(campaignIds: string[]): Promise<ApiResponse<TrackingStats[]>> {
    return apiClient.post<TrackingStats[]>('/track/stats/multiple', { campaignIds });
  }

  static async getUserTrackingSummary(): Promise<ApiResponse<UserTrackingSummary>> {
    return apiClient.get<UserTrackingSummary>('/track/summary');
  }
}
