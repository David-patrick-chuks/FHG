// Payment and Subscription Types

import { BillingCycle, SubscriptionStatus, SubscriptionTier } from './common';

export enum PaymentMethod {
  PAYSTACK = 'paystack',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface ISubscription {
  _id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  userId: string;
  subscriptionTier: SubscriptionTier;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  reference: string;
  paystackReference?: string;
  paystackAccessCode?: string;
  authorizationUrl?: string;
  transactionId?: string;
  gatewayResponse?: string;
  paidAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
  subscriptionExpiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface SubscriptionUpgradeRequest {
  subscription: SubscriptionTier;
  billingCycle: BillingCycle;
}

export interface ChangeBillingCycleRequest {
  billingCycle: BillingCycle;
}

export interface UpdateSubscriptionRequest {
  userId: string;
  tier: SubscriptionTier;
  duration: number; // in months
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface CreateSubscriptionRequest {
  tier: SubscriptionTier;
  duration: number; // in months
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface InitializePaymentRequest {
  subscriptionTier: SubscriptionTier;
  billingCycle: BillingCycle;
  email: string;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface PaymentCallbackRequest {
  reference: string;
  status: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  gateway_response?: string;
  paid_at?: string;
}
