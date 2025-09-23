'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AdminActivityStats, AdminAPI, PlatformStats, SubscriptionStats, SystemActivityStats } from '@/lib/api/admin';
import {
    Activity,
    BarChart3,
    Bot,
    CreditCard,
    Crown,
    DollarSign,
    FileText,
    Loader2,
    Mail,
    PieChart,
    RefreshCw,
    Shield,
    Users,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
        AdminAPI.getGeneralAdminActivityStats(),
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

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₦0';
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(platformStats.totalSubscriptions)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(platformStats.activeSubscriptions)} active
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Statistics */}
        {platformStats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(platformStats.revenueStats.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(platformStats.revenueStats.subscriptionCount)} subscriptions
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(platformStats.revenueStats.averageRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      per subscription
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Basic Tier Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(platformStats.revenueStats.revenueByTier.basic)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Basic subscriptions
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Tier Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(platformStats.revenueStats.revenueByTier.premium)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Premium subscriptions
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

        {/* Revenue Breakdown Chart */}
        {platformStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Revenue Breakdown by Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white">Free</span>
                  </div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {formatCurrency(platformStats.revenueStats.revenueByTier.free)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white">Basic</span>
                  </div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {formatCurrency(platformStats.revenueStats.revenueByTier.basic)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 dark:text-white">Premium</span>
                  </div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {formatCurrency(platformStats.revenueStats.revenueByTier.premium)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Activity Statistics */}
        {systemActivityStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(systemActivityStats.totalActivities)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(systemActivityStats.activitiesByType.SYSTEM_ERROR || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System Errors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(systemActivityStats.activitiesByType.SECURITY_LOGIN_FAILED || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Security Events</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(systemActivityStats.activitiesByType).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activity Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/admin/templates')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Template Approvals</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Review community templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Activity Statistics */}
        {adminActivityStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(adminActivityStats.totalActions)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Actions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(adminActivityStats.actionsByType).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Action Types</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(adminActivityStats.actionsByAdmin).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Admins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(adminActivityStats.recentActions?.length || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recent Actions</p>
                </div>
              </div>

              {/* Action Types Breakdown */}
              {Object.keys(adminActivityStats.actionsByType).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Actions by Type</h4>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(adminActivityStats.actionsByType).map(([actionType, count]) => (
                      <div key={actionType} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {actionType.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {formatNumber(count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Actions */}
              {adminActivityStats.recentActions && adminActivityStats.recentActions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Recent Actions</h4>
                  <div className="space-y-3">
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
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
