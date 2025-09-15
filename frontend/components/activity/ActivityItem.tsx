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
    <div className="flex items-start space-x-4 p-4 border-b border-cyan-200/50 dark:border-cyan-800/50 last:border-b-0 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 transition-all duration-200 group">
      <div className="relative">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 group-hover:from-cyan-200 group-hover:to-blue-200 dark:group-hover:from-cyan-800/40 dark:group-hover:to-blue-800/40 transition-all duration-200">
          <IconComponent className={`w-5 h-5 ${iconColor}`} />
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200">
            {activity.title}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {formatTimeAgo(activity.timestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
