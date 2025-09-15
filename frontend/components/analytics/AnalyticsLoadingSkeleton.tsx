'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-24"></div>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16 mb-2"></div>
              <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Trends Chart Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '400ms' }}>
        <CardHeader className="p-4 sm:p-6">
          <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 sm:w-48"></div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="h-[250px] sm:h-[300px] lg:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 sm:w-32 mx-auto mb-2"></div>
              <div className="h-2.5 sm:h-3 bg-gray-300 dark:bg-gray-600 rounded w-36 sm:w-48 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '500ms' }}>
        <CardHeader className="p-4 sm:p-6">
          <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 sm:w-56"></div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-24 mb-1.5 sm:mb-2"></div>
                    <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20"></div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-10 sm:w-12 mb-1"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Statistics Table Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '600ms' }}>
        <CardHeader className="p-4 sm:p-6">
          <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-40"></div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="text-left py-2 sm:py-3 px-2 sm:px-4">
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 sm:w-12"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
