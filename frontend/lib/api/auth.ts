import { apiClient } from '../api-client';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  PasswordResetRequest, 
  PasswordReset,
  User,
  UserProfile,
  ApiResponse 
} from '@/types';

export class AuthAPI {
  // Public endpoints
  static async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  }

  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }

  static async resetPassword(data: PasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  }

  static async resetPasswordWithToken(data: PasswordReset): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/reset-password/confirm', data);
  }

  static async verifyResetToken(token: string): Promise<ApiResponse<{ valid: boolean; message: string }>> {
    return apiClient.get<{ valid: boolean; message: string }>(`/auth/reset-password/verify/${token}`);
  }

  static async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    return apiClient.get<{ valid: boolean; user?: User }>('/auth/verify-token');
  }

  // Protected endpoints
  static async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/profile');
  }

  static async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/auth/profile', data);
  }

  static async changePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string; 
  }): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/auth/change-password', data);
  }

  static async getUserStats(): Promise<ApiResponse<{
    totalCampaigns: number;
    totalBots: number;
    totalEmailsSent: number;
    subscriptionTier: string;
    subscriptionExpiresAt: Date;
  }>> {
    return apiClient.get('/auth/stats');
  }

  static async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/logout');
  }
}
