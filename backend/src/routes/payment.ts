import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// Initialize payment (requires authentication)
router.post('/initialize', AuthMiddleware.authenticate, PaymentController.initializePayment);

// Verify payment (requires authentication)
router.post('/verify', AuthMiddleware.authenticate, PaymentController.verifyPayment);

// Paystack webhook callback (no authentication required)
router.post('/webhook', PaymentController.handleWebhook);

// Get user payment history (requires authentication)
router.get('/history', AuthMiddleware.authenticate, PaymentController.getUserPayments);

// Get subscription pricing (public endpoint)
router.get('/pricing', PaymentController.getSubscriptionPricing);

// Get payment statistics (admin only)
router.get('/stats', AuthMiddleware.authenticate, PaymentController.getPaymentStats);

export default router;
