import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

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
      ValidationMiddleware.validateEmailOnly, // Only validate email for password reset
      AuthController.resetPassword
    );

    router.post('/reset-password/confirm', 
      ValidationMiddleware.validateResetPassword,
      AuthController.resetPasswordWithToken
    );

    router.get('/reset-password/verify/:token', 
      AuthController.verifyResetToken
    );

    router.get('/verify-token', 
      AuthController.verifyToken
    );

    router.post('/refresh-token', 
      AuthController.refreshToken
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
      AuthMiddleware.optionalAuth,
      AuthController.logout
    );

    return router;
  }

  public static getBasePath(): string {
    return '/auth';
  }
}
