import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types";

export interface PaymentPricing {
  pro: {
    monthly: number;
    yearly: number;
  };
  enterprise: {
    monthly: number;
    yearly: number;
  };
}

export interface InitializePaymentRequest {
  subscriptionTier: 'pro' | 'enterprise';
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
  subscriptionTier: 'free' | 'pro' | 'enterprise';
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
  private static baseUrl = '/api/payments';

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
}
