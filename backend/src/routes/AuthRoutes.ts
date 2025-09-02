import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class AuthRoutes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Apply global middleware
    this.router.use(ValidationMiddleware.sanitizeRequestBody);

    // Public routes (no authentication required)
    this.router.post('/register', 
      ValidationMiddleware.validateCreateUser,
      AuthController.register
    );

    this.router.post('/login', 
      ValidationMiddleware.validateLogin,
      AuthController.login
    );

    this.router.post('/reset-password', 
      ValidationMiddleware.validateLogin, // Reuse email validation
      AuthController.resetPassword
    );

    this.router.get('/verify-token', 
      AuthController.verifyToken
    );

    // Protected routes (authentication required)
    this.router.get('/profile', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.getProfile
    );

    this.router.put('/profile', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.updateProfile
    );

    this.router.put('/change-password', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.changePassword
    );

    this.router.get('/stats', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.getUserStats
    );

    this.router.post('/logout', 
      AuthMiddleware.authenticate,
      AuthMiddleware.requireAuth,
      AuthMiddleware.rateLimitByUser,
      AuthController.logout
    );

    return this.router;
  }

  public static getBasePath(): string {
    return '/auth';
  }
}
