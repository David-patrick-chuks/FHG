import { Router } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { SessionController } from '../controllers/SessionController';

export class SessionRoutes {
  public static getBasePath(): string {
    return '/sessions';
  }

  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All session routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);
    router.use(AuthMiddleware.rateLimitByUser);

    /**
     * @route GET /api/sessions
     * @desc Get user's active sessions
     * @access Private
     */
    router.get('/', SessionController.getUserSessions);

    /**
     * @route DELETE /api/sessions/:sessionId
     * @desc Invalidate a specific session
     * @access Private
     */
    router.delete('/:sessionId', SessionController.invalidateSession);

    /**
     * @route DELETE /api/sessions/others
     * @desc Invalidate all other sessions (keep current one)
     * @access Private
     */
    router.delete('/others', SessionController.invalidateAllOtherSessions);

    /**
     * @route PUT /api/sessions/multiple
     * @desc Toggle multiple sessions setting
     * @access Private
     */
    router.put('/multiple', SessionController.toggleMultipleSessions);

    /**
     * @route GET /api/sessions/stats
     * @desc Get session statistics (Admin only)
     * @access Private (Admin)
     */
    router.get('/stats', SessionController.getSessionStats);

    return router;
  }
}
