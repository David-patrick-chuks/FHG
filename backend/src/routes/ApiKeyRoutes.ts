import { Router } from 'express';
import { ApiKeyController } from '../controllers/ApiKeyController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class ApiKeyRoutes {
  public static getBasePath(): string {
    return '/api-keys';
  }

  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All API key routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);
    router.use(AuthMiddleware.rateLimitByUser);

    /**
     * @route POST /api-keys/generate
     * @desc Generate a new API key for the user
     * @access Private
     */
    router.post('/generate', ApiKeyController.generateApiKey);

    /**
     * @route GET /api-keys/info
     * @desc Get current API key information
     * @access Private
     */
    router.get('/info', ApiKeyController.getApiKeyInfo);

    /**
     * @route DELETE /api-keys/revoke
     * @desc Revoke current API key
     * @access Private
     */
    router.delete('/revoke', ApiKeyController.revokeApiKey);

    return router;
  }
}
