'use client';

import {
    ActivityEmptyState,
    ActivityErrorState,
    ActivityList,
    ActivityLoadingSkeleton,
    ActivityPagination
} from '@/components/activity';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnreadCount } from '@/contexts/UnreadCountContext';
import { DashboardAPI } from '@/lib/api';
import { RecentActivity } from '@/types';
import { Activity } from 'lucide-react';
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


  if (loading) {
    return (
      <DashboardLayout
        title="Activity"
        description="Recent activity and events across your campaigns and bots"
      >
        <ActivityLoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Activity"
        description="Recent activity and events across your campaigns and bots"
      >
        <div className="space-y-6">
          <ActivityErrorState error={error} onRetry={fetchActivities} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Activity
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Recent activity and events across your campaigns and bots
            </p>
          </div>
        </div>
      }
      description=""
    >
      <div className="space-y-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        {activities.length === 0 ? (
          <ActivityEmptyState />
        ) : (
          <>
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      Recent Activity
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Latest updates from your campaigns and bots
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ActivityList 
                  activities={activities}
                  currentPage={currentPage}
                  pageSize={pageSize}
                />
              </CardContent>
            </Card>

            <ActivityPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
