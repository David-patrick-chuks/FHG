import { Request, Response } from 'express';
import { SessionService } from '../services/SessionService';
import { Logger } from '../utils/Logger';

export class SessionController {
  private static logger: Logger = new Logger();

  /**
   * Get user's active sessions
   */
  public static async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const currentSessionId = (req as any).user?.sessionId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date()
        });
        return;
      }

      const sessions = await SessionService.getUserSessions(userId);

      res.status(200).json({
        success: true,
        data: sessions,
        currentSessionId: currentSessionId,
        timestamp: new Date()
      });
    } catch (error: any) {
      SessionController.logger.error('Error getting user sessions:', {
        message: error?.message,
        stack: error?.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get sessions',
        timestamp: new Date()
      });
    }
  }

  /**
   * Invalidate a specific session
   */
  public static async invalidateSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { sessionId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date()
        });
        return;
      }

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
          timestamp: new Date()
        });
        return;
      }

      const success = await SessionService.invalidateSession(sessionId, userId);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Session invalidated successfully',
          timestamp: new Date()
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Session not found or already invalidated',
          timestamp: new Date()
        });
      }
    } catch (error: any) {
      SessionController.logger.error('Error invalidating session:', {
        message: error?.message,
        stack: error?.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to invalidate session',
        timestamp: new Date()
      });
    }
  }

  /**
   * Invalidate all other sessions (keep current one)
   */
  public static async invalidateAllOtherSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const currentSessionId = (req as any).user?.sessionId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date()
        });
        return;
      }

      if (!currentSessionId) {
        res.status(400).json({
          success: false,
          message: 'Current session not found',
          timestamp: new Date()
        });
        return;
      }

      await SessionService.invalidateAllOtherSessions(userId, currentSessionId);

      res.status(200).json({
        success: true,
        message: 'All other sessions invalidated successfully',
        timestamp: new Date()
      });
    } catch (error: any) {
      SessionController.logger.error('Error invalidating all other sessions:', {
        message: error?.message,
        stack: error?.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to invalidate other sessions',
        timestamp: new Date()
      });
    }
  }

  /**
   * Toggle multiple sessions setting
   */
  public static async toggleMultipleSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { allowMultiple } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date()
        });
        return;
      }

      if (typeof allowMultiple !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'allowMultiple must be a boolean value',
          timestamp: new Date()
        });
        return;
      }

      await SessionService.toggleMultipleSessions(userId, allowMultiple);

      res.status(200).json({
        success: true,
        message: `Multiple sessions ${allowMultiple ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date()
      });
    } catch (error: any) {
      SessionController.logger.error('Error toggling multiple sessions:', {
        message: error?.message,
        stack: error?.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update session settings',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get session statistics (Admin only)
   */
  public static async getSessionStats(req: Request, res: Response): Promise<void> {
    try {
      const isAdmin = (req as any).user?.isAdmin;
      
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date()
        });
        return;
      }

      const stats = await SessionService.getSessionStats();

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date()
      });
    } catch (error: any) {
      SessionController.logger.error('Error getting session stats:', {
        message: error?.message,
        stack: error?.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get session statistics',
        timestamp: new Date()
      });
    }
  }
}
