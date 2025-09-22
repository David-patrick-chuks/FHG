'use client';

interface DashboardLoadingSkeletonProps {
  user?: { username?: string; subscription?: string } | null;
  isRememberedSession?: boolean;
}

export function DashboardLoadingSkeleton({ user, isRememberedSession }: DashboardLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Bots Card Skeleton */}
        <div className="group relative animate-pulse">
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Campaigns Card Skeleton */}
        <div className="group relative animate-pulse">
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Emails Sent Card Skeleton */}
        <div className="group relative animate-pulse">
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl shadow-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="group relative animate-pulse">
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
        <div className="relative p-6">
          <div className="mb-6">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg">
                      <div className="w-6 h-6 bg-white/30 rounded"></div>
                    </div>
                    <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-full -translate-y-10 translate-x-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="group relative animate-pulse">
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border border-white/30 dark:border-slate-700/30 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm">
                <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}