import { ApiResponse, Bot, PaginatedResponse } from '@/types';
import { apiClient } from '../api-client';

export interface CreateBotRequest {
  name: string;
  description: string;
  email: string;
  password: string;
  profileImage?: string;
}

export interface UpdateBotRequest {
  name?: string;
  description?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  profileImage?: string;
}

export interface TestCredentialsRequest {
  email: string;
  password: string;
}

export interface BotStats {
  totalEmailsSent: number;
  emailsSentToday: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageReplyRate: number;
  lastEmailSentAt?: Date;
}

export interface BotEmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalReplied: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  replyRate: number;
}

export class BotsAPI {
  // Bot management
  static async createBot(data: CreateBotRequest): Promise<ApiResponse<Bot>> {
    return apiClient.post<Bot>('/bots', data);
  }

  static async testCredentials(data: TestCredentialsRequest): Promise<ApiResponse<{ 
    verified: boolean; 
    message: string; 
  }>> {
    return apiClient.post<{ verified: boolean; message: string }>('/bots/test-credentials', data);
  }

  static async getBots(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
    includeInactive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Bot>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Bot>>(`/bots${query ? `?${query}` : ''}`);
  }

  static async getBot(id: string): Promise<ApiResponse<Bot>> {
    return apiClient.get<Bot>(`/bots/${id}`);
  }

  static async updateBot(id: string, data: UpdateBotRequest): Promise<ApiResponse<Bot>> {
    return apiClient.put<Bot>(`/bots/${id}`, data);
  }

  static async deleteBot(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/bots/${id}`);
  }

  // Bot status management
  static async toggleBotStatus(id: string): Promise<ApiResponse<Bot>> {
    return apiClient.post<Bot>(`/bots/${id}/toggle`);
  }

  static async testBotConnection(id: string): Promise<ApiResponse<{ 
    connected: boolean; 
    message: string; 
  }>> {
    return apiClient.post<{ connected: boolean; message: string }>(`/bots/${id}/test-smtp`);
  }

  // Bot statistics
  static async getBotStats(id: string): Promise<ApiResponse<BotStats>> {
    return apiClient.get<BotStats>(`/bots/${id}/stats`);
  }

  static async getBotEmailStats(id: string, days: number = 30): Promise<ApiResponse<BotEmailStats>> {
    return apiClient.get<BotEmailStats>(`/bots/${id}/email-stats?days=${days}`);
  }

  // Check if bot has active campaigns
  static async checkActiveCampaigns(id: string): Promise<ApiResponse<{ 
    hasActiveCampaigns: boolean; 
    activeCampaigns: Array<{ id: string; name: string; status: string }> 
  }>> {
    return apiClient.get<{ hasActiveCampaigns: boolean; activeCampaigns: Array<{ id: string; name: string; status: string }> }>(`/bots/${id}/active-campaigns`);
  }
}
