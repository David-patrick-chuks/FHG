'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function AnalyticsEmptyState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No analytics data available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics will appear here once you start sending campaigns and collecting tracking data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
