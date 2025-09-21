'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackingStats } from '@/types';
import { BarChart3 } from 'lucide-react';
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

interface PerformanceTrendsChartProps {
  campaignStats: TrackingStats[];
}

export function PerformanceTrendsChart({ campaignStats }: PerformanceTrendsChartProps) {
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
        openRate: (dayStats?.openRate || 0) * 100,
        replyRate: (dayStats?.replyRate || 0) * 100
      });
    }

    return trends;
  };

  const performanceTrends = generatePerformanceTrends();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Email Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          {performanceTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    fontSize: '12px',
                    padding: '8px',
                    borderRadius: '6px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Performance Data Yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Performance trends will appear here once you start sending campaigns and collecting email data.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
