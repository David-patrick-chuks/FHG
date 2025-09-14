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
  authorizationUrl: string;
  reference: string;
  accessCode: string;
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
   * Get user payment history
   */
  static async getPaymentHistory(): Promise<ApiResponse<PaymentHistory[]>> {
    return apiClient.get<PaymentHistory[]>(`${this.baseUrl}/history`);
  }

  /**
   * Get payment statistics (Admin only)
   */
  static async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    return apiClient.get<PaymentStats>(`${this.baseUrl}/stats`);
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
        a.download = `receipt-${reference}.png`;
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
}
