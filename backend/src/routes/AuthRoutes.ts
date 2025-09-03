import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class AuthRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // Public routes (no authentication required)
    router.post('/register', 
      ValidationMiddleware.validateCreateUser,
      AuthController.register
    );

    router.post('/login', 
      ValidationMiddleware.validateLogin,
      AuthController.login
    );

    router.post('/reset-password', 
      ValidationMiddleware.validateLogin, // Reuse email validation
      AuthController.resetPassword
    );

    router.get('/verify-token', 
      AuthController.verifyToken
    );

    // Protected routes (authentication required)
    router.get('/profile', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.getProfile
    );

    router.put('/profile', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.updateProfile
    );

    router.put('/change-password', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.changePassword
    );

    router.get('/stats', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.getUserStats
    );

    router.post('/logout', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.logout
    );

    return router;
  }

  public static getBasePath(): string {
    return '/auth';
  }
}
