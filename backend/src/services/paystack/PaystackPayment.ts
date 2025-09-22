import axios, { AxiosResponse } from 'axios';
import PaymentModel from '../../models/Payment';
import UserModel from '../../models/User';
import { ActivityType, ApiResponse, BillingCycle, InitializePaymentRequest, PaymentMethod, PaymentStatus } from '../../types';
import { ActivityService } from '../ActivityService';
import { PaystackCore, PaystackInitializeResponse, PaystackVerifyResponse } from './PaystackCore';

export class PaystackPayment extends PaystackCore {
  public static async initializePayment(
    request: InitializePaymentRequest,
    userId: string
  ): Promise<ApiResponse<PaystackInitializeResponse>> {
    try {
      // Check if PaystackCore is properly initialized
      if (!PaystackPayment.config) {
        PaystackPayment.logger.error('PaystackCore not initialized');
        return {
          success: false,
          message: 'Payment service not initialized',
          timestamp: new Date()
        };
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const { subscriptionTier, billingCycle } = request;
      let pricing = PaystackPayment.getSubscriptionPricing();
      
      // Check if pricing is properly initialized, with fallback
      if (!pricing || typeof pricing !== 'object') {
        PaystackPayment.logger.error('Pricing not properly initialized, using fallback:', { pricing });
        pricing = {
          basic: { monthly: 2999, yearly: 28790 },
          premium: { monthly: 9999, yearly: 95990 }
        };
      }
      
      const tierKey = subscriptionTier.toLowerCase() as keyof typeof pricing;
      
      // Add detailed logging for debugging
      PaystackPayment.logger.info('Payment initialization details:', {
        subscriptionTier,
        billingCycle,
        tierKey,
        availableTiers: Object.keys(pricing),
        pricing
      });
      
      // Validate tier exists in pricing
      if (!pricing[tierKey]) {
        PaystackPayment.logger.error('Invalid subscription tier:', {
          subscriptionTier,
          tierKey,
          availableTiers: Object.keys(pricing),
          pricing
        });
        return {
          success: false,
          message: `Invalid subscription tier: ${subscriptionTier}. Available tiers: ${Object.keys(pricing).join(', ')}`,
          timestamp: new Date()
        };
      }

      // Validate billing cycle exists for the tier
      const tierPricing = pricing[tierKey];
      const cycleKey = billingCycle.toLowerCase() as 'monthly' | 'yearly';
      
      if (!tierPricing[cycleKey]) {
        PaystackPayment.logger.error('Invalid billing cycle:', {
          billingCycle,
          cycleKey,
          availableCycles: Object.keys(tierPricing)
        });
        return {
          success: false,
          message: `Invalid billing cycle: ${billingCycle} for tier: ${subscriptionTier}. Available cycles: ${Object.keys(tierPricing).join(', ')}`,
          timestamp: new Date()
        };
      }

      const amount = tierPricing[cycleKey];

      if (!amount || amount === 0) {
        return {
          success: false,
          message: `Invalid billing cycle: ${billingCycle} for tier: ${subscriptionTier}`,
          timestamp: new Date()
        };
      }

      const reference = PaystackPayment.generateReference();

      const paymentData = {
        email: user.email,
        amount: amount * 100, // Convert to kobo
        reference,
        currency: 'NGN',
        metadata: {
          userId,
          subscriptionTier,
          billingCycle,
          username: user.username
        },
        callback_url: `${process.env.FRONTEND_URL}/dashboard/payments?success=true`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      };

      const response: AxiosResponse<PaystackInitializeResponse> = await axios.post(
        `${PaystackPayment.config.baseUrl}/transaction/initialize`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${PaystackPayment.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Calculate subscription expiration date
        const subscriptionExpiresAt = PaystackPayment.calculateSubscriptionExpiration(billingCycle);

        // Save payment record
        const payment = new PaymentModel({
          userId,
          reference,
          amount,
          currency: 'NGN',
          subscriptionTier,
          billingCycle,
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.PAYSTACK, // Default payment method for Paystack
          subscriptionExpiresAt,
          paystackReference: response.data.data.reference,
          authorizationUrl: response.data.data.authorization_url
        });

        await payment.save();

        // Log activity
        await ActivityService.logUserActivity(
          userId,
          ActivityType.PAYMENT_INITIALIZED,
          `Payment of ₦${amount.toLocaleString()} for ${subscriptionTier} ${billingCycle} subscription initiated`
        );

        return {
          success: true,
          message: 'Payment initialized successfully',
          data: response.data,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to initialize payment',
          timestamp: new Date()
        };
      }
    } catch (error: any) {
      PaystackPayment.logger.error('Error initializing payment:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        userId,
        request
      });

      return {
        success: false,
        message: 'Failed to initialize payment',
        timestamp: new Date()
      };
    }
  }

  public static async verifyPayment(reference: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<PaystackVerifyResponse> = await axios.get(
        `${PaystackPayment.config.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PaystackPayment.config.secretKey}`
          }
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        const paymentData = response.data.data;
        
        // Find and update payment record
        const payment = await PaymentModel.findOne({ reference });
        if (!payment) {
          return {
            success: false,
            message: 'Payment record not found',
            timestamp: new Date()
          };
        }

        // Update payment status
        payment.status = PaymentStatus.COMPLETED;
        payment.paidAt = new Date(paymentData.paid_at);
        payment.gatewayResponse = paymentData.gateway_response;

        await payment.save();

        // Update user subscription
        const user = await UserModel.findById(payment.userId);
        if (user) {
          const expirationDate = PaystackPayment.calculateSubscriptionExpiration(payment.billingCycle);
          
          user.subscription = payment.subscriptionTier;
          user.subscriptionExpiresAt = expirationDate;
          
          await user.save();

          // Log activity
          await ActivityService.logSubscriptionActivity(
            payment.userId,
            ActivityType.SUBSCRIPTION_CREATED,
            payment.subscriptionTier,
            `${payment.subscriptionTier} ${payment.billingCycle} subscription activated successfully`
          );
        }

        return {
          success: true,
          message: 'Payment verified successfully',
          data: {
            payment,
            user: user ? {
              id: user._id,
              email: user.email,
              username: user.username,
              subscription: user.subscription,
              subscriptionExpiresAt: user.subscriptionExpiresAt
            } : null
          },
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment verification failed',
          timestamp: new Date()
        };
      }
    } catch (error: any) {
      PaystackPayment.logger.error('Error verifying payment:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        reference
      });

      return {
        success: false,
        message: 'Failed to verify payment',
        timestamp: new Date()
      };
    }
  }

  public static async getUserPayments(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      subscriptionTier?: string;
      billingCycle?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<ApiResponse<{
    payments: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        subscriptionTier,
        billingCycle,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query: any = { userId };

      // Add filters
      if (status) {
        query.status = status;
      }
      if (subscriptionTier) {
        query.subscriptionTier = subscriptionTier;
      }
      if (billingCycle) {
        query.billingCycle = billingCycle;
      }

      // Add search functionality
      if (search) {
        query.$or = [
          { reference: { $regex: search, $options: 'i' } },
          { paystackReference: { $regex: search, $options: 'i' } },
          { gatewayResponse: { $regex: search, $options: 'i' } },
          { failureReason: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const totalItems = await PaymentModel.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const payments = await PaymentModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v');

      // Ensure proper serialization of _id fields
      const serializedPayments = payments.map(payment => ({
        ...payment.toObject(),
        _id: (payment._id as any).toString()
      }));

      return {
        success: true,
        message: 'Payments retrieved successfully',
        data: {
          payments: serializedPayments,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackPayment.logger.error('Error getting user payments:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        userId
      });

      return {
        success: false,
        message: 'Failed to retrieve payments',
        timestamp: new Date()
      };
    }
  }

  public static async getAllPayments(
    options: {
      page?: number;
      limit?: number;
      status?: string;
      subscriptionTier?: string;
      billingCycle?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<ApiResponse<{
    payments: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        subscriptionTier,
        billingCycle,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query (no userId filter for admin)
      const query: any = {};

      // Add filters
      if (status) {
        query.status = status;
      }
      if (subscriptionTier) {
        query.subscriptionTier = subscriptionTier;
      }
      if (billingCycle) {
        query.billingCycle = billingCycle;
      }

      // Add search functionality
      if (search) {
        query.$or = [
          { reference: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const totalItems = await PaymentModel.countDocuments(query);

      // Get payments with pagination
      const payments = await PaymentModel.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        message: 'All payments retrieved successfully',
        data: {
          payments,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackPayment.logger.error('Error getting all payments:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });

      return {
        success: false,
        message: 'Failed to retrieve payments',
        timestamp: new Date()
      };
    }
  }

  public static async getPaymentStats(): Promise<ApiResponse<any>> {
    try {
      const totalPayments = await PaymentModel.countDocuments();
      const successfulPayments = await PaymentModel.countDocuments({ status: PaymentStatus.COMPLETED });
      const failedPayments = await PaymentModel.countDocuments({ status: PaymentStatus.FAILED });
      const pendingPayments = await PaymentModel.countDocuments({ status: PaymentStatus.PENDING });
      const totalAmount = await PaymentModel.aggregate([
        { $match: { status: PaymentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        success: true,
        message: 'Payment stats retrieved successfully',
        data: {
          totalPayments,
          totalAmount: totalAmount[0]?.total || 0,
          successfulPayments,
          failedPayments,
          pendingPayments
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackPayment.logger.error('Error getting payment stats:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });

      return {
        success: false,
        message: 'Failed to retrieve payment stats',
        timestamp: new Date()
      };
    }
  }

  public static async exportPayments(
    options: {
      status?: string;
      subscriptionTier?: string;
      billingCycle?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      format?: 'csv' | 'excel';
    } = {}
  ): Promise<ApiResponse<Buffer>> {
    try {
      const {
        status,
        subscriptionTier,
        billingCycle,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        format = 'csv'
      } = options;

      // Build query (same as getAllPayments but without pagination)
      const query: any = {};

      // Add filters
      if (status) {
        query.status = status;
      }
      if (subscriptionTier) {
        query.subscriptionTier = subscriptionTier;
      }
      if (billingCycle) {
        query.billingCycle = billingCycle;
      }

      // Add search functionality
      if (search) {
        query.$or = [
          { reference: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ];
      }

      // Get all payments matching the query
      const payments = await PaymentModel.find(query)
        .sort({ [sortBy]: sortOrder })
        .populate('userId', 'email username')
        .lean();

      if (format === 'csv') {
        // Generate CSV content
        const csvContent = PaystackPayment.generateCSV(payments);
        const buffer = Buffer.from(csvContent, 'utf-8');

        return {
          success: true,
          message: 'Payments exported successfully',
          data: buffer,
          timestamp: new Date()
        };
      } else {
        // For Excel format, we would need a library like 'xlsx'
        // For now, return CSV as fallback
        const csvContent = PaystackPayment.generateCSV(payments);
        const buffer = Buffer.from(csvContent, 'utf-8');

        return {
          success: true,
          message: 'Payments exported successfully (CSV format)',
          data: buffer,
          timestamp: new Date()
        };
      }
    } catch (error: any) {
      PaystackPayment.logger.error('Error exporting payments:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });

      return {
        success: false,
        message: 'Failed to export payments',
        timestamp: new Date()
      };
    }
  }

  private static generateCSV(payments: any[]): string {
    const headers = [
      'Reference',
      'User ID',
      'User Email',
      'Username',
      'Amount (NGN)',
      'Currency',
      'Subscription Tier',
      'Billing Cycle',
      'Status',
      'Payment Method',
      'Created At',
      'Paid At',
      'Subscription Expires At',
      'Gateway Response',
      'Failure Reason'
    ];

    const rows = payments.map(payment => [
      payment.reference || '',
      payment.userId?._id || payment.userId || '',
      payment.userId?.email || '',
      payment.userId?.username || '',
      payment.amount || 0,
      payment.currency || 'NGN',
      payment.subscriptionTier || '',
      payment.billingCycle || '',
      payment.status || '',
      payment.paymentMethod || '',
      payment.createdAt ? new Date(payment.createdAt).toISOString() : '',
      payment.paidAt ? new Date(payment.paidAt).toISOString() : '',
      payment.subscriptionExpiresAt ? new Date(payment.subscriptionExpiresAt).toISOString() : '',
      payment.gatewayResponse || '',
      payment.failureReason || ''
    ]);

    // Escape CSV values and handle commas/quotes
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ];

    return csvRows.join('\n');
  }

  private static calculateSubscriptionExpiration(billingCycle: BillingCycle): Date {
    const now = new Date();
    if (billingCycle === BillingCycle.MONTHLY) {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    } else {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
  }
}