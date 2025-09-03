'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useGet } from '@/hooks/useApi';
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
  
  // Fetch dashboard data
  const { data: statsResponse, loading: statsLoading, error: statsError } = useGet('/api/dashboard/stats');
  const stats = statsResponse?.data;
  
  // Debug logging
  console.log('Dashboard stats response:', statsResponse);
  console.log('Dashboard stats data:', stats);
  console.log('User data:', user);

  if (statsLoading) {
    return (
      <DashboardLayout title="Dashboard" description="Your email marketing overview">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  Welcome back, {user?.username}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Here's what's happening with your email campaigns today.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 capitalize">
                  {user?.subscription}
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
                    {stats?.totalCampaigns || 0}
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
                    {stats?.totalBots || 0}
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
                     {stats?.activeCampaigns || 0}
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
                    {stats?.totalEmailsSent || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent</p>
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
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Mail className="w-6 h-6" />
                <span>Create Campaign</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Bot className="w-6 h-6" />
                <span>Add Bot</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="w-6 h-6" />
                <span>Import Contacts</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
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
            {statsError ? (
              <div className="text-center text-red-600 py-8">
                <p>Failed to load recent activity. Please try again later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Campaign "Welcome Series" completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sent 1,247 emails successfully
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">New bot "Sales Assistant" activated</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ready to handle sales inquiries
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium">Open rate improved by 15%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Campaign performance trending up
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
