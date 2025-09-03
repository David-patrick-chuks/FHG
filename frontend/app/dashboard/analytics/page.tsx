'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Bot, Mail, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AnalyticsPage() {
  // Mock data for now - will be replaced with API calls later
  const mockStats = {
    totalEmails: 2847,
    totalBots: 4,
    totalCampaigns: 4
  };

  // Campaign data showing emails sent per campaign
  const campaignData = [
    { name: 'Q1 Sales Outreach', emails: 156, bot: 'Sales Bot' },
    { name: 'Customer Onboarding', emails: 89, bot: 'Onboarding Bot' },
    { name: 'Product Launch', emails: 234, bot: 'Marketing Bot' },
    { name: 'Holiday Special', emails: 67, bot: 'Promo Bot' },
  ];

  // Bot data showing total emails sent by each bot
  const botData = [
    { name: 'Sales Bot', emails: 156, color: '#3b82f6' },
    { name: 'Onboarding Bot', emails: 89, color: '#10b981' },
    { name: 'Marketing Bot', emails: 234, color: '#8b5cf6' },
    { name: 'Promo Bot', emails: 67, color: '#f59e0b' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <DashboardLayout
      title="Analytics"
      description="Track your email campaign performance and insights"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
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
                <Bot className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalBots}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Bots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalCampaigns}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Campaign Performance by Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs text-gray-600 dark:text-gray-400"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151'
                    }}
                    formatter={(value, name) => [value, 'Emails Sent']}
                    labelFormatter={(label) => `Campaign: ${label}`}
                  />
                  <Bar 
                    dataKey="emails" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bot Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Bot Performance by Total Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={botData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, emails }) => `${name}: ${emails}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="emails"
                  >
                    {botData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151'
                    }}
                    formatter={(value, name) => [value, 'Emails Sent']}
                    labelFormatter={(label) => `Bot: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Bot Chart Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
              {botData.map((bot, index) => (
                <div key={bot.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-600 dark:text-gray-400">{bot.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
