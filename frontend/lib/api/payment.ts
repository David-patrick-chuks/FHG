import { ApiResponse } from './types';

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
  private static baseUrl = '/api/payment';

  /**
   * Get subscription pricing
   */
  static async getPricing(): Promise<ApiResponse<PaymentPricing>> {
    const response = await fetch(`${this.baseUrl}/pricing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  /**
   * Initialize a payment
   */
  static async initializePayment(data: InitializePaymentRequest): Promise<ApiResponse<InitializePaymentResponse>> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  /**
   * Verify a payment
   */
  static async verifyPayment(reference: string): Promise<ApiResponse<PaymentHistory>> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reference }),
    });

    return response.json();
  }

  /**
   * Get user payment history
   */
  static async getPaymentHistory(): Promise<ApiResponse<PaymentHistory[]>> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }

  /**
   * Get payment statistics (Admin only)
   */
  static async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }
}
