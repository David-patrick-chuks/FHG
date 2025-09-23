import { ApiResponse, Template } from '@/types';
import { apiClient } from '../api-client';

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  industry?: string;
  targetAudience?: string;
  isPublic: boolean;
  useCase: string;
  variables: Array<{
    key: string;
    value: string;
    required: boolean;
  }>;
  tags: string[];
  samples: Array<{
    subject: string;
    body: string;
  }>;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  industry?: string;
  targetAudience?: string;
  isPublic?: boolean;
  useCase?: string;
  variables?: Array<{
    key: string;
    value: string;
    required: boolean;
  }>;
  tags?: string[];
  samples?: Array<{
    subject: string;
    body: string;
  }>;
}

export interface ReviewTemplateRequest {
  rating: number;
  comment?: string;
}

export interface ApproveTemplateRequest {
  approved: boolean;
  rejectionReason?: string;
}

export class TemplatesAPI {
  // Template management
  static async createTemplate(data: CreateTemplateRequest): Promise<ApiResponse<Template>> {
    return apiClient.post<Template>('/templates', data);
  }

  static async getMyTemplates(): Promise<ApiResponse<Template[]>> {
    return apiClient.get<Template[]>('/templates/my');
  }

  static async getCommunityTemplates(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Template[]>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get<Template[]>(`/templates/community${query ? `?${query}` : ''}`);
  }

  static async getPopularTemplates(limit?: number): Promise<ApiResponse<Template[]>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const query = queryParams.toString();
    return apiClient.get<Template[]>(`/templates/popular${query ? `?${query}` : ''}`);
  }

  static async getTemplateCounts(): Promise<ApiResponse<{
    myTemplates: number;
    communityTemplates: number;
    totalUsage: number;
  }>> {
    return apiClient.get<{
      myTemplates: number;
      communityTemplates: number;
      totalUsage: number;
    }>('/templates/counts');
  }

  static async getTemplateStats(): Promise<ApiResponse<{
    myTemplates: number;
    communityTemplates: number;
    totalUserUsage: number;
  }>> {
    return apiClient.get<{
      myTemplates: number;
      communityTemplates: number;
      totalUserUsage: number;
    }>('/templates/stats');
  }

  static async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return apiClient.get<Template>(`/templates/${id}`);
  }

  static async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<ApiResponse<Template>> {
    return apiClient.put<Template>(`/templates/${id}`, data);
  }

  static async deleteTemplate(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/templates/${id}`);
  }

  // Template usage and reviews
  static async useTemplate(id: string): Promise<ApiResponse<Template>> {
    return apiClient.post<Template>(`/templates/${id}/use`);
  }

  static async reviewTemplate(id: string, data: ReviewTemplateRequest): Promise<ApiResponse<Template>> {
    return apiClient.post<Template>(`/templates/${id}/review`, data);
  }

  // Admin-only operations
  static async getPendingApprovals(): Promise<ApiResponse<Template[]>> {
    return apiClient.get<Template[]>('/templates/admin/pending-approvals');
  }

  static async getAllTemplatesForAdmin(): Promise<ApiResponse<Template[]>> {
    return apiClient.get<Template[]>('/templates/admin/all');
  }

  static async approveTemplate(id: string, data: ApproveTemplateRequest): Promise<ApiResponse<Template>> {
    return apiClient.post<Template>(`/templates/${id}/approve`, data);
  }

  // Cloning and update management
  static async getClonedTemplates(): Promise<ApiResponse<Template[]>> {
    return apiClient.get<Template[]>('/templates/cloned');
  }

  static async getTemplatesWithUpdates(): Promise<ApiResponse<Template[]>> {
    return apiClient.get<Template[]>('/templates/updates');
  }

  static async markTemplateUpdateAsRead(id: string): Promise<ApiResponse<Template>> {
    return apiClient.post<Template>(`/templates/${id}/mark-update-read`);
  }
}
