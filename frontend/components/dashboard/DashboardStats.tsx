'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStats as DashboardStatsType } from '@/types';
import { BarChart3, Bot, Mail } from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  loading?: boolean;
}

export function DashboardStats({ stats, loading = false }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Bots Card Skeleton */}
        <Card className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/30 rounded"></div>
                <div className="h-4 w-20 bg-white/20 rounded"></div>
                <div className="h-3 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Campaigns Card Skeleton */}
        <Card className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/30 rounded"></div>
                <div className="h-4 w-24 bg-white/20 rounded"></div>
                <div className="h-3 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails Sent Card Skeleton */}
        <Card className="relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/30 rounded"></div>
                <div className="h-4 w-20 bg-white/20 rounded"></div>
                <div className="h-3 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-6 h-6 bg-white/30 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Bots Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.totalBots || 0}</p>
              <p className="text-blue-100 text-sm">Total Bots</p>
              <p className="text-blue-200 text-xs mt-1">{stats?.activeBots || 0} Active</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Campaigns Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.totalCampaigns || 0}</p>
              <p className="text-blue-100 text-sm">Total Campaigns</p>
              <p className="text-blue-200 text-xs mt-1">{stats?.activeCampaigns || 0} Active</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emails Sent Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{(stats?.totalEmailsSent || 0).toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Emails Sent</p>
              <p className="text-blue-200 text-xs mt-1">{stats?.totalEmailsToday || 0} Today</p>
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
