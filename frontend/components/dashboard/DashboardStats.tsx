'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Bot, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
}

const statCards = [
  {
    key: 'totalCampaigns',
    title: 'Total Campaigns',
    description: 'All time campaigns created',
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-900/20',
  },
  {
    key: 'activeCampaigns',
    title: 'Active Campaigns',
    description: 'Currently running campaigns',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    darkBgColor: 'dark:bg-green-900/20',
  },
  {
    key: 'totalEmailsSent',
    title: 'Emails Sent',
    description: 'Total emails delivered',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-900/20',
  },
  {
    key: 'totalEmailsToday',
    title: 'Sent Today',
    description: 'Emails sent in last 24h',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    darkBgColor: 'dark:bg-orange-900/20',
  },
  {
    key: 'averageOpenRate',
    title: 'Avg Open Rate',
    description: 'Average email open rate',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    darkBgColor: 'dark:bg-indigo-900/20',
  },
  {
    key: 'averageClickRate',
    title: 'Avg Click Rate',
    description: 'Average email click rate',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-900/20',
  },
  {
    key: 'totalBots',
    title: 'Total Bots',
    description: 'Email bots configured',
    icon: Bot,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    darkBgColor: 'dark:bg-cyan-900/20',
  },
  {
    key: 'activeBots',
    title: 'Active Bots',
    description: 'Currently active bots',
    icon: Zap,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    darkBgColor: 'dark:bg-pink-900/20',
  },
];

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) return null;

  const formatValue = (key: string, value: number) => {
    switch (key) {
      case 'averageOpenRate':
      case 'averageClickRate':
        return `${value.toFixed(1)}%`;
      case 'totalEmailsSent':
      case 'totalEmailsToday':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrend = (key: string) => {
    // This would come from the backend in a real implementation
    const trends: Record<string, { value: string; isPositive: boolean }> = {
      totalCampaigns: { value: '+12%', isPositive: true },
      activeCampaigns: { value: '+5%', isPositive: true },
      totalEmailsSent: { value: '+23%', isPositive: true },
      totalEmailsToday: { value: '+8%', isPositive: true },
      averageOpenRate: { value: '+2.1%', isPositive: true },
      averageClickRate: { value: '+1.8%', isPositive: true },
      totalBots: { value: '+3%', isPositive: true },
      activeBots: { value: '+7%', isPositive: true },
    };

    return trends[key] || { value: '0%', isPositive: true };
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const value = stats[card.key as keyof DashboardStatsType] as number;
        const trend = getTrend(card.key);
        const Icon = card.icon;

        return (
          <Card key={card.key} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={cn(
                'p-2 rounded-lg',
                card.bgColor,
                card.darkBgColor
              )}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(card.key, value)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'text-xs',
                    trend.isPositive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {trend.value}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
