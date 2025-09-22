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

    // System activities
    router.get('/system-activities', 
      ValidationMiddleware.validatePagination,
      ValidationMiddleware.validateDateRange,
      AdminController.getSystemActivities
    );

    router.get('/system-activities/critical', 
      AdminController.getCriticalSystemActivities
    );

    router.put('/system-activities/:activityId/resolve', 
      AdminController.resolveSystemActivity
    );

    // Incident management
    router.get('/incidents', 
      AdminController.getAllIncidents
    );

    router.get('/incidents/active', 
      AdminController.getActiveIncidents
    );

    router.get('/incidents/:incidentId', 
      AdminController.getIncidentById
    );

    router.post('/incidents', 
      AdminController.createIncident
    );

    router.put('/incidents/:incidentId', 
      AdminController.updateIncident
    );

    router.put('/incidents/:incidentId/resolve', 
      AdminController.resolveIncident
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
