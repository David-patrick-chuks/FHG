'use client';

import { Button } from '@/components/ui/button';
import { RecentActivity as RecentActivityType } from '@/types';
import { getActivityIcon, getActivityIconColor } from '@/utils/activityUtils';
import { Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const router = useRouter();

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recent Activity</h2>
            <p className="text-slate-600 dark:text-slate-300">Latest updates from your campaigns</p>
          </div>
          {activities.length > 5 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/activity')}
              className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 text-cyan-600 hover:text-cyan-700 hover:bg-white/60 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800/60 transition-all duration-300"
            >
              View All
            </Button>
          )}
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const iconColor = getActivityIconColor(activity.type);
              return (
                <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 dark:border-blue-500/30 flex-shrink-0`}>
                      <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base truncate">{activity.title}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between sm:justify-end items-center gap-2 sm:gap-0">
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
