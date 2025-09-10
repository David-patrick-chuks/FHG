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
      const { reference, status, transaction_id, amount, currency, gateway_response, paid_at } = req.body;

      if (!reference) {
        res.status(400).json({
          success: false,
          message: 'Reference is required',
          timestamp: new Date()
        });
        return;
      }

      // Verify the webhook is from Paystack (you should implement proper webhook verification)
      // For now, we'll just process the callback
      if (status === 'success') {
        const result = await PaystackService.verifyPayment(reference);
        
        if (result.success) {
          res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            timestamp: new Date()
          });
        } else {
          res.status(400).json(result);
        }
      } else {
        res.status(200).json({
          success: true,
          message: 'Webhook received but payment not successful',
          timestamp: new Date()
        });
      }
    } catch (error: any) {
      PaymentController.logger.error('Error in handleWebhook controller:', {
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
