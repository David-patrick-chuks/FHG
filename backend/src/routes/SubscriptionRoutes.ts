import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class SubscriptionRoutes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Apply global middleware
    this.router.use(ValidationMiddleware.sanitizeRequestBody);

    // All subscription routes require authentication
    this.router.use(AuthMiddleware.authenticate);
    this.router.use(AuthMiddleware.requireAuth);
    this.router.use(AuthMiddleware.rateLimitByUser);

    // Subscription management
    this.router.post('/', 
      ValidationMiddleware.validateCreateSubscription,
      SubscriptionController.createSubscription
    );

    this.router.get('/', 
      SubscriptionController.getUserSubscriptions
    );

    this.router.get('/active', 
      SubscriptionController.getActiveSubscription
    );

    this.router.get('/:id', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.getSubscriptionById
    );

    this.router.put('/:id', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.updateSubscription
    );

    this.router.post('/:id/renew', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.renewSubscription
    );

    this.router.post('/:id/cancel', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.cancelSubscription
    );

    this.router.post('/:id/suspend', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.suspendSubscription
    );

    this.router.post('/:id/activate', 
      AuthMiddleware.validateOwnership('subscription', 'id'),
      SubscriptionController.activateSubscription
    );

    return this.router;
  }

  public static getBasePath(): string {
    return '/subscriptions';
  }
}
