import { ApiResponse, Campaign, PaginatedResponse } from '@/types';
import { apiClient } from '../api-client';

export interface CreateCampaignRequest {
  name: string;
  description: string;
  botId: string;
  emailList: string[];
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  botId?: string;
  emailList?: string[];
  status?: string;
  selectedMessageIndex?: number;
}

export interface CampaignStats {
  totalEmails: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsReplied: number;
  emailsFailed: number;
  deliveryRate: number;
  openRate: number;
  replyRate: number;
  progress: {
    sent: number;
    total: number;
    percentage: number;
  };
}

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

export class CampaignsAPI {
  // Campaign management
  static async createCampaign(data: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>('/campaigns', data);
  }

  static async uploadEmailFile(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{
    emails: string[];
    totalCount: number;
    validEmails: number;
    invalidEmails: number;
  }>> {
    return apiClient.upload<{
      emails: string[];
      totalCount: number;
      validEmails: number;
      invalidEmails: number;
    }>('/campaigns/upload-emails', file, onProgress);
  }

  static async getCampaigns(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string; 
    botId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.botId) queryParams.append('botId', params.botId);
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Campaign>>(`/campaigns${query ? `?${query}` : ''}`);
  }

  static async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.get<Campaign>(`/campaigns/${id}`);
  }

  static async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<ApiResponse<Campaign>> {
    return apiClient.put<Campaign>(`/campaigns/${id}`, data);
  }

  static async deleteCampaign(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/campaigns/${id}`);
  }

  // Campaign lifecycle management
  static async prepareCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/prepare`);
  }

  static async scheduleCampaign(id: string, scheduledFor: Date): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/schedule`, { scheduledFor });
  }

  static async startCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/start`);
  }

  static async pauseCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/pause`);
  }

  static async resumeCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/resume`);
  }

  static async completeCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/complete`);
  }

  static async cancelCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>(`/campaigns/${id}/cancel`);
  }

  // Campaign content management
  static async regenerateAIMessages(id: string, prompt?: string): Promise<ApiResponse<{
    messages: string[];
    selectedMessageIndex: number;
  }>> {
    return apiClient.post<{
      messages: string[];
      selectedMessageIndex: number;
    }>(`/campaigns/${id}/regenerate-messages`, { prompt });
  }

  static async selectMessage(id: string, messageIndex: number): Promise<ApiResponse<{
    selectedMessageIndex: number;
    selectedMessage: string;
  }>> {
    return apiClient.post<{
      selectedMessageIndex: number;
      selectedMessage: string;
    }>(`/campaigns/${id}/select-message`, { messageIndex });
  }

  // Campaign statistics
  static async getCampaignStats(id: string): Promise<ApiResponse<CampaignStats>> {
    return apiClient.get<CampaignStats>(`/campaigns/${id}/stats`);
  }

  // Campaign tracking
  static async getCampaignTrackingStats(id: string): Promise<ApiResponse<TrackingStats>> {
    return apiClient.get<TrackingStats>(`/campaigns/${id}/tracking/stats`);
  }

  static async getCampaignTrackingLogs(id: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<ApiResponse<TrackingLogsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return apiClient.get<TrackingLogsResponse>(`/campaigns/${id}/tracking/logs${query ? `?${query}` : ''}`);
  }
}
