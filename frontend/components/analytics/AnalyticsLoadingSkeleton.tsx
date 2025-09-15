'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Trends Chart Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Statistics Table Skeleton */}
      <Card className="animate-pulse" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="text-left py-3 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
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
