'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Mail, Bot, Users } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'campaign_created',
      description: 'Campaign "Welcome Series" created',
      timestamp: '2 hours ago',
      icon: Mail,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'email_sent',
      description: 'Email sent to 150 recipients',
      timestamp: '4 hours ago',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'bot_activated',
      description: 'Sales Bot activated',
      timestamp: '6 hours ago',
      icon: Bot,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'campaign_completed',
      description: 'Newsletter campaign completed',
      timestamp: '1 day ago',
      icon: Mail,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`mt-1 p-1 rounded-full bg-gray-100 ${activity.color}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
