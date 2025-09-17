import { PaymentCleanupService } from '../services/PaymentCleanupService';
import { Logger } from '../utils/Logger';

export class PaymentCleanupJob {
  private static logger: Logger = new Logger();
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the payment cleanup job
   * Runs every 30 minutes to clean up expired pending payments
   */
  public static start(): void {
    if (PaymentCleanupJob.intervalId) {
      PaymentCleanupJob.logger.warn('Payment cleanup job is already running');
      return;
    }

    // Run immediately on start
    PaymentCleanupJob.runCleanup();

    // Then run every 30 minutes
    PaymentCleanupJob.intervalId = setInterval(() => {
      PaymentCleanupJob.runCleanup();
    }, 30 * 60 * 1000); // 30 minutes

    PaymentCleanupJob.logger.info('Payment cleanup job started - will run every 30 minutes');
  }

  /**
   * Stop the payment cleanup job
   */
  public static stop(): void {
    if (PaymentCleanupJob.intervalId) {
      clearInterval(PaymentCleanupJob.intervalId);
      PaymentCleanupJob.intervalId = null;
      PaymentCleanupJob.logger.info('Payment cleanup job stopped');
    }
  }

  /**
   * Run the cleanup process
   */
  private static async runCleanup(): Promise<void> {
    try {
      PaymentCleanupJob.logger.info('Starting payment cleanup job...');
      
      // Get stats before cleanup
      const statsBefore = await PaymentCleanupService.getPendingPaymentStats();
      
      // Run cleanup
      await PaymentCleanupService.cleanupExpiredPayments();
      
      // Get stats after cleanup
      const statsAfter = await PaymentCleanupService.getPendingPaymentStats();
      
      PaymentCleanupJob.logger.info('Payment cleanup job completed', {
        before: statsBefore,
        after: statsAfter,
        cleaned: statsBefore.expiredPending - statsAfter.expiredPending
      });
    } catch (error: any) {
      PaymentCleanupJob.logger.error('Error in payment cleanup job:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
    }
  }

  /**
   * Get job status
   */
  public static getStatus(): {
    isRunning: boolean;
    nextRun?: Date;
  } {
    return {
      isRunning: PaymentCleanupJob.intervalId !== null,
      nextRun: PaymentCleanupJob.intervalId ? new Date(Date.now() + 30 * 60 * 1000) : undefined
    };
  }
}
