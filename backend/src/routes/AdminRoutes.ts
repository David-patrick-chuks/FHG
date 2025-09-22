import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class AdminRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All admin routes require authentication and admin privileges
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAdmin);
    router.use(AuthMiddleware.rateLimitByUser);

    // User management
    router.get('/users', 
      ValidationMiddleware.validatePagination,
      AdminController.getAllUsers
    );

    router.get('/users/:id', 
      AdminController.getUserById
    );

    router.put('/users/:id/subscription', 
      ValidationMiddleware.validateCreateSubscription,
      AdminController.updateUserSubscription
    );

    router.post('/users/:id/suspend', 
      AdminController.suspendUser
    );

    router.post('/users/:id/activate', 
      AdminController.activateUser
    );

    router.delete('/users/:id', 
      AdminController.deleteUser
    );

    // Platform statistics
    router.get('/stats/platform', 
      AdminController.getPlatformStats
    );

    router.get('/stats/subscriptions', 
      AdminController.getSubscriptionStats
    );

    router.get('/stats/admin-activity', 
      ValidationMiddleware.validateDateRange,
      AdminController.getGeneralAdminActivityStats
    );

    router.get('/stats/system-activity', 
      ValidationMiddleware.validateDateRange,
      AdminController.getSystemActivityStats
    );

    // Admin actions
    router.get('/actions', 
      ValidationMiddleware.validatePagination,
      ValidationMiddleware.validateDateRange,
      AdminController.getAdminActions
    );

    router.get('/actions/:adminId', 
      ValidationMiddleware.validateDateRange,
      AdminController.getAdminActivityStats
    );

    // Data management
    router.post('/cleanup', 
      AdminController.cleanupOldData
    );

    return router;
  }

  public static getBasePath(): string {
    return '/admin';
  }
}
