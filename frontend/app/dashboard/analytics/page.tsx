'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackingAPI } from '@/lib/api';
import { TrackingStats, UserTrackingSummary } from '@/types';
import { BarChart3, Bot, Mail, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function AnalyticsPage() {
  const [trackingSummary, setTrackingSummary] = useState<UserTrackingSummary | null>(null);
  const [campaignStats, setCampaignStats] = useState<TrackingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user tracking summary
      const summaryResponse = await TrackingAPI.getUserTrackingSummary();
      if (summaryResponse.success && summaryResponse.data) {
        setTrackingSummary(summaryResponse.data);

        // Get detailed stats for each campaign
        const statsPromises = summaryResponse.data.topPerformingCampaigns.map(campaign =>
          TrackingAPI.getCampaignTrackingStats(campaign.campaignId)
        );

        const statsResults = await Promise.all(statsPromises);
        const validStats = statsResults
          .filter(result => result.success && result.data)
          .map(result => result.data!);

        setCampaignStats(validStats);
      } else {
        setError(summaryResponse.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Generate performance trends data for the chart
  const generatePerformanceTrends = () => {
    if (!campaignStats.length) return [];

    // Group stats by date (simplified - in real app you'd have actual date data)
    const trends = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const dayStats = campaignStats[i % campaignStats.length];
      trends.push({
        date: days[i],
        emails: dayStats?.sent || 0,
        sent: dayStats?.sent || 0,
        delivered: dayStats?.delivered || 0,
        opened: dayStats?.opened || 0,
        replied: dayStats?.replied || 0,
        bounced: dayStats?.bounced || 0,
        openRate: dayStats?.openRate || 0,
        replyRate: dayStats?.replyRate || 0
      });
    }

    return trends;
  };

  const performanceTrends = generatePerformanceTrends();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mt-6"></div>
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
                <button 
                  onClick={() => fetchAnalyticsData()} 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track performance metrics and insights across all your campaigns
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trackingSummary?.totalEmails.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Opened</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trackingSummary?.totalOpened.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {trackingSummary?.averageOpenRate.toFixed(1) || 0}% average open rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trackingSummary?.totalCampaigns || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active and completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performance</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trackingSummary?.topPerformingCampaigns[0]?.openRate.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Best campaign open rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Email Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="emails" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Emails Sent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Delivered"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="opened" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Opened"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="replied" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    name="Replied"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        {trackingSummary?.topPerformingCampaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingSummary.topPerformingCampaigns.map((campaign, index) => (
                  <div key={campaign.campaignId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Campaign {campaign.campaignId.slice(-4)}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {campaign.totalEmails} emails sent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(campaign.openRate * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Open Rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Campaign Stats */}
        {campaignStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Delivered</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Opened</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Replied</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Open Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Reply Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignStats.map((stats) => (
                      <tr key={stats.campaignId} className="border-b">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {stats.campaignId.slice(-8)}
                        </td>
                        <td className="py-3 px-4">{stats.sent}</td>
                        <td className="py-3 px-4">{stats.delivered}</td>
                        <td className="py-3 px-4">{stats.opened}</td>
                        <td className="py-3 px-4">{stats.replied}</td>
                        <td className="py-3 px-4">{(stats.openRate * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">{(stats.replyRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!trackingSummary && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No analytics data available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Analytics will appear here once you start sending campaigns and collecting tracking data.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}