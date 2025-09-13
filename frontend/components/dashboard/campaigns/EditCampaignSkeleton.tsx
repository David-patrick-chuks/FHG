'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function EditCampaignSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          
          {/* Main card skeleton */}
          <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            {/* Card header skeleton */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            
            {/* Form skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email list skeleton */}
            <div className="mt-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2"></div>
            </div>
            
            {/* Bot info skeleton */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            
            {/* Submit button skeleton */}
            <div className="flex justify-end mt-6">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
