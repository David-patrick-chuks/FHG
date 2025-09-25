'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Session, SessionAPI } from '@/lib/api/session';
import {
    AlertTriangle,
    Clock,
    MapPin,
    Monitor,
    Shield,
    Smartphone,
    Tablet,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SessionManagerProps {
  className?: string;
}

export function SessionManager({ className }: SessionManagerProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [allowMultipleSessions, setAllowMultipleSessions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load sessions and settings
  useEffect(() => {
    loadData();
  }, [user?.allowMultipleSessions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sessionsResponse = await SessionAPI.getSessions();
      
      setSessions(sessionsResponse.sessions);
      setCurrentSessionId(sessionsResponse.currentSessionId);
      
      // Get the user's allowMultipleSessions setting from the user context
      if (user?.allowMultipleSessions !== undefined) {
        setAllowMultipleSessions(user.allowMultipleSessions);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
      toast.error('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidateSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId);
      await SessionAPI.invalidateSession(sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      toast.success('Session invalidated successfully');
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      toast.error('Failed to invalidate session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInvalidateAllOthers = async () => {
    try {
      setActionLoading('all-others');
      await SessionAPI.invalidateAllOtherSessions();
      // Keep only the current session (we can't easily identify which one is current from the API)
      // So we'll reload the data
      await loadData();
      toast.success('All other sessions invalidated');
    } catch (error) {
      console.error('Failed to invalidate other sessions:', error);
      toast.error('Failed to invalidate other sessions');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleMultipleSessions = async (checked: boolean) => {
    try {
      setActionLoading('toggle-multiple');
      await SessionAPI.toggleMultipleSessions(checked);
      setAllowMultipleSessions(checked);
      toast.success(`Multiple sessions ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update session settings:', error);
      toast.error('Failed to update session settings');
    } finally {
      setActionLoading(null);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceTypeColor = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'tablet':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'desktop':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Manage your active sessions and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Manage your active sessions and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multiple Sessions Setting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-medium">Allow Multiple Sessions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When disabled, signing in on a new device will log you out of all other devices
              </p>
            </div>
            <div className="flex-shrink-0">
              <Switch
                checked={allowMultipleSessions}
                onCheckedChange={handleToggleMultipleSessions}
                disabled={actionLoading === 'toggle-multiple'}
              />
            </div>
          </div>

          {/* Warning for single session mode */}
          {!allowMultipleSessions && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Single session mode is enabled. You will be logged out of other devices when you sign in elsewhere.
              </AlertDescription>
            </Alert>
          )}

          {/* Active Sessions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="font-medium">Active Sessions ({sessions.length})</h4>
              {sessions.length > 1 && currentSessionId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInvalidateAllOthers}
                  disabled={actionLoading === 'all-others'}
                  className="w-full sm:w-auto"
                >
                  {actionLoading === 'all-others' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">End All Other Sessions</span>
                  <span className="sm:hidden">End All Others</span>
                </Button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active sessions found
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const isCurrentSession = session.sessionId === currentSessionId;
                  return (
                    <div
                      key={session.sessionId}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                            {getDeviceIcon(session.deviceInfo.deviceType)}
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={getDeviceTypeColor(session.deviceInfo.deviceType)}
                              >
                                {session.deviceInfo.deviceType || 'Unknown'}
                              </Badge>
                              {isCurrentSession && (
                                <Badge 
                                  variant="default" 
                                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                >
                                  Current Session
                                </Badge>
                              )}
                              {session.deviceInfo.ipAddress && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{session.deviceInfo.ipAddress}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>Last active: {getRelativeTime(session.lastAccessedAt)}</span>
                              </div>
                              <div className="truncate">
                                Created: {formatDate(session.createdAt)}
                              </div>
                            </div>
                            {session.deviceInfo.userAgent && (
                              <div className="text-xs text-gray-400 break-all sm:break-normal">
                                <span className="hidden sm:inline">{session.deviceInfo.userAgent}</span>
                                <span className="sm:hidden">
                                  {session.deviceInfo.userAgent.length > 50 
                                    ? `${session.deviceInfo.userAgent.substring(0, 50)}...` 
                                    : session.deviceInfo.userAgent}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInvalidateSession(session.sessionId)}
                            disabled={actionLoading === session.sessionId || isCurrentSession}
                            title={isCurrentSession ? "Cannot delete current session" : "Delete session"}
                            className="w-full sm:w-auto"
                          >
                            {actionLoading === session.sessionId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
