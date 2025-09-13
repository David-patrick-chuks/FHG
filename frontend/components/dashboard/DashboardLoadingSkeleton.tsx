'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardLoadingSkeletonProps {
  user?: { username?: string; subscription?: string } | null;
  isRememberedSession?: boolean;
}

export function DashboardLoadingSkeleton({ user, isRememberedSession }: DashboardLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Bots Card Skeleton */}
        <Card className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-cyan-600 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/30 rounded"></div>
                <div className="h-4 w-20 bg-white/20 rounded"></div>
                <div className="h-3 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Campaigns Card Skeleton */}
        <Card className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/30 rounded"></div>
                <div className="h-4 w-24 bg-white/20 rounded"></div>
                <div className="h-3 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails Sent Card Skeleton */}
        <Card className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-cyan-700 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/30 rounded"></div>
                <div className="h-4 w-20 bg-white/20 rounded"></div>
                <div className="h-3 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Skeleton */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-300 dark:bg-gray-600 rounded-lg">
                      <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded"></div>
                    </div>
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Skeleton */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
