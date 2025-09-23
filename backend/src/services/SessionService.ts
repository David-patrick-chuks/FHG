import SessionModel from '../models/Session';
import UserModel from '../models/User';
import { Logger } from '../utils/Logger';

export class SessionService {
  private static logger: Logger = new Logger();

  /**
   * Get active sessions for a user
   */
  public static async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await SessionModel.getActiveSessions(userId);
      
      return sessions.map(session => ({
        sessionId: session.sessionId,
        deviceInfo: session.deviceInfo,
        createdAt: session.createdAt,
        lastAccessedAt: session.lastAccessedAt,
        expiresAt: session.expiresAt
      }));
    } catch (error) {
      SessionService.logger.error('Error getting user sessions:', error);
      throw error;
    }
  }

  /**
   * Invalidate a specific session
   */
  public static async invalidateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const result = await SessionModel.findOneAndUpdate(
        { sessionId, userId, isActive: true },
        { isActive: false, lastAccessedAt: new Date() }
      );

      if (result) {
        SessionService.logger.info('Session invalidated', {
          sessionId,
          userId
        });
        return true;
      }

      return false;
    } catch (error) {
      SessionService.logger.error('Error invalidating session:', error);
      throw error;
    }
  }

  /**
   * Invalidate all sessions for a user except the current one
   */
  public static async invalidateAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    try {
      await SessionModel.invalidateUserSessions(userId, currentSessionId);
      
      SessionService.logger.info('All other sessions invalidated', {
        userId,
        currentSessionId
      });
    } catch (error) {
      SessionService.logger.error('Error invalidating all other sessions:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  public static async cleanupExpiredSessions(): Promise<void> {
    try {
      await SessionModel.cleanupExpiredSessions();
      
      // Only log in debug mode to avoid spam
      if (process.env.LOG_LEVEL === 'debug') {
        SessionService.logger.debug('Expired sessions cleaned up');
      }
    } catch (error) {
      SessionService.logger.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  public static async getSessionStats(): Promise<{
    totalActiveSessions: number;
    sessionsByDevice: Record<string, number>;
    sessionsByUser: number;
  }> {
    try {
      const now = new Date();
      
      // Get total active sessions
      const totalActiveSessions = await SessionModel.countDocuments({
        isActive: true,
        expiresAt: { $gt: now }
      });

      // Get sessions by device type
      const deviceStats = await SessionModel.aggregate([
        {
          $match: {
            isActive: true,
            expiresAt: { $gt: now }
          }
        },
        {
          $group: {
            _id: '$deviceInfo.deviceType',
            count: { $sum: 1 }
          }
        }
      ]);

      const sessionsByDevice = deviceStats.reduce((acc, stat) => {
        acc[stat._id || 'unknown'] = stat.count;
        return acc;
      }, {} as Record<string, number>);

      // Get unique users with active sessions
      const sessionsByUser = await SessionModel.distinct('userId', {
        isActive: true,
        expiresAt: { $gt: now }
      });

      return {
        totalActiveSessions,
        sessionsByDevice,
        sessionsByUser: sessionsByUser.length
      };
    } catch (error) {
      SessionService.logger.error('Error getting session stats:', error);
      throw error;
    }
  }

  /**
   * Toggle multiple sessions for a user
   */
  public static async toggleMultipleSessions(userId: string, allowMultiple: boolean): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        allowMultipleSessions: allowMultiple
      });

      // If disabling multiple sessions, invalidate all but the most recent
      if (!allowMultiple) {
        const sessions = await SessionModel.getActiveSessions(userId);
        if (sessions.length > 1) {
          // Keep the most recent session, invalidate others
          const sortedSessions = sessions.sort((a, b) => 
            new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
          );
          
          const sessionsToInvalidate = sortedSessions.slice(1);
          for (const session of sessionsToInvalidate) {
            await session.invalidateSession();
          }
        }
      }

      SessionService.logger.info('Multiple sessions setting updated', {
        userId,
        allowMultiple
      });
    } catch (error) {
      SessionService.logger.error('Error toggling multiple sessions:', error);
      throw error;
    }
  }
}
