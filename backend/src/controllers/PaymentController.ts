import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { PaystackService } from '../services/PaystackService';
import { ValidationService } from '../services/ValidationService';
import { InitializePaymentRequest, VerifyPaymentRequest } from '../types';
import { Logger } from '../utils/Logger';

export class PaymentController {
  private static logger: Logger = new Logger();

  /**
   * Initialize a payment transaction
   */
  public static async initializePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const { subscriptionTier, billingCycle, email } = req.body as InitializePaymentRequest;

      // Validate subscription tier
      const subscriptionTierResult = ValidationService.validateEnum(
        subscriptionTier,
        ['pro', 'enterprise'],
        { required: true }
      );

      if (!subscriptionTierResult.isValid) {
        res.status(400).json({
          success: false,
          message: `Invalid subscription tier: ${subscriptionTierResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      // Validate billing cycle
      const billingCycleResult = ValidationService.validateEnum(
        billingCycle,
        ['monthly', 'yearly'],
        { required: true }
      );

      if (!billingCycleResult.isValid) {
        res.status(400).json({
          success: false,
          message: `Invalid billing cycle: ${billingCycleResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      // Validate email
      const emailResult = ValidationService.validateEmail(email);

      if (!emailResult.isValid) {
        res.status(400).json({
          success: false,
          message: `Invalid email: ${emailResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      const result = await PaystackService.initializePayment(userId, {
        subscriptionTier: subscriptionTierResult.sanitizedValue,
        billingCycle: billingCycleResult.sanitizedValue,
        email: emailResult.sanitizedValue
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      PaymentController.logger.error('Error in initializePayment controller:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Verify a payment transaction
   */
  public static async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reference } = req.body as VerifyPaymentRequest;

      // Validate payment reference
      const referenceResult = ValidationService.validateString(reference, {
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9_-]+$/
      });

      if (!referenceResult.isValid) {
        res.status(400).json({
          success: false,
          message: `Invalid payment reference: ${referenceResult.errors.join(', ')}`,
          timestamp: new Date()
        });
        return;
      }

      const result = await PaystackService.verifyPayment(referenceResult.sanitizedValue);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      PaymentController.logger.error('Error in verifyPayment controller:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle Paystack webhook callback
   */
  public static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verify webhook signature
      const signature = req.headers['x-paystack-signature'] as string;
      const secret = process.env.PAYSTACK_SECRET_KEY;

      if (!signature || !secret) {
        PaymentController.logger.warn('Webhook signature or secret key missing', {
          hasSignature: !!signature,
          hasSecret: !!secret
        });
        res.status(400).json({
          success: false,
          message: 'Missing signature or secret key',
          timestamp: new Date()
        });
        return;
      }

      // Validate signature
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      if (hash !== signature) {
        PaymentController.logger.warn('Invalid webhook signature', {
          receivedSignature: signature,
          computedHash: hash
        });
        res.status(400).json({
          success: false,
          message: 'Invalid signature',
          timestamp: new Date()
        });
        return;
      }

      const { event, data } = req.body;

      PaymentController.logger.info('Webhook received', {
        event,
        reference: data?.reference,
        status: data?.status
      });

      // Handle different webhook events
      switch (event) {
        case 'charge.success':
          await PaymentController.handleSuccessfulPayment(data);
          break;
        
        case 'charge.failed':
          await PaymentController.handleFailedPayment(data);
          break;
        
        case 'subscription.create':
          await PaymentController.handleSubscriptionCreated(data);
          break;
        
        case 'subscription.disable':
          await PaymentController.handleSubscriptionDisabled(data);
          break;
        
        default:
          PaymentController.logger.info('Unhandled webhook event', { event });
      }

      // Always return 200 OK to acknowledge receipt
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date()
      });

    } catch (error: any) {
      PaymentController.logger.error('Error in handleWebhook controller:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      
      // Still return 200 OK to prevent retries for processing errors
      res.status(200).json({
        success: false,
        message: 'Webhook processing error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle successful payment webhook
   */
  private static async handleSuccessfulPayment(data: any): Promise<void> {
    try {
      const { reference, status, amount, currency, paid_at, customer } = data;

      if (status !== 'success') {
        PaymentController.logger.warn('Payment not successful in webhook', { reference, status });
        return;
      }

      // Verify payment with Paystack API
      const result = await PaystackService.verifyPayment(reference);
      
      if (result.success) {
        PaymentController.logger.info('Payment verified successfully via webhook', {
          reference,
          amount,
          currency,
          customerEmail: customer?.email
        });
      } else {
        PaymentController.logger.error('Payment verification failed via webhook', {
          reference,
          error: result.message
        });
      }
    } catch (error: any) {
      PaymentController.logger.error('Error handling successful payment webhook:', {
        message: error?.message,
        reference: data?.reference
      });
    }
  }

  /**
   * Handle failed payment webhook
   */
  private static async handleFailedPayment(data: any): Promise<void> {
    try {
      const { reference, status, message, customer } = data;

      PaymentController.logger.info('Payment failed via webhook', {
        reference,
        status,
        message,
        customerEmail: customer?.email
      });

      // Update payment status to failed
      // This would typically update the payment record in the database
    } catch (error: any) {
      PaymentController.logger.error('Error handling failed payment webhook:', {
        message: error?.message,
        reference: data?.reference
      });
    }
  }

  /**
   * Handle subscription created webhook
   */
  private static async handleSubscriptionCreated(data: any): Promise<void> {
    try {
      const { subscription_code, customer, plan } = data;

      PaymentController.logger.info('Subscription created via webhook', {
        subscriptionCode: subscription_code,
        customerEmail: customer?.email,
        planCode: plan?.plan_code
      });
    } catch (error: any) {
      PaymentController.logger.error('Error handling subscription created webhook:', {
        message: error?.message,
        subscriptionCode: data?.subscription_code
      });
    }
  }

  /**
   * Handle subscription disabled webhook
   */
  private static async handleSubscriptionDisabled(data: any): Promise<void> {
    try {
      const { subscription_code, customer } = data;

      PaymentController.logger.info('Subscription disabled via webhook', {
        subscriptionCode: subscription_code,
        customerEmail: customer?.email
      });
    } catch (error: any) {
      PaymentController.logger.error('Error handling subscription disabled webhook:', {
        message: error?.message,
        subscriptionCode: data?.subscription_code
      });
    }
  }

  /**
   * Get user payment history
   */
  public static async getUserPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      const result = await PaystackService.getUserPayments(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      PaymentController.logger.error('Error in getUserPayments controller:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get subscription pricing
   */
  public static async getSubscriptionPricing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = PaystackService.getSubscriptionPricing();
      res.status(200).json(result);
    } catch (error: any) {
      PaymentController.logger.error('Error in getSubscriptionPricing controller:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get payment statistics (Admin only)
   */
  public static async getPaymentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = (req as any).user['isAdmin'];
      
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date()
        });
        return;
      }

      const result = await PaystackService.getPaymentStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      PaymentController.logger.error('Error in getPaymentStats controller:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
