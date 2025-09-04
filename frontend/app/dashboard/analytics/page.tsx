'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Bot, Mail, TrendingUp, Users } from 'lucide-react';
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
  // Mock data for now - will be replaced with API calls later
  const mockStats = {
    totalEmails: 2847,
    totalBots: 4,
    totalCampaigns: 20,
    bounceRate: 2.1,
    sentEmails: 546
  };

  // Email performance trends over time (last 7 days) with bot information
  const performanceTrends = [
    { 
      date: 'Jan 15', 
      emails: 156, 
      sent: 156, 
      delivered: 153, 
      bounced: 3,
      bot: 'SalesBot Pro',
      botEmails: 89
    },
    { 
      date: 'Jan 16', 
      emails: 0, 
      sent: 0, 
      delivered: 0, 
      bounced: 0,
      bot: 'MarketingBot',
      botEmails: 0
    },
    { 
      date: 'Jan 17', 
      emails: 0, 
      sent: 0, 
      delivered: 0, 
      bounced: 0,
      bot: 'SupportBot',
      botEmails: 0
    },
    { 
      date: 'Jan 18', 
      emails: 0, 
      sent: 0, 
      delivered: 0, 
      bounced: 0,
      bot: 'NewsletterBot',
      botEmails: 0
    },
    { 
      date: 'Jan 19', 
      emails: 15, 
      sent: 15, 
      delivered: 15, 
      bounced: 0,
      bot: 'SalesBot Pro',
      botEmails: 15
    },
    { 
      date: 'Jan 20', 
      emails: 0, 
      sent: 0, 
      delivered: 0, 
      bounced: 0,
      bot: 'MarketingBot',
      botEmails: 0
    },
    { 
      date: 'Jan 21', 
      emails: 0, 
      sent: 0, 
      delivered: 0, 
      bounced: 0,
      bot: 'SupportBot',
      botEmails: 0
    },
  ];


  return (
    <DashboardLayout
      title="Analytics"
      description="Track your email campaign performance and insights"
    >
    

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Emails</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{mockStats.totalEmails.toLocaleString()}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-300">+12% from last week</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Bots</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{mockStats.totalBots}</p>
                  <p className="text-xs text-green-500 dark:text-green-300">Active & Ready</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Campaigns</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{mockStats.totalCampaigns}</p>
                  <p className="text-xs text-purple-500 dark:text-purple-300">+3 this week</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Bounce Rate</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">{mockStats.bounceRate}%</p>
                  <p className="text-xs text-red-500 dark:text-red-300">-0.3% improved</p>
                </div>
                <div className="p-3 bg-red-500 rounded-full shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 dark:bg-red-800 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Sent Emails</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{mockStats.sentEmails.toLocaleString()}</p>
                  <p className="text-xs text-orange-500 dark:text-orange-300">Today's total</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 dark:bg-orange-800 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
            </CardContent>
          </Card>
        </div>

        {/* Email Performance Trends - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Email Delivery Performance (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceTrends}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-gray-600 dark:text-gray-400"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    className="text-xs text-gray-600 dark:text-gray-400"
                    axisLine={false}
                    tickLine={false}
                  />
                                    <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      value, 
                      name === 'emails' ? 'Total Emails' : 
                      name === 'sent' ? 'Sent' : 
                      name === 'delivered' ? 'Delivered' : 'Bounced'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="emails" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    name="Total Emails"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    name="Sent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    name="Delivered"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bounced" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                    name="Bounced"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Bot Activity Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Active Bots This Week</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceTrends
                  .filter(day => day.botEmails > 0)
                  .reduce((unique, day) => {
                    if (!unique.find(bot => bot.name === day.bot)) {
                      unique.push({
                        name: day.bot,
                        totalEmails: performanceTrends
                          .filter(d => d.bot === day.bot)
                          .reduce((sum, d) => sum + d.botEmails, 0)
                      });
                    }
                    return unique;
                  }, [] as { name: string; totalEmails: number }[])
                  .map((bot, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bot.name}</p>
                        <p className="text-xs text-gray-500">{bot.totalEmails} emails</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
