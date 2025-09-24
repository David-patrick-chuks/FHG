import { apiClient } from '../api-client';

export interface Session {
  sessionId: string;
  deviceInfo: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
}

export interface SessionStats {
  totalActiveSessions: number;
  sessionsByDevice: Record<string, number>;
  sessionsByUser: number;
}

export class SessionAPI {
  /**
   * Get user's active sessions
   */
  static async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<Session[]>('/sessions');
    return response.data || [];
  }

  /**
   * Invalidate a specific session
   */
  static async invalidateSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/sessions/${sessionId}`);
  }

  /**
   * Invalidate all other sessions (keep current one)
   */
  static async invalidateAllOtherSessions(): Promise<void> {
    await apiClient.delete('/sessions/others');
  }

  /**
   * Toggle multiple sessions setting
   */
  static async toggleMultipleSessions(allowMultiple: boolean): Promise<void> {
    await apiClient.put('/sessions/multiple', { allowMultiple });
  }

  /**
   * Get session statistics (Admin only)
   */
  static async getSessionStats(): Promise<SessionStats> {
    const response = await apiClient.get<SessionStats>('/sessions/stats');
    return response.data || {
      totalActiveSessions: 0,
      sessionsByDevice: {},
      sessionsByUser: 0
    };
  }
}
