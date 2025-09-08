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
    <div className="space-y-4">
      {paginatedActivities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
