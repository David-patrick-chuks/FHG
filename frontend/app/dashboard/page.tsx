'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardAPI } from '@/lib/api';
import { DashboardStats, RecentActivity } from '@/types';
import {
  Activity,
  BarChart3,
  Bot,
  Mail,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, activityResponse] = await Promise.all([
          DashboardAPI.getDashboardStats(),
          DashboardAPI.getRecentActivity()
        ]);

        if (statsResponse.success && statsResponse.data) {
          setDashboardStats(statsResponse.data);
        }

        if (activityResponse.success && activityResponse.data) {
          setRecentActivity(activityResponse.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Helper function to get icon component based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_completed':
        return Activity;
      case 'bot_activated':
        return Zap;
      case 'performance_improved':
        return TrendingUp;
      case 'campaign_started':
        return Mail;
      case 'bot_updated':
        return Bot;
      default:
        return Activity;
    }
  };

  // Helper function to get icon color based on activity type
  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'campaign_completed':
        return 'text-blue-600';
      case 'bot_activated':
        return 'text-green-600';
      case 'performance_improved':
        return 'text-purple-600';
      case 'campaign_started':
        return 'text-orange-600';
      case 'bot_updated':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_campaign':
        router.push('/dashboard/campaigns/create');
        break;
      case 'create_bot':
        router.push('/dashboard/bots/create');
        break;
      case 'import_contacts':
        router.push('/dashboard/audience');
        break;
      case 'view_reports':
        router.push('/dashboard/analytics');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.username || 'User'}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Here's what's happening with your email campaigns today.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 capitalize">
                  {user?.subscription || 'Free'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{dashboardStats?.totalBots || 0}</p>
                  <p className="text-blue-100 text-sm">Total Bots</p>
                  <p className="text-blue-200 text-xs mt-1">{dashboardStats?.activeBots || 0} Active</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Bot className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{dashboardStats?.totalCampaigns || 0}</p>
                  <p className="text-purple-100 text-sm">Total Campaigns</p>
                  <p className="text-purple-200 text-xs mt-1">{dashboardStats?.activeCampaigns || 0} Active</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{(dashboardStats?.totalEmailsSent || 0).toLocaleString()}</p>
                  <p className="text-green-100 text-sm">Emails Sent</p>
                  <p className="text-green-200 text-xs mt-1">{dashboardStats?.totalEmailsToday || 0} Today</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div 
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => handleQuickAction('create_campaign')}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Campaign</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Launch a new email campaign</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
              
              <div 
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => handleQuickAction('create_bot')}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Bot</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create a new AI bot</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
              
              <div 
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => handleQuickAction('import_contacts')}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Email Lists</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your email lists</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
              
              <div 
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => handleQuickAction('view_reports')}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyze campaign performance</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 dark:bg-orange-800 rounded-full -translate-y-10 translate-x-10 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your campaigns</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/activity')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const iconColor = getActivityIconColor(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <IconComponent className={`w-5 h-5 ${iconColor}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to show</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
