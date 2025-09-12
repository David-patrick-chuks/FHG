import { DashboardAPI } from '@/lib/api/dashboard';
import { useEffect, useState } from 'react';

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
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
  }, []);

  // Function to refresh the unread count (useful after marking activities as read)
  const refreshUnreadCount = async () => {
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
