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
    <div className="flex items-center space-x-3 p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl">
      <div className={`p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 dark:border-blue-500/30`}>
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{activity.title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {activity.description}
        </p>
      </div>
      <span className="text-sm text-slate-500 dark:text-slate-400">{formatTimeAgo(activity.timestamp)}</span>
    </div>
  );
}
