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
    <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {activity.title}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(activity.timestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
