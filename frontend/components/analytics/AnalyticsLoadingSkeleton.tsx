'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className={`animate-pulse ${i === 0 ? '' : i === 1 ? 'delay-100' : i === 2 ? 'delay-200' : 'delay-300'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20 lg:w-24"></div>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="h-5 sm:h-6 lg:h-8 bg-gray-200 dark:bg-gray-700 rounded w-10 sm:w-12 lg:w-16 mb-1.5 sm:mb-2"></div>
              <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-24 lg:w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Trends Chart Skeleton */}
      <Card className="animate-pulse delay-400">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded w-28 sm:w-36 lg:w-48"></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="h-[200px] sm:h-[250px] lg:h-[300px] xl:h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2 sm:mb-3 lg:mb-4"></div>
              <div className="h-2.5 sm:h-3 lg:h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 sm:w-24 lg:w-32 mx-auto mb-1.5 sm:mb-2"></div>
              <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-300 dark:bg-gray-600 rounded w-28 sm:w-36 lg:w-48 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns Skeleton */}
      <Card className="animate-pulse delay-500">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-40 lg:w-56"></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 lg:p-4 border rounded-lg gap-2.5 sm:gap-3 lg:gap-0">
                <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="h-2.5 sm:h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20 lg:w-24 mb-1 sm:mb-1.5 lg:mb-2"></div>
                    <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16 lg:w-20"></div>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-1 sm:mt-0">
                  <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded w-8 sm:w-10 lg:w-12 mb-0.5 sm:mb-1"></div>
                  <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded w-10 sm:w-12 lg:w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Statistics Table Skeleton */}
      <Card className="animate-pulse delay-600">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-32 lg:w-40"></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          {/* Mobile: Card-based layout */}
          <div className="block sm:hidden space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop: Table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[500px] lg:min-w-[600px]">
              <thead>
                <tr className="border-b">
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="text-left py-2 lg:py-3 px-2 lg:px-4">
                      <div className="h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 lg:w-12 xl:w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-2 lg:py-3 px-2 lg:px-4">
                        <div className="h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded w-6 lg:w-8 xl:w-12"></div>
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
