import { RecentActivity } from '@/types';
import { ActivityItem } from './ActivityItem';

interface ActivityListProps {
  activities: RecentActivity[];
  currentPage: number;
  pageSize: number;
}

export function ActivityList({ activities, currentPage, pageSize }: ActivityListProps) {
  const paginatedActivities = activities.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 transition-all duration-300"></div>
      <div className="relative p-6">
        <div className="space-y-4">
          {paginatedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
