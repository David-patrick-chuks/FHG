'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Bot,
  Mail,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Dummy dashboard data
  const dashboardStats = {
    totalCampaigns: 4,
    totalBots: 4,
    activeCampaigns: 2,
    totalEmailsSent: 2847,
    totalRecipients: 156,
    averageOpenRate: 68,
    averageClickRate: 14,
    totalReplies: 23
  };

  // Dummy recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'campaign_completed',
      title: 'Campaign "Q1 Sales Outreach" completed',
      description: 'Sent 156 emails successfully with 23% open rate',
      icon: Activity,
      iconColor: 'text-blue-600',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'bot_activated',
      title: 'New bot "Customer Support Bot" activated',
      description: 'Ready to handle customer inquiries and support tickets',
      icon: Zap,
      iconColor: 'text-green-600',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'performance_improved',
      title: 'Open rate improved by 18%',
      description: 'Campaign performance trending up across all segments',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      time: '3 days ago'
    },
    {
      id: 4,
      type: 'campaign_started',
      title: 'Campaign "Product Launch" started',
      description: 'AI-generated content ready and campaign launched',
      icon: Mail,
      iconColor: 'text-orange-600',
      time: '5 days ago'
    },
    {
      id: 5,
      type: 'bot_updated',
      title: 'Bot "Newsletter Bot" updated',
      description: 'New AI prompts and email templates added',
      icon: Bot,
      iconColor: 'text-indigo-600',
      time: '1 week ago'
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_campaign':
        router.push('/dashboard/campaigns/create');
        break;
      case 'add_bot':
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

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalCampaigns}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalBots}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Bots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.activeCampaigns}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalEmailsSent.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalRecipients}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Recipients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.averageOpenRate}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Open Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.averageClickRate}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Click Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalReplies}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Replies</p>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => handleQuickAction('create_campaign')}
              >
                <Mail className="w-6 h-6" />
                <span>Create Campaign</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => handleQuickAction('add_bot')}
              >
                <Bot className="w-6 h-6" />
                <span>Add Bot</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => handleQuickAction('import_contacts')}
              >
                <Users className="w-6 h-6" />
                <span>Import Contacts</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => handleQuickAction('view_reports')}
              >
                <BarChart3 className="w-6 h-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
