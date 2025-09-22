import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { WebhookMiddleware } from '../middleware/WebhookMiddleware';

export class PaymentRoutes {
  public static getBasePath(): string {
    return '/payments';
  }

  public static getRouter(): Router {
    const router = Router();

    /**
     * @route POST /api/payments/initialize
     * @desc Initialize payment
     * @access Private
     */
    router.post('/initialize', AuthMiddleware.authenticate, PaymentController.initializePayment);

    /**
     * @route POST /api/payments/verify
     * @desc Verify payment
     * @access Private
     */
    router.post('/verify', AuthMiddleware.authenticate, PaymentController.verifyPayment);

    /**
     * @route POST /api/payments/webhook
     * @desc Paystack webhook callback
     * @access Public (IP whitelisted)
     */
    router.post('/webhook', WebhookMiddleware.verifyPaystackIP, PaymentController.handleWebhook);

    /**
     * @route GET /api/payments/webhook-test
     * @desc Test webhook endpoint connectivity
     * @access Public
     */
    router.get('/webhook-test', (req, res) => {
      res.json({
        success: true,
        message: 'Webhook endpoint is accessible',
        timestamp: new Date(),
        url: req.url
      });
    });

    /**
     * @route POST /api/payments/verify-manual
     * @desc Manually verify payment by reference
     * @access Private
     */
    router.post('/verify-manual', AuthMiddleware.authenticate, PaymentController.verifyPayment);

    /**
     * @route GET /api/payments/history
     * @desc Get user payment history
     * @access Private
     */
    router.get('/history', AuthMiddleware.authenticate, PaymentController.getUserPayments);

    /**
     * @route GET /api/payments/pricing
     * @desc Get subscription pricing
     * @access Public
     */
    router.get('/pricing', PaymentController.getSubscriptionPricing);

    /**
     * @route GET /api/payments/stats
     * @desc Get payment statistics
     * @access Private (Admin)
     */
    router.get('/stats', AuthMiddleware.authenticate, PaymentController.getPaymentStats);

    /**
     * @route GET /api/payments/admin/all
     * @desc Get all payments with pagination and filtering (Admin only)
     * @access Private (Admin)
     */
    router.get('/admin/all', AuthMiddleware.authenticate, PaymentController.getAllPayments);

    /**
     * @route GET /api/payments/receipt/:reference
     * @desc Generate digital receipt for a payment
     * @access Private
     */
    router.get('/receipt/:reference', AuthMiddleware.authenticate, PaymentController.generateReceipt);

    /**
     * @route GET /api/payments/subscription
     * @desc Get current subscription details
     * @access Private
     */
    router.get('/subscription', AuthMiddleware.authenticate, PaymentController.getCurrentSubscription);

    /**
     * @route POST /api/payments/cancel-subscription
     * @desc Cancel current subscription
     * @access Private
     */
    router.post('/cancel-subscription', AuthMiddleware.authenticate, PaymentController.cancelSubscription);

    /**
     * @route GET /api/payments/can-upgrade
     * @desc Check if user can upgrade (hide upgrade banner for highest tier)
     * @access Private
     */
    router.get('/can-upgrade', AuthMiddleware.authenticate, PaymentController.canUpgrade);

    /**
     * @route GET /api/payments/admin/pending-stats
     * @desc Get pending payment statistics (Admin only)
     * @access Private (Admin)
     */
    router.get('/admin/pending-stats', AuthMiddleware.authenticate, PaymentController.getPendingPaymentStats);

    /**
     * @route POST /api/payments/admin/cleanup-expired
     * @desc Manually clean up expired pending payments (Admin only)
     * @access Private (Admin)
     */
    router.post('/admin/cleanup-expired', AuthMiddleware.authenticate, PaymentController.cleanupExpiredPayments);

    /**
     * @route POST /api/payments/admin/cleanup/:reference
     * @desc Manually clean up specific payment by reference (Admin only)
     * @access Private (Admin)
     */
    router.post('/admin/cleanup/:reference', AuthMiddleware.authenticate, PaymentController.cleanupPaymentByReference);

    return router;
  }
}
