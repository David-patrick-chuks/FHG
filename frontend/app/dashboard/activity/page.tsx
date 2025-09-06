'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { DashboardAPI } from '@/lib/api';
import { RecentActivity } from '@/types';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Mail,
  Search,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const fetchInProgress = useRef(false);
  const markAllReadInProgress = useRef(false);
  const { refreshUnreadCount } = useUnreadCount();

  // Fetch activity data
  const fetchActivities = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchInProgress.current) {
      return;
    }
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);

      const response = await DashboardAPI.getRecentActivity();

      if (response.success && response.data) {
        setActivities(response.data);
        // For now, we'll simulate pagination since the API might not return pagination info
        setTotalPages(Math.ceil(response.data.length / pageSize));
        setTotalItems(response.data.length);
      } else {
        setError(response.error || 'Failed to fetch activities');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentPage, pageSize]);

  // Mark all activities as read when page loads (only if there are unread activities)
  const markAllAsRead = useCallback(async () => {
    // Prevent duplicate calls
    if (markAllReadInProgress.current) {
      return;
    }

    try {
      markAllReadInProgress.current = true;
      
      // Check if there are any unread activities
      const hasUnreadActivities = activities.some(activity => !activity.isRead);
      
      if (!hasUnreadActivities) {
        console.log('No unread activities to mark as read');
        return;
      }

      await DashboardAPI.markAllAsRead();
      // Update local state to reflect all activities as read
      setActivities(prev => prev.map(activity => ({ ...activity, isRead: true })));
      // Refresh the unread count in the sidebar
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark all activities as read:', error);
    } finally {
      markAllReadInProgress.current = false;
    }
  }, [activities, refreshUnreadCount]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Mark all activities as read when page loads (only after activities are loaded)
  useEffect(() => {
    // Only mark as read if we have activities and they're not all already read
    if (activities.length > 0 && !loading) {
      markAllAsRead();
    }
  }, [activities, loading, markAllAsRead]);

  // Helper function to get icon component based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      // Campaign activities
      case 'campaign_completed':
        return CheckCircle;
      case 'campaign_started':
        return Mail;
      case 'campaign_created':
        return Mail;
      case 'email_sent':
        return Mail;
      
      // Bot activities
      case 'bot_activated':
        return Zap;
      case 'bot_updated':
        return Bot;
      
      // Performance activities
      case 'performance_improved':
        return TrendingUp;
      
      // User activities
      case 'user_registered':
      case 'user_login':
      case 'user_logout':
      case 'user_profile_updated':
      case 'user_password_changed':
        return Activity;
      
      // Email Extractor activities
      case 'email_extraction_started':
      case 'email_extraction_completed':
      case 'email_extraction_single_url':
      case 'email_extraction_multiple_urls':
      case 'email_extraction_csv_upload':
        return Search;
      case 'email_extraction_failed':
      case 'email_extraction_cancelled':
        return XCircle;
      case 'email_extraction_results_downloaded':
        return Download;
      case 'email_extraction_results_viewed':
        return FileText;
      case 'email_extraction_limit_reached':
        return AlertTriangle;
      case 'email_extraction_invalid_url':
        return XCircle;
      case 'email_extraction_rate_limited':
        return AlertTriangle;
      case 'email_extraction_performance_alert':
        return TrendingUp;
      case 'email_extraction_method_used':
        return Search;
      
      default:
        return Activity;
    }
  };

  // Helper function to get icon color based on activity type
  const getActivityIconColor = (type: string) => {
    switch (type) {
      // Campaign activities
      case 'campaign_completed':
        return 'text-green-600';
      case 'campaign_started':
        return 'text-orange-600';
      case 'campaign_created':
        return 'text-blue-600';
      case 'email_sent':
        return 'text-green-600';
      
      // Bot activities
      case 'bot_activated':
        return 'text-blue-600';
      case 'bot_updated':
        return 'text-indigo-600';
      
      // Performance activities
      case 'performance_improved':
        return 'text-purple-600';
      
      // User activities
      case 'user_registered':
        return 'text-green-600';
      case 'user_login':
        return 'text-blue-600';
      case 'user_logout':
        return 'text-gray-600';
      case 'user_profile_updated':
        return 'text-purple-600';
      case 'user_password_changed':
        return 'text-orange-600';
      
      // Email Extractor activities
      case 'email_extraction_started':
      case 'email_extraction_single_url':
      case 'email_extraction_multiple_urls':
      case 'email_extraction_csv_upload':
        return 'text-blue-600';
      case 'email_extraction_completed':
        return 'text-green-600';
      case 'email_extraction_failed':
      case 'email_extraction_cancelled':
      case 'email_extraction_invalid_url':
        return 'text-red-600';
      case 'email_extraction_results_downloaded':
        return 'text-purple-600';
      case 'email_extraction_results_viewed':
        return 'text-indigo-600';
      case 'email_extraction_limit_reached':
      case 'email_extraction_rate_limited':
        return 'text-orange-600';
      case 'email_extraction_performance_alert':
        return 'text-yellow-600';
      case 'email_extraction_method_used':
        return 'text-cyan-600';
      
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Activity"
        description="Recent activity and events across your campaigns and bots"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg animate-pulse">
                    <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                <Button 
                  onClick={() => fetchActivities()} 
                  className="mt-4"
                >
                  Retry
                </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
      </DashboardLayout>
    );
  }

              return (
    <DashboardLayout
      title="Activity"
      description="Recent activity and events across your campaigns and bots"
    >
      <div className="space-y-6">

        {/* Activity Feed */}
        {activities.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No recent activity
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Activity will appear here as you create campaigns, activate bots, and send emails.
                        </p>
                      </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const iconColor = getActivityIconColor(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}>
                          <IconComponent className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                      </div>
                    </div>
              );
            })}
          </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} activities
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const maxVisiblePages = 5;
                  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);
                  
                  return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => {
                    const pageNum = adjustedStartPage + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  });
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
