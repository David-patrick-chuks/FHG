import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class PaymentRoutes {
  public static getBasePath(): string {
    return '/api/payments';
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
     * @access Public
     */
    router.post('/webhook', PaymentController.handleWebhook);

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
