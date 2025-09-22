'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function TemplatePreviewLoading() {
  return (
    <DashboardLayout
      title="Loading Template..."
      description="Please wait while we load the template details."
    >
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
