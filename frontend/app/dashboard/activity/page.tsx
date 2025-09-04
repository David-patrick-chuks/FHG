'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertCircle,
    Bot,
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    TrendingUp,
    Users,
    XCircle,
    Zap
} from 'lucide-react';

export default function ActivityPage() {
  // Simple activity data
  const activities = [
    {
      id: 1,
      message: 'Campaign "Q1 Sales Outreach" completed successfully',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      time: '2 hours ago'
    },
    {
      id: 2,
      message: 'New bot "Customer Support Bot" activated',
      icon: Zap,
      iconColor: 'text-blue-600',
      time: '1 day ago'
    },
    {
      id: 3,
      message: 'Open rate improved by 18% across all campaigns',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      time: '3 days ago'
    },
    {
      id: 4,
      message: 'Campaign "Product Launch" started',
      icon: Mail,
      iconColor: 'text-orange-600',
      time: '5 days ago'
    },
    {
      id: 5,
      message: 'Bot "Newsletter Bot" updated with new templates',
      icon: Bot,
      iconColor: 'text-indigo-600',
      time: '1 week ago'
    },
    {
      id: 6,
      message: 'Campaign "Holiday Special" failed to send',
      icon: XCircle,
      iconColor: 'text-red-600',
      time: '1 week ago'
    },
    {
      id: 7,
      message: '500 new contacts imported from CSV file',
      icon: Users,
      iconColor: 'text-cyan-600',
      time: '2 weeks ago'
    },
    {
      id: 8,
      message: 'New bot "Lead Nurturing Bot" created',
      icon: Bot,
      iconColor: 'text-emerald-600',
      time: '2 weeks ago'
    },
    {
      id: 9,
      message: 'Bounce rate exceeded threshold for Newsletter Weekly',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      time: '3 weeks ago'
    },
    {
      id: 10,
      message: 'Campaign "Black Friday Sale" scheduled',
      icon: Calendar,
      iconColor: 'text-pink-600',
      time: '1 month ago'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all activities and events across your email campaigns
          </p>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                      <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {activity.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
