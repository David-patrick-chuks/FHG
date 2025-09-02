import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class AdminRoutes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Apply global middleware
    this.router.use(ValidationMiddleware.sanitizeRequestBody);

    // All admin routes require authentication and admin privileges
    this.router.use(AuthMiddleware.authenticate);
    this.router.use(AuthMiddleware.requireAdmin);
    this.router.use(AuthMiddleware.rateLimitByUser);

    // User management
    this.router.get('/users', 
      ValidationMiddleware.validatePagination,
      AdminController.getAllUsers
    );

    this.router.get('/users/:id', 
      AdminController.getUserById
    );

    this.router.put('/users/:id/subscription', 
      ValidationMiddleware.validateCreateSubscription,
      AdminController.updateUserSubscription
    );

    this.router.post('/users/:id/suspend', 
      AdminController.suspendUser
    );

    this.router.post('/users/:id/activate', 
      AdminController.activateUser
    );

    this.router.delete('/users/:id', 
      AdminController.deleteUser
    );

    // Platform statistics
    this.router.get('/stats/platform', 
      AdminController.getPlatformStats
    );

    this.router.get('/stats/subscriptions', 
      AdminController.getSubscriptionStats
    );

    this.router.get('/stats/admin-activity', 
      ValidationMiddleware.validateDateRange,
      AdminController.getAdminActivityStats
    );

    this.router.get('/stats/system-activity', 
      ValidationMiddleware.validateDateRange,
      AdminController.getSystemActivityStats
    );

    // Admin actions
    this.router.get('/actions', 
      ValidationMiddleware.validatePagination,
      ValidationMiddleware.validateDateRange,
      AdminController.getAdminActions
    );

    this.router.get('/actions/:adminId', 
      ValidationMiddleware.validateDateRange,
      AdminController.getAdminActivityStats
    );

    // Data management
    this.router.post('/cleanup', 
      AdminController.cleanupOldData
    );

    return this.router;
  }

  public static getBasePath(): string {
    return '/admin';
  }
}
