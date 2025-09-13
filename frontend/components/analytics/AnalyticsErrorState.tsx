'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AnalyticsErrorState({ error, onRetry }: AnalyticsErrorStateProps) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
              <button 
                onClick={onRetry} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
