'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function CampaignDetailsLoadingSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800"></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800"></div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
