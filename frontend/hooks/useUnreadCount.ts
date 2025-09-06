import { DashboardAPI } from '@/lib/api/dashboard';
import { useEffect, useRef, useState } from 'react';

// Global state to prevent duplicate requests
let globalUnreadCount = 0;
let isFetching = false;
let fetchPromise: Promise<number> | null = null;

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(globalUnreadCount);
  const mountedRef = useRef(true);

  useEffect(() => {
    const fetchUnreadCount = async (): Promise<number> => {
      // If already fetching, return the existing promise
      if (fetchPromise) {
        return fetchPromise;
      }

      // If already have data and not stale, return cached value
      if (globalUnreadCount >= 0 && !isFetching) {
        return globalUnreadCount;
      }

      isFetching = true;
      fetchPromise = (async () => {
        try {
          const response = await DashboardAPI.getUnreadCount();
          if (response.success && response.data) {
            globalUnreadCount = response.data.unreadCount;
            console.log('Unread count fetched:', globalUnreadCount);
            return globalUnreadCount;
          }
          return 0;
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
          return 0;
        } finally {
          isFetching = false;
          fetchPromise = null;
        }
      })();

      return fetchPromise;
    };

    // Fetch unread count
    fetchUnreadCount().then((count) => {
      if (mountedRef.current) {
        console.log('Setting unread count state:', count);
        setUnreadCount(count);
      }
    });

    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Function to refresh the unread count (useful after marking activities as read)
  const refreshUnreadCount = async () => {
    globalUnreadCount = 0; // Reset cache
    isFetching = false;
    fetchPromise = null;
    
    try {
      const response = await DashboardAPI.getUnreadCount();
      if (response.success && response.data) {
        globalUnreadCount = response.data.unreadCount;
        if (mountedRef.current) {
          setUnreadCount(globalUnreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  };

  return { unreadCount, refreshUnreadCount };
}
