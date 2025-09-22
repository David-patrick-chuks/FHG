'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EmailExtractorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Subscription Limits Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 bg-muted" />
              <Skeleton className="h-5 w-32 bg-muted" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48 bg-muted" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-16 bg-muted" />
                <Skeleton className="h-4 w-8 bg-muted" />
              </div>
              <Skeleton className="h-2 w-full bg-muted" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-20 bg-muted" />
              <Skeleton className="h-4 w-16 bg-muted" />
            </div>
            <Skeleton className="h-3 w-32 bg-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 bg-muted" />
              <Skeleton className="h-5 w-40 bg-muted" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-56 bg-muted" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-6 w-16 bg-muted" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-6 w-20 bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48 bg-muted" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64 bg-muted" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs Skeleton */}
          <div className="grid w-full grid-cols-3 gap-2">
            <Skeleton className="h-10 w-full bg-muted" />
            <Skeleton className="h-10 w-full bg-muted" />
            <Skeleton className="h-10 w-full bg-muted" />
          </div>

          {/* Tab Content Skeleton */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
              <Skeleton className="h-3 w-64 mt-1 bg-muted" />
            </div>
            <Skeleton className="h-10 w-full bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Extractions Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40 bg-muted" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48 bg-muted" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 bg-muted" />
                    <Skeleton className="h-5 w-20 bg-muted" />
                    <Skeleton className="h-5 w-16 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-48 bg-muted" />
                  <Skeleton className="h-3 w-32 bg-muted" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 bg-muted" />
                  <Skeleton className="h-8 w-8 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
