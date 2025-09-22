'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardAPI } from '@/lib/api/dashboard';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UnreadCountContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
}

const UnreadCountContext = createContext<UnreadCountContextType | undefined>(undefined);

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  useEffect(() => {
    fetchUnreadCount();
  }, [isAuthenticated, authLoading]);

  const value = {
    unreadCount,
    refreshUnreadCount,
    isLoading
  };

  return (
    <UnreadCountContext.Provider value={value}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  const context = useContext(UnreadCountContext);
  if (context === undefined) {
    throw new Error('useUnreadCount must be used within an UnreadCountProvider');
  }
  return context;
}
