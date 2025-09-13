'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function AnalyticsLoadingSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mt-6"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
