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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recipients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaign.emailList.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaign.sentEmails.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getProgressPercentage()}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <BotIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bot</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {bot?.name || 'Unknown Bot'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
