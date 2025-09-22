import { apiClient } from "@/lib/api-client";
import { config } from "@/lib/config";
import { ApiResponse } from "@/types";

export interface PaymentPricing {
  basic: {
    monthly: number;
    yearly: number;
  };
  premium: {
    monthly: number;
    yearly: number;
  };
}

export interface InitializePaymentRequest {
  subscriptionTier: 'basic' | 'premium';
  billingCycle: 'monthly' | 'yearly';
  email: string;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaymentHistory {
  _id: string;
  userId: string;
  subscriptionTier: 'free' | 'basic' | 'premium';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'paystack';
  reference: string;
  paystackReference?: string;
  authorizationUrl?: string;
  transactionId?: string;
  gatewayResponse?: string;
  paidAt?: string;
  failureReason?: string;
  subscriptionExpiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaymentHistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
  subscriptionTier?: string;
  billingCycle?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class PaymentAPI {
  private static baseUrl = '/payments';

  /**
   * Get subscription pricing
   */
  static async getPricing(): Promise<ApiResponse<PaymentPricing>> {
    return apiClient.get<PaymentPricing>(`${this.baseUrl}/pricing`);
  }

  /**
   * Initialize a payment
   */
  static async initializePayment(data: InitializePaymentRequest): Promise<ApiResponse<InitializePaymentResponse>> {
    return apiClient.post<InitializePaymentResponse>(`${this.baseUrl}/initialize`, data);
  }

  /**
   * Verify a payment
   */
  static async verifyPayment(reference: string): Promise<ApiResponse<PaymentHistory>> {
    return apiClient.post<PaymentHistory>(`${this.baseUrl}/verify`, { reference });
  }

  /**
   * Get user payment history with pagination, filtering, and search
   */
  static async getPaymentHistory(filters?: PaymentHistoryFilters): Promise<ApiResponse<PaymentHistoryResponse>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/history?${queryString}` : `${this.baseUrl}/history`;
    
    return apiClient.get<PaymentHistoryResponse>(url);
  }

  /**
   * Get payment statistics (Admin only)
   */
  static async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    return apiClient.get<PaymentStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Get all payments with pagination and filtering (Admin only)
   */
  static async getAllPayments(filters?: PaymentHistoryFilters): Promise<ApiResponse<PaymentHistoryResponse>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/admin/all?${queryString}` : `${this.baseUrl}/admin/all`;
    
    return apiClient.get<PaymentHistoryResponse>(url);
  }

  /**
   * Check if user can upgrade their subscription
   */
  static async canUpgrade(): Promise<ApiResponse<{ canUpgrade: boolean }>> {
    return apiClient.get<{ canUpgrade: boolean }>(`${this.baseUrl}/can-upgrade`);
  }

  /**
   * Download payment receipt
   */
  static async downloadReceipt(reference: string): Promise<void> {
    try {
      // Use apiClient's base URL and credentials, but handle blob response manually
      const response = await fetch(`${config.api.baseUrl}${this.baseUrl}/receipt/${encodeURIComponent(reference)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  }

  /**
   * Export payments to CSV (Admin only)
   */
  static async exportPayments(filters?: PaymentHistoryFilters): Promise<void> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString ? `${config.api.baseUrl}${this.baseUrl}/admin/export?${queryString}` : `${config.api.baseUrl}${this.baseUrl}/admin/export`;
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'payments-export.csv';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export payments');
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      throw error;
    }
  }
}
