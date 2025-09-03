'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Mail,
  Bot,
  Users,
  Settings,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useGet } from '@/hooks/useApi';
import { RecentActivity as RecentActivityType } from '@/types';
import { cn } from '@/lib/utils';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'campaign_created':
      return Mail;
    case 'email_sent':
      return Activity;
    case 'campaign_completed':
      return TrendingUp;
    case 'bot_activated':
      return Bot;
    default:
      return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'campaign_created':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    case 'email_sent':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    case 'campaign_completed':
      return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    case 'bot_activated':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  }
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

export function RecentActivity() {
  const { data: activities, loading, error } = useGet<RecentActivityType[]>('/dashboard/activity?limit=8');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Failed to load recent activity. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentActivities = activities || [];

  // Mock data for demonstration if no real data
  const mockActivities: RecentActivityType[] = [
    {
      id: '1',
      type: 'campaign_created',
      description: 'New campaign "Summer Sale 2024" created',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      metadata: { campaignName: 'Summer Sale 2024' }
    },
    {
      id: '2',
      type: 'email_sent',
      description: 'Campaign "Welcome Series" sent to 1,250 recipients',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      metadata: { campaignName: 'Welcome Series', recipients: 1250 }
    },
    {
      id: '3',
      type: 'bot_activated',
      description: 'Email bot "SalesBot" activated successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      metadata: { botName: 'SalesBot' }
    },
    {
      id: '4',
      type: 'campaign_completed',
      description: 'Campaign "Product Launch" completed with 23.4% open rate',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      metadata: { campaignName: 'Product Launch', openRate: 23.4 }
    },
    {
      id: '5',
      type: 'email_sent',
      description: 'Follow-up emails sent to 890 subscribers',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      metadata: { campaignName: 'Follow-up Series', recipients: 890 }
    }
  ];

  const displayActivities = recentActivities.length > 0 ? recentActivities : mockActivities;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Activity will appear here as you use the platform
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const activityColor = getActivityColor(activity.type);

              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    activityColor
                  )}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {displayActivities.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View Activity Log
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
