import { Router } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { SessionController } from '../controllers/SessionController';

export class SessionRoutes {
  public static getBasePath(): string {
    return '/api/sessions';
  }

  public static getRouter(): Router {
    const router = Router();

    /**
     * @route GET /api/sessions
     * @desc Get user's active sessions
     * @access Private
     */
    router.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Sessions endpoint is working',
        timestamp: new Date(),
        path: req.originalUrl,
        method: req.method,
        cookies: req.cookies
      });
    });

    /**
     * @route DELETE /api/sessions/:sessionId
     * @desc Invalidate a specific session
     * @access Private
     */
    router.delete('/:sessionId', AuthMiddleware.authenticate, SessionController.invalidateSession);

    /**
     * @route DELETE /api/sessions/others
     * @desc Invalidate all other sessions (keep current one)
     * @access Private
     */
    router.delete('/others', AuthMiddleware.authenticate, SessionController.invalidateAllOtherSessions);

    /**
     * @route PUT /api/sessions/multiple
     * @desc Toggle multiple sessions setting
     * @access Private
     */
    router.put('/multiple', AuthMiddleware.authenticate, SessionController.toggleMultipleSessions);

    /**
     * @route GET /api/sessions/stats
     * @desc Get session statistics (Admin only)
     * @access Private (Admin)
     */
    router.get('/stats', AuthMiddleware.authenticate, SessionController.getSessionStats);

    return router;
  }
}
