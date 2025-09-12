import axios, { AxiosResponse } from 'axios';
import { ActivityType } from '../models/Activity';
import PaymentModel from '../models/Payment';
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
  public static async verifyPayment(reference: string): Promise<ApiResponse<any>> {
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

        // Properly serialize the payment document
        const paymentObj = payment.toObject();
        const serializedPayment = {
          _id: paymentObj._id.toString(),
          userId: paymentObj.userId.toString(),
          subscriptionTier: paymentObj.subscriptionTier,
          billingCycle: paymentObj.billingCycle,
          amount: paymentObj.amount,
          currency: paymentObj.currency,
          status: paymentObj.status,
          paymentMethod: paymentObj.paymentMethod,
          reference: paymentObj.reference,
          metadata: paymentObj.metadata,
          subscriptionExpiresAt: paymentObj.subscriptionExpiresAt?.toISOString(),
          isActive: paymentObj.isActive,
          createdAt: paymentObj.createdAt?.toISOString(),
          updatedAt: paymentObj.updatedAt?.toISOString(),
          authorizationUrl: paymentObj.authorizationUrl,
          paystackAccessCode: paymentObj.paystackAccessCode,
          paystackReference: paymentObj.paystackReference,
          gatewayResponse: paymentObj.gatewayResponse,
          paidAt: paymentObj.paidAt?.toISOString(),
          transactionId: paymentObj.transactionId
        };

        return {
          success: true,
          message: 'Payment verified successfully',
          data: serializedPayment,
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
  public static async getUserPayments(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const payments = await PaymentModel.findByUserId(userId);
      
      // Properly serialize MongoDB documents to JSON
      const serializedPayments = payments.map(payment => {
        const paymentObj = payment.toObject();
        return {
          _id: paymentObj._id.toString(),
          userId: paymentObj.userId.toString(),
          subscriptionTier: paymentObj.subscriptionTier,
          billingCycle: paymentObj.billingCycle,
          amount: paymentObj.amount,
          currency: paymentObj.currency,
          status: paymentObj.status,
          paymentMethod: paymentObj.paymentMethod,
          reference: paymentObj.reference,
          metadata: paymentObj.metadata,
          subscriptionExpiresAt: paymentObj.subscriptionExpiresAt?.toISOString(),
          isActive: paymentObj.isActive,
          createdAt: paymentObj.createdAt?.toISOString(),
          updatedAt: paymentObj.updatedAt?.toISOString(),
          authorizationUrl: paymentObj.authorizationUrl,
          paystackAccessCode: paymentObj.paystackAccessCode,
          paystackReference: paymentObj.paystackReference,
          gatewayResponse: paymentObj.gatewayResponse,
          paidAt: paymentObj.paidAt?.toISOString(),
          transactionId: paymentObj.transactionId
        };
      });
      
      return {
        success: true,
        message: 'Payment history retrieved successfully',
        data: serializedPayments,
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
    return `MailQuill_${timestamp}_${random}`;
  }

  /**
   * Generate digital receipt for a payment
   */
  public static async generateReceipt(
    userId: string,
    reference: string
  ): Promise<ApiResponse<Buffer>> {
    try {
      PaystackService.logger.info('Generating receipt', { userId, reference });
      
      // Find payment record
      const payment = await PaymentModel.findByReference(reference);
      if (!payment) {
        PaystackService.logger.warn('Payment not found', { reference });
        return {
          success: false,
          message: 'Payment not found',
          timestamp: new Date()
        };
      }

      // Verify user owns this payment
      if (payment.userId !== userId) {
        return {
          success: false,
          message: 'Unauthorized access to payment',
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

      // Generate image receipt
      const imageBuffer = await PaystackService.generateReceiptImage(payment, user);

      return {
        success: true,
        message: 'Receipt generated successfully',
        data: imageBuffer,
        timestamp: new Date()
      };
    } catch (error) {
      PaystackService.logger.error('Error generating receipt:', error);
      return {
        success: false,
        message: 'Failed to generate receipt',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get current subscription details
   */
  public static async getCurrentSubscription(userId: string): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const subscriptionData = {
        tier: user.subscription,
        billingCycle: user.billingCycle,
        isActive: user.hasActiveSubscription(),
        expiresAt: user.subscriptionExpiresAt?.toISOString(),
        features: PaystackService.getSubscriptionFeatures(user.subscription),
        limits: {
          maxBots: user.getMaxBots ? user.getMaxBots() : 0,
          maxCampaigns: user.getMaxCampaigns ? user.getMaxCampaigns() : 0,
          maxAIMessageVariations: user.getMaxAIMessageVariations ? user.getMaxAIMessageVariations() : 0,
          maxEmailExtractions: 0 // Method not implemented yet
        }
      };

      return {
        success: true,
        message: 'Subscription details retrieved successfully',
        data: subscriptionData,
        timestamp: new Date()
      };
    } catch (error) {
      PaystackService.logger.error('Error getting current subscription:', error);
      return {
        success: false,
        message: 'Failed to retrieve subscription details',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Cancel subscription
   */
  public static async cancelSubscription(
    userId: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Update user subscription to free
      user.subscription = SubscriptionTier.FREE;
      user.billingCycle = BillingCycle.MONTHLY;
      user.subscriptionExpiresAt = new Date();
      await user.save();

      // Log activity
      await ActivityService.logUserActivity(
        userId,
        ActivityType.SUBSCRIPTION_CANCELLED,
        `Subscription cancelled. Reason: ${reason || 'No reason provided'}`
      );

      PaystackService.logger.info(`Subscription cancelled for user ${userId}`, { reason });

      return {
        success: true,
        message: 'Subscription cancelled successfully',
        data: {
          newTier: 'free',
          cancelledAt: new Date().toISOString()
        },
        timestamp: new Date()
      };
    } catch (error) {
      PaystackService.logger.error('Error cancelling subscription:', error);
      return {
        success: false,
        message: 'Failed to cancel subscription',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Check if user can upgrade (hide upgrade banner for highest tier)
   */
  public static async canUpgrade(userId: string): Promise<ApiResponse<{ canUpgrade: boolean; currentTier: string; highestTier: string }>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const currentTier = user.subscription;
      const highestTier = 'enterprise';
      const canUpgrade = currentTier !== highestTier;

      return {
        success: true,
        message: 'Upgrade eligibility checked successfully',
        data: {
          canUpgrade,
          currentTier,
          highestTier
        },
        timestamp: new Date()
      };
    } catch (error) {
      PaystackService.logger.error('Error checking upgrade eligibility:', error);
      return {
        success: false,
        message: 'Failed to check upgrade eligibility',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate receipt HTML template
   */
  private static generateReceiptHTML(payment: any, user: any): string {
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt - MailQuill</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 24px;
            margin: 0;
            opacity: 0.9;
          }
          .content {
            padding: 40px;
          }
          .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .info-section h3 {
            color: #374151;
            margin-bottom: 15px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .info-label {
            color: #6b7280;
            font-weight: 500;
          }
          .info-value {
            color: #111827;
            font-weight: 600;
          }
          .amount-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
          }
          .amount-label {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .amount-value {
            color: #059669;
            font-size: 36px;
            font-weight: bold;
            margin: 0;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-completed {
            background: #d1fae5;
            color: #065f46;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .footer a {
            color: #3b82f6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">📧 MailQuill</div>
            <h1 class="receipt-title">Payment Receipt</h1>
          </div>
          
          <div class="content">
            <div class="receipt-info">
              <div class="info-section">
                <h3>Payment Details</h3>
                <div class="info-item">
                  <span class="info-label">Reference:</span>
                  <span class="info-value">${payment.reference}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${formatDate(payment.createdAt)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Paid:</span>
                  <span class="info-value">${payment.paidAt ? formatDate(payment.paidAt) : 'Pending'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value">
                    <span class="status-badge status-completed">${payment.status}</span>
                  </span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Customer Details</h3>
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${user.username}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${user.email}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Plan:</span>
                  <span class="info-value">${payment.subscriptionTier.toUpperCase()}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Billing:</span>
                  <span class="info-value">${payment.billingCycle}</span>
                </div>
              </div>
            </div>
            
            <div class="amount-section">
              <div class="amount-label">Total Amount</div>
              <div class="amount-value">${formatCurrency(payment.amount)}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing MailQuill! 🚀</p>
            <p>For support, visit <a href="https://mailquill.com">mailquill.com</a></p>
            <p>This is an automated receipt. No signature required.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate receipt as SVG image
   */
  private static async generateReceiptImage(payment: any, user: any): Promise<Buffer> {
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create SVG receipt
    const svg = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="600" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
        
        <!-- Header -->
        <rect x="0" y="0" width="400" height="80" fill="url(#headerGradient)"/>
        <text x="200" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">MailQuill</text>
        <text x="200" y="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Payment Receipt</text>
        
        <!-- Receipt Content -->
        <text x="20" y="120" fill="#374151" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Payment Details</text>
        
        <!-- Payment Info -->
        <text x="20" y="150" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Reference:</text>
        <text x="120" y="150" fill="#111827" font-family="Arial, sans-serif" font-size="12">${payment.reference}</text>
        
        <text x="20" y="170" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Amount:</text>
        <text x="120" y="170" fill="#111827" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${formatCurrency(payment.amount)}</text>
        
        <text x="20" y="190" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Plan:</text>
        <text x="120" y="190" fill="#111827" font-family="Arial, sans-serif" font-size="12">${payment.subscriptionTier} - ${payment.billingCycle}</text>
        
        <text x="20" y="210" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Date:</text>
        <text x="120" y="210" fill="#111827" font-family="Arial, sans-serif" font-size="12">${formatDate(payment.paidAt || payment.createdAt)}</text>
        
        <text x="20" y="230" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Status:</text>
        <text x="120" y="230" fill="#10B981" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${payment.status.toUpperCase()}</text>
        
        <!-- User Info -->
        <text x="20" y="270" fill="#374151" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Customer Information</text>
        
        <text x="20" y="300" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Name:</text>
        <text x="120" y="300" fill="#111827" font-family="Arial, sans-serif" font-size="12">${user.username}</text>
        
        <text x="20" y="320" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Email:</text>
        <text x="120" y="320" fill="#111827" font-family="Arial, sans-serif" font-size="12">${user.email}</text>
        
        <!-- Divider Line -->
        <line x1="20" y1="360" x2="380" y2="360" stroke="#E5E7EB" stroke-width="1"/>
        
        <!-- Footer -->
        <text x="200" y="400" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">Thank you for choosing MailQuill!</text>
        <text x="200" y="420" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="10">This is your official payment receipt</text>
        <text x="200" y="440" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="10">Keep this receipt for your records</text>
        
        <!-- QR Code Placeholder -->
        <rect x="150" y="480" width="100" height="100" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="1"/>
        <text x="200" y="540" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="10">Receipt QR</text>
        <text x="200" y="555" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="8">${payment.reference}</text>
      </svg>
    `;

    return Buffer.from(svg, 'utf-8');
  }

  /**
   * Get subscription features
   */
  private static getSubscriptionFeatures(tier: string): string[] {
    const features = {
      free: ['2 Bots', '2 Campaigns', '10 AI Variations', '10 Email Extractions'],
      pro: ['10 Bots', '10 Campaigns', '20 AI Variations', '100 Email Extractions'],
      enterprise: ['50 Bots', '50 Campaigns', '50 AI Variations', 'Unlimited Email Extractions']
    };
    return features[tier as keyof typeof features] || features.free;
  }
}
