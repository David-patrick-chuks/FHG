'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PaymentsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Upgrade Banner Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '0ms' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Transactions Card Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
