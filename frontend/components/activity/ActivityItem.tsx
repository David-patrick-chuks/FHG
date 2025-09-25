import { RecentActivity } from '@/types';
import { getActivityIcon, getActivityIconColor } from './ActivityIconUtils';
import { formatTimeAgo } from './ActivityTimeUtils';

interface ActivityItemProps {
  activity: RecentActivity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const IconComponent = getActivityIcon(activity.type);
  const iconColor = getActivityIconColor(activity.type);
  
  return (
    <div className="p-3 sm:p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 dark:border-blue-500/30 flex-shrink-0`}>
            <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base break-words">{activity.title}</p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 break-words">
              {activity.description}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {formatTimeAgo(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
