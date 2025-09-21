'use client';

import { SubscriptionBasedAnalytics } from '@/components/analytics/SubscriptionBasedAnalytics';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout
      title="Analytics"
      description="Track performance metrics and insights across all your campaigns"
    >
      <div className="space-y-4 sm:space-y-6">
        <SubscriptionBasedAnalytics />
      </div>
    </DashboardLayout>
  );
}
