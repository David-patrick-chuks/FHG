'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Eye, Mail, MousePointer, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for now - will be replaced with API calls later
  const mockStats = {
    totalEmails: 15420,
    openRate: 23.4,
    clickRate: 4.2,
    bounceRate: 2.1,
    unsubscribeRate: 0.8,
    conversionRate: 1.2
  };

  const mockTrends = [
    { date: 'Jan 1', emails: 1200, opens: 280, clicks: 45 },
    { date: 'Jan 2', emails: 1350, opens: 320, clicks: 52 },
    { date: 'Jan 3', emails: 1100, opens: 260, clicks: 38 },
    { date: 'Jan 4', emails: 1400, opens: 330, clicks: 58 },
    { date: 'Jan 5', emails: 1250, opens: 290, clicks: 48 },
    { date: 'Jan 6', emails: 1300, opens: 310, clicks: 55 },
    { date: 'Jan 7', emails: 1450, opens: 340, clicks: 62 },
  ];

  const mockTopCampaigns = [
    { name: 'Welcome Series', emails: 2500, openRate: 28.5, clickRate: 5.2 },
    { name: 'Product Launch', emails: 1800, openRate: 25.1, clickRate: 4.8 },
    { name: 'Newsletter', emails: 3200, openRate: 22.3, clickRate: 3.9 },
    { name: 'Promotional', emails: 1500, openRate: 19.8, clickRate: 3.2 },
  ];

  return (
    <DashboardLayout
      title="Analytics"
      description="Track your email campaign performance and insights"
      actions={
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalEmails.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Emails Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.openRate}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Open Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <MousePointer className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.clickRate}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.conversionRate}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Email performance over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Date</span>
                <div className="flex gap-8">
                  <span>Emails Sent</span>
                  <span>Opens</span>
                  <span>Clicks</span>
                </div>
              </div>
              
              {mockTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium">{trend.date}</span>
                  <div className="flex gap-8">
                    <span>{trend.emails.toLocaleString()}</span>
                    <span>{trend.opens.toLocaleString()}</span>
                    <span>{trend.clicks.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
            <CardDescription>
              Your best performing email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {campaign.emails.toLocaleString()} emails sent
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Open Rate</p>
                      <p className="font-medium text-green-600">{campaign.openRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click Rate</p>
                      <p className="font-medium text-blue-600">{campaign.clickRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Breakdown</CardTitle>
              <CardDescription>Detailed engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Bounce Rate</span>
                <Badge variant="destructive">{mockStats.bounceRate}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Unsubscribe Rate</span>
                <Badge variant="secondary">{mockStats.unsubscribeRate}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Spam Complaints</span>
                <Badge variant="outline">0.1%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>Your audience behavior patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Most Active Time</span>
                <span className="font-medium">9:00 AM - 11:00 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Most Active Day</span>
                <span className="font-medium">Tuesday</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Device Preference</span>
                <span className="font-medium">Mobile (65%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
