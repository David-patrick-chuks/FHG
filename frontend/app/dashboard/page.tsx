'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CampaignOverview } from '@/components/dashboard/CampaignOverview';
import { BotStatus } from '@/components/dashboard/BotStatus';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useAuth } from '@/contexts/AuthContext';
import { useGet } from '@/hooks/useApi';
import { DashboardStats as DashboardStatsType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { data: stats, loading: statsLoading, error: statsError } = useGet<DashboardStatsType>('/dashboard/stats');

  if (statsLoading) {
    return (
      <DashboardLayout title="Dashboard" description="Your email marketing overview">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (statsError) {
    return (
      <DashboardLayout title="Dashboard" description="Your email marketing overview">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Failed to load dashboard data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Your email marketing overview and performance metrics"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.username}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Here's what's happening with your email campaigns today.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 capitalize">
                  {user?.subscription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campaign Overview */}
          <div className="lg:col-span-2">
            <CampaignOverview />
          </div>

          {/* Bot Status */}
          <div>
            <BotStatus />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}
