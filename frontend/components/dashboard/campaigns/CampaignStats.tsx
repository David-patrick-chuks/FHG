'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bot, Campaign } from '@/types';
import { BarChart3, Bot as BotIcon, Mail, Users } from 'lucide-react';

interface CampaignStatsProps {
  campaign: Campaign;
  bot: Bot | null;
  getProgressPercentage: () => number;
}

export function CampaignStats({ campaign, bot, getProgressPercentage }: CampaignStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Recipients</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {campaign.emailList?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Emails Sent</p>
              <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                {campaign.sentEmails?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Progress</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {getProgressPercentage()}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 border-cyan-200 dark:border-cyan-800">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <BotIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Bot</p>
              <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">
                {bot?.name || 'Unknown Bot'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
