import { DashboardAPI } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      // Don't fetch if user is not authenticated or auth is still loading
      if (!isAuthenticated || authLoading) {
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching unread count...');
        setIsLoading(true);
        const response = await DashboardAPI.getUnreadCount();
        console.log('Unread count response:', response);
        
        if (response.success && response.data) {
          const count = response.data.unreadCount;
          console.log('Unread count fetched:', count);
          console.log('Setting unread count to:', count);
          setUnreadCount(count);
        } else {
          console.error('Failed to fetch unread count:', response.message);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();
  }, [isAuthenticated, authLoading]);

  // Function to refresh the unread count (useful after marking activities as read)
  const refreshUnreadCount = async () => {
    // Don't refresh if user is not authenticated
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      console.log('Refreshing unread count...');
      const response = await DashboardAPI.getUnreadCount();
      if (response.success && response.data) {
        const count = response.data.unreadCount;
        console.log('Unread count refreshed:', count);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  };

  return { unreadCount, refreshUnreadCount, isLoading };
}
