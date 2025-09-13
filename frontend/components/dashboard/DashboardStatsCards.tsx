'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { BarChart3, Bot, Mail } from 'lucide-react';

interface DashboardStatsCardsProps {
  stats: DashboardStats | null;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Bots Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-cyan-600"></div>
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.totalBots || 0}</p>
              <p className="text-cyan-100 text-sm">Total Bots</p>
              <p className="text-cyan-200 text-xs mt-1">{stats?.activeBots || 0} Active</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Campaigns Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600"></div>
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.totalCampaigns || 0}</p>
              <p className="text-orange-100 text-sm">Total Campaigns</p>
              <p className="text-orange-200 text-xs mt-1">{stats?.activeCampaigns || 0} Active</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emails Sent Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-cyan-700"></div>
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{(stats?.totalEmailsSent || 0).toLocaleString()}</p>
              <p className="text-cyan-100 text-sm">Emails Sent</p>
              <p className="text-cyan-200 text-xs mt-1">{stats?.totalEmailsToday || 0} Today</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
