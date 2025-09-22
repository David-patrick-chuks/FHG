import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingState() {
  return (
    <DashboardLayout
      title="Audience"
      description="Track email delivery and engagement across all your campaigns"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Filters Section Skeleton */}
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 max-w-md"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-48"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-32"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Records Table Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              {/* Desktop Table Skeleton */}
              <div className="hidden lg:block">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Cards Skeleton */}
              <div className="lg:hidden space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-2"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j}>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
