'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { BarChart3, Bot, Mail } from 'lucide-react';

interface DashboardStatsCardsProps {
  stats: DashboardStats | null;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Bots Card */}
      <div className="group relative">
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalBots || 0}</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Total Bots</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{stats?.activeBots || 0} Active</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Total Campaigns Card */}
      <div className="group relative">
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalCampaigns || 0}</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Total Campaigns</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{stats?.activeCampaigns || 0} Active</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Emails Sent Card */}
      <div className="group relative">
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{(stats?.totalEmailsSent || 0).toLocaleString()}</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Emails Sent</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{stats?.totalEmailsToday || 0} Today</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
