import axios, { AxiosResponse } from 'axios';
import { ActivityType } from '../models/Activity';
import PaymentModel, { IPaymentDocument } from '../models/Payment';
import UserModel from '../models/User';
import { ApiResponse, BillingCycle, InitializePaymentRequest, PaymentStatus, SubscriptionTier } from '../types';
import { Logger } from '../utils/Logger';
import { ActivityService } from './ActivityService';

export interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
    connect: any;
    transaction_date: string;
    plan_object: any;
    subaccount: any;
  };
}

export class PaystackService {
  private static logger: Logger = new Logger();
  private static config: PaystackConfig;

  // Subscription pricing in NGN (Nigerian Naira)
  private static readonly SUBSCRIPTION_PRICES = {
    [SubscriptionTier.PRO]: {
      [BillingCycle.MONTHLY]: 2999, // ₦2,999 per month
      [BillingCycle.YEARLY]: 28790  // ₦28,790 per year (2 months free)
    },
    [SubscriptionTier.ENTERPRISE]: {
      [BillingCycle.MONTHLY]: 14999, // ₦14,999 per month
      [BillingCycle.YEARLY]: 143990  // ₦143,990 per year (2 months free)
    }
  };

  public static initialize(config: PaystackConfig): void {
    PaystackService.config = config;
    PaystackService.logger.info('PaystackService initialized');
  }

  /**
   * Initialize a payment transaction with Paystack
   */
  public static async initializePayment(
    userId: string,
    paymentData: InitializePaymentRequest
  ): Promise<ApiResponse<{ authorizationUrl: string; reference: string; accessCode: string }>> {
    try {
      // Validate subscription tier and billing cycle
      if (!PaystackService.SUBSCRIPTION_PRICES[paymentData.subscriptionTier]) {
        return {
          success: false,
          message: 'Invalid subscription tier',
          timestamp: new Date()
        };
      }

      if (!PaystackService.SUBSCRIPTION_PRICES[paymentData.subscriptionTier][paymentData.billingCycle]) {
        return {
          success: false,
          message: 'Invalid billing cycle for subscription tier',
          timestamp: new Date()
        };
      }

      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Calculate amount and subscription expiration
      const amount = PaystackService.SUBSCRIPTION_PRICES[paymentData.subscriptionTier][paymentData.billingCycle];
      const subscriptionExpiresAt = PaystackService.calculateSubscriptionExpiration(paymentData.billingCycle);

      // Generate unique reference
      const reference = PaystackService.generateReference();

      // Create payment record
      const payment = new PaymentModel({
        userId,
        subscriptionTier: paymentData.subscriptionTier,
        billingCycle: paymentData.billingCycle,
        amount,
        currency: 'NGN',
        status: PaymentStatus.PENDING,
        paymentMethod: 'paystack',
        reference,
        subscriptionExpiresAt,
        metadata: {
          userEmail: user.email,
          userName: user.username
        }
      });

      await payment.save();

      // Initialize Paystack transaction
      const paystackData = {
        email: paymentData.email,
        amount: amount * 100, // Convert to kobo (Paystack expects amount in smallest currency unit)
        currency: 'NGN',
        reference,
        callback_url: `${process.env.FRONTEND_URL}/dashboard/payments`,
        metadata: {
          userId,
          subscriptionTier: paymentData.subscriptionTier,
          billingCycle: paymentData.billingCycle,
          paymentId: String(payment._id)
        }
      };

      const response: AxiosResponse<PaystackInitializeResponse> = await axios.post(
        `${PaystackService.config.baseUrl}/transaction/initialize`,
        paystackData,
        {
          headers: {
            'Authorization': `Bearer ${PaystackService.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Update payment with Paystack data
        payment.paystackAccessCode = response.data.data.access_code;
        payment.authorizationUrl = response.data.data.authorization_url;
        payment.paystackReference = response.data.data.reference;
        await payment.save();

        // Log activity
        await ActivityService.logUserActivity(
          userId,
          ActivityType.SUBSCRIPTION_CREATED,
          `Payment initialized for ${paymentData.subscriptionTier} ${paymentData.billingCycle} subscription - Payment ID: ${payment._id}`
        );

        PaystackService.logger.info(`Payment initialized for user ${userId}, reference: ${reference}`);

        return {
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorizationUrl: response.data.data.authorization_url,
            reference: response.data.data.reference,
            accessCode: response.data.data.access_code
          },
          timestamp: new Date()
        };
      } else {
        await payment.markAsFailed(response.data.message);
        return {
          success: false,
          message: response.data.message || 'Failed to initialize payment',
          timestamp: new Date()
        };
      }
    } catch (error) {
      PaystackService.logger.error('Error initializing payment:', error);
      return {
        success: false,
        message: 'Failed to initialize payment',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Verify a payment transaction with Paystack
   */
  public static async verifyPayment(reference: string): Promise<ApiResponse<IPaymentDocument>> {
    try {
      // Find payment record
      const payment = await PaymentModel.findByReference(reference);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          timestamp: new Date()
        };
      }

      // Verify with Paystack
      const response: AxiosResponse<PaystackVerifyResponse> = await axios.get(
        `${PaystackService.config.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${PaystackService.config.secretKey}`
          }
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        // Payment successful
        await payment.markAsCompleted(response.data.data);

        // Update user subscription
        const user = await UserModel.findById(payment.userId);
        if (user) {
          await user.updateSubscription(payment.subscriptionTier, payment.billingCycle);
          await user.reactivateBotsForSubscription();

          // Log activity
          await ActivityService.logUserActivity(
            payment.userId,
            ActivityType.SUBSCRIPTION_CREATED,
            `Payment completed for ${payment.subscriptionTier} ${payment.billingCycle} subscription - Payment ID: ${payment._id}`
          );
        }

        PaystackService.logger.info(`Payment verified successfully for reference: ${reference}`);

        return {
          success: true,
          message: 'Payment verified successfully',
          data: payment,
          timestamp: new Date()
        };
      } else {
        // Payment failed
        await payment.markAsFailed(response.data.message || 'Payment verification failed');

        return {
          success: false,
          message: response.data.message || 'Payment verification failed',
          timestamp: new Date()
        };
      }
    } catch (error) {
      PaystackService.logger.error('Error verifying payment:', error);
      return {
        success: false,
        message: 'Failed to verify payment',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get payment history for a user
   */
  public static async getUserPayments(userId: string): Promise<ApiResponse<IPaymentDocument[]>> {
    try {
      const payments = await PaymentModel.findByUserId(userId);
      
      return {
        success: true,
        message: 'Payment history retrieved successfully',
        data: payments,
        timestamp: new Date()
      };
    } catch (error) {
      PaystackService.logger.error('Error getting user payments:', error);
      return {
        success: false,
        message: 'Failed to retrieve payment history',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get payment statistics for admin
   */
  public static async getPaymentStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await PaymentModel.getPaymentStats();
      
      return {
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      PaystackService.logger.error('Error getting payment stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve payment statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get subscription pricing
   */
  public static getSubscriptionPricing(): ApiResponse<typeof PaystackService.SUBSCRIPTION_PRICES> {
    return {
      success: true,
      message: 'Subscription pricing retrieved successfully',
      data: PaystackService.SUBSCRIPTION_PRICES,
      timestamp: new Date()
    };
  }

  /**
   * Calculate subscription expiration date
   */
  private static calculateSubscriptionExpiration(billingCycle: BillingCycle): Date {
    const now = new Date();
    if (billingCycle === BillingCycle.YEARLY) {
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    } else {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
    }
  }

  /**
   * Generate unique payment reference
   */
  private static generateReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FHG_${timestamp}_${random}`;
  }
}
