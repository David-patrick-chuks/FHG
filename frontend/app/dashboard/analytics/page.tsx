'use client';

import { AnalyticsPageContent } from '@/components/analytics';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout
      title="Analytics"
      description="Track performance metrics and insights across all your campaigns"
    >
      <AnalyticsPageContent />
    </DashboardLayout>
  );
}
