'use client';

import {
    DashboardLoadingSkeleton,
    DashboardStatsCards,
    QuickActions,
    RecentActivity
} from '@/components/dashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardAPI } from '@/lib/api';
import { DashboardStats, RecentActivity as RecentActivityType } from '@/types';
import { Clock, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Check if user is using a remembered session
  const isRememberedSession = typeof window !== 'undefined' && 
    localStorage.getItem('remember_me') === 'true';
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadDataInProgress = useRef(false);

  const loadDashboardData = useCallback(async () => {
    // Prevent duplicate calls
    if (loadDataInProgress.current) {
      return;
    }
    
    try {
      loadDataInProgress.current = true;
      setLoading(true);
      setError(null);

      const [statsResponse, activityResponse] = await Promise.all([
        DashboardAPI.getDashboardStats(),
        DashboardAPI.getRecentActivity()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setDashboardStats(statsResponse.data);
      }

      if (activityResponse.success && activityResponse.data) {
        setRecentActivity(activityResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      loadDataInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  if (loading) {
    return (
      <DashboardLayout
        title={`Welcome back, ${user?.username?.toUpperCase() || 'User'}! 👋`}
        description={
          <div className="flex items-center gap-2">
            <span>Here's what's happening with your email campaigns today.</span>
            {isRememberedSession && (
              <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span>Remembered session</span>
              </div>
            )}
          </div>
        }
        actions={
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
            <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 capitalize">
              {user?.subscription || 'Free'}
            </p>
          </div>
        }
      >
        <DashboardLoadingSkeleton user={user} isRememberedSession={isRememberedSession} />
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
                  onClick={() => window.location.reload()} 
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
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Floating glass elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <DashboardLayout
        title={`Welcome back, ${user?.username || 'User'}! `}
        description={
          <div className="flex items-center gap-2">
            <span>Here's what's happening with your email campaigns today.</span>
            {isRememberedSession && (
              <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span>Remembered session</span>
              </div>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current Plan</p>
              <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 capitalize">
                {user?.subscription || 'Free'}
              </p>
            </div>
            {user?.subscription && user.subscription.toUpperCase() === 'FREE' && (
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            )}
          </div>
        }
      >
        <div className="relative space-y-6">
          <DashboardStatsCards stats={dashboardStats} />
          <QuickActions />
          <RecentActivity activities={recentActivity} />
        </div>
      </DashboardLayout>
    </div>
  );
}

