'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Mail, Bot, Users } from 'lucide-react';

interface DashboardStatsProps {
  stats: any;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: Mail,
      description: 'Active campaigns',
      color: 'text-blue-600'
    },
    {
      title: 'Emails Sent',
      value: stats?.totalEmailsSent || 0,
      icon: BarChart3,
      description: 'This month',
      color: 'text-green-600'
    },
    {
      title: 'Open Rate',
      value: `${stats?.averageOpenRate || 0}%`,
      icon: Users,
      description: 'Average open rate',
      color: 'text-purple-600'
    },
    {
      title: 'Active Bots',
      value: stats?.activeBots || 0,
      icon: Bot,
      description: 'Running bots',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
