'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function CampaignDetailsLoadingSkeleton() {
  return (
    <DashboardLayout
      title="Campaign Details"
      description="Loading campaign information..."
      actions={
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          {/* Campaign Header Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>

          {/* Campaign Information Skeleton */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Recipients Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
