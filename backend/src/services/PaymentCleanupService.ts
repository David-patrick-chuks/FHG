import PaymentModel from '../models/Payment';
import { PaymentStatus } from '../types';
import { Logger } from '../utils/Logger';

export class PaymentCleanupService {
  private static logger: Logger = new Logger();

  /**
   * Clean up expired pending payments
   * This should be run as a scheduled job (e.g., every hour)
   */
  public static async cleanupExpiredPayments(): Promise<void> {
    try {
      // Mark payments as failed if they've been pending for more than 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const expiredPayments = await PaymentModel.find({
        status: PaymentStatus.PENDING,
        createdAt: { $lt: thirtyMinutesAgo }
      });

      if (expiredPayments.length > 0) {
        await PaymentModel.updateMany(
          {
            status: PaymentStatus.PENDING,
            createdAt: { $lt: thirtyMinutesAgo }
          },
          {
            $set: {
              status: PaymentStatus.FAILED,
              failureReason: 'Payment timeout - user did not complete payment within 30 minutes',
              updatedAt: new Date()
            }
          }
        );

        PaymentCleanupService.logger.info(`Cleaned up ${expiredPayments.length} expired pending payments`, {
          expiredCount: expiredPayments.length,
          cutoffTime: thirtyMinutesAgo
        });
      }
    } catch (error: any) {
      PaymentCleanupService.logger.error('Error cleaning up expired payments:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
    }
  }

  /**
   * Get statistics about pending payments
   */
  public static async getPendingPaymentStats(): Promise<{
    totalPending: number;
    expiredPending: number;
    recentPending: number;
  }> {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const [totalPending, expiredPending, recentPending] = await Promise.all([
        PaymentModel.countDocuments({ status: PaymentStatus.PENDING }),
        PaymentModel.countDocuments({ 
          status: PaymentStatus.PENDING,
          createdAt: { $lt: thirtyMinutesAgo }
        }),
        PaymentModel.countDocuments({ 
          status: PaymentStatus.PENDING,
          createdAt: { $gte: thirtyMinutesAgo }
        })
      ]);

      return {
        totalPending,
        expiredPending,
        recentPending
      };
    } catch (error: any) {
      PaymentCleanupService.logger.error('Error getting pending payment stats:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });

      return {
        totalPending: 0,
        expiredPending: 0,
        recentPending: 0
      };
    }
  }

  /**
   * Manually clean up specific payment by reference (Admin only)
   */
  public static async cleanupPaymentByReference(reference: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const payment = await PaymentModel.findOne({ reference });
      
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found'
        };
      }

      if (payment.status !== PaymentStatus.PENDING) {
        return {
          success: false,
          message: `Payment is not pending (current status: ${payment.status})`
        };
      }

      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Manually cancelled by admin';
      payment.updatedAt = new Date();
      
      await payment.save();

      PaymentCleanupService.logger.info('Payment manually cleaned up by admin', {
        reference,
        userId: payment.userId,
        amount: payment.amount
      });

      return {
        success: true,
        message: 'Payment marked as failed successfully'
      };
    } catch (error: any) {
      PaymentCleanupService.logger.error('Error manually cleaning up payment:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        reference
      });

      return {
        success: false,
        message: 'Failed to clean up payment'
      };
    }
  }
}
