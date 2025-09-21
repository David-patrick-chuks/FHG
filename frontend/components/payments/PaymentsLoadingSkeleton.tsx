'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PaymentsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Upgrade Banner Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '0ms' }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 sm:w-80"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-32"></div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Transactions Card Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters Skeleton */}
          <div className="space-y-4 mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>

          {/* Payment Items Skeleton */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Mobile Layout Skeleton */}
                <div className="flex flex-col sm:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>

                {/* Desktop Layout Skeleton */}
                <div className="hidden sm:flex items-center justify-between">
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
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:hidden space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
