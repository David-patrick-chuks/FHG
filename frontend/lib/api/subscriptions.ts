import { ApiResponse, Subscription } from '@/types';
import { apiClient } from '../api-client';

export interface CreateSubscriptionRequest {
  tier: string;
  duration: number; // in months
  paymentMethod: string;
  amount: number;
}

export interface UpdateSubscriptionRequest {
  tier?: string;
  status?: string;
  endDate?: Date;
}

export class SubscriptionsAPI {
  // Subscription management
  static async createSubscription(data: CreateSubscriptionRequest): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>('/subscriptions', data);
  }

  static async getUserSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return apiClient.get<Subscription[]>('/subscriptions');
  }

  static async getActiveSubscription(): Promise<ApiResponse<Subscription>> {
    return apiClient.get<Subscription>('/subscriptions/active');
  }

  static async getSubscriptionById(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.get<Subscription>(`/subscriptions/${id}`);
  }

  static async updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<ApiResponse<Subscription>> {
    return apiClient.put<Subscription>(`/subscriptions/${id}`, data);
  }

  // Subscription actions
  static async renewSubscription(id: string, duration: number): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(`/subscriptions/${id}/renew`, { duration });
  }

  static async cancelSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(`/subscriptions/${id}/cancel`);
  }

  static async suspendSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(`/subscriptions/${id}/suspend`);
  }

  static async activateSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(`/subscriptions/${id}/activate`);
  }
}
