import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class SubscriptionRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All subscription routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);
    router.use(AuthMiddleware.rateLimitByUser);

    // Subscription management
    router.post('/', 
      ValidationMiddleware.validateCreateSubscription,
      SubscriptionController.createSubscription
    );

    router.get('/', 
      SubscriptionController.getUserSubscriptions
    );

    router.get('/active', 
      SubscriptionController.getActiveSubscription
    );

    router.get('/:id', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.getSubscriptionById
    );

    router.put('/:id', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.updateSubscription
    );

    router.post('/:id/renew', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.renewSubscription
    );

    router.post('/:id/cancel', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.cancelSubscription
    );

    router.post('/:id/suspend', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.suspendSubscription
    );

    router.post('/:id/activate', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.activateSubscription
    );

    // New User-based subscription management routes
    router.post('/upgrade', 
      ValidationMiddleware.sanitizeRequestBody,
      SubscriptionController.upgradeSubscription
    );

    router.post('/billing-cycle', 
      ValidationMiddleware.sanitizeRequestBody,
      SubscriptionController.changeBillingCycle
    );

    router.get('/info', 
      SubscriptionController.getSubscriptionInfo
    );

    return router;
  }

  public static getBasePath(): string {
    return '/subscriptions';
  }
}
