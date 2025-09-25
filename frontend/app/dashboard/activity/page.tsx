'use client';

import {
    ActivityEmptyState,
    ActivityErrorState,
    ActivityList,
    ActivityLoadingSkeleton,
    ActivityPagination
} from '@/components/activity';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUnreadCount } from '@/contexts/UnreadCountContext';
import { DashboardAPI } from '@/lib/api';
import { RecentActivity } from '@/types';
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
      title="Activity"
      description="Recent activity and events across your campaigns and bots"
    >
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-hidden">
        {activities.length === 0 ? (
          <ActivityEmptyState />
        ) : (
          <>
            <ActivityList 
              activities={activities}
              currentPage={currentPage}
              pageSize={pageSize}
            />

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
