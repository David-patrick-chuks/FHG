import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export function ActivityEmptyState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No recent activity
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Activity will appear here as you create campaigns, activate bots, and send emails.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
