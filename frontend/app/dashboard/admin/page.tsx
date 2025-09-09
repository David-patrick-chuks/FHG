'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminAPI, PlatformStats, SubscriptionStats, AdminActivityStats, SystemActivityStats } from '@/lib/api/admin';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Bot, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Shield,
  Crown,
  Zap,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [adminActivityStats, setAdminActivityStats] = useState<AdminActivityStats | null>(null);
  const [systemActivityStats, setSystemActivityStats] = useState<SystemActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [platformResponse, subscriptionResponse, adminActivityResponse, systemActivityResponse] = await Promise.all([
        AdminAPI.getPlatformStats(),
        AdminAPI.getSubscriptionStats(),
        AdminAPI.getAdminActivityStats(),
        AdminAPI.getSystemActivityStats()
      ]);

      if (platformResponse.success && platformResponse.data) {
        setPlatformStats(platformResponse.data);
      }

      if (subscriptionResponse.success && subscriptionResponse.data) {
        setSubscriptionStats(subscriptionResponse.data);
      }

      if (adminActivityResponse.success && adminActivityResponse.data) {
        setAdminActivityStats(adminActivityResponse.data);
      }

      if (systemActivityResponse.success && systemActivityResponse.data) {
        setSystemActivityStats(systemActivityResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        description="Platform overview and management"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Platform overview and management"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/admin/users')}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Platform Statistics */}
        {platformStats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(platformStats.totalUsers)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(platformStats.activeUsers)} active
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bots</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(platformStats.totalBots)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(platformStats.activeBots)} active
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Bot className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(platformStats.totalCampaigns)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(platformStats.activeCampaigns)} active
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emails Sent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(platformStats.totalEmailsSent)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(platformStats.emailsSentToday)} today
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Statistics */}
        {subscriptionStats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(subscriptionStats.revenue.total)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(subscriptionStats.revenue.monthly)} monthly
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Free Users</p>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {formatNumber(subscriptionStats.freeUsers)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round((subscriptionStats.freeUsers / subscriptionStats.totalSubscriptions) * 100)}% of total
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pro Users</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber(subscriptionStats.proUsers)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round((subscriptionStats.proUsers / subscriptionStats.totalSubscriptions) * 100)}% of total
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enterprise Users</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(subscriptionStats.enterpriseUsers)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round((subscriptionStats.enterpriseUsers / subscriptionStats.totalSubscriptions) * 100)}% of total
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/admin/users')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage users and subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/admin/payments')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Payment Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View payment transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/admin/activity')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Activity Logs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor system activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {adminActivityStats && adminActivityStats.recentActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminActivityStats.recentActions.slice(0, 5).map((action) => (
                  <div
                    key={action._id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {action.action.replace(/_/g, ' ').toLowerCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.targetType}: {action.targetId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(action.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {action.adminId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
