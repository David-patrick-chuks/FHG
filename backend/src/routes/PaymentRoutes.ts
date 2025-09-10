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

    return router;
  }
}
