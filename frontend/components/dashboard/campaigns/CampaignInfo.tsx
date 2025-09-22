'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Campaign } from '@/types';
import { Bot as BotIcon, Calendar } from 'lucide-react';

interface CampaignInfoProps {
  campaign: Campaign;
  bot: Bot | null;
  getStatusBadgeVariant: (status: string) => any;
  getStatusColor: (status: string) => string;
  formatDate: (date: Date | string) => string;
}

export function CampaignInfo({
  campaign,
  bot,
  getStatusBadgeVariant,
  getStatusColor,
  formatDate
}: CampaignInfoProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Campaign Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <Badge 
              variant={getStatusBadgeVariant(campaign.status)}
              className={getStatusColor(campaign.status)}
            >
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Created:</span>
            <span className="font-medium">{formatDate(campaign.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
            <span className="font-medium">{formatDate(campaign.updatedAt)}</span>
          </div>
          {campaign.startedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Started:</span>
              <span className="font-medium">{formatDate(campaign.startedAt)}</span>
            </div>
          )}
          {campaign.completedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completed:</span>
              <span className="font-medium">{formatDate(campaign.completedAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bot Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotIcon className="h-5 w-5" />
            Bot Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bot ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bot Name:</span>
                <span className="font-medium">{bot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bot Email:</span>
                <span className="font-medium">{bot.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge 
                  variant={getStatusBadgeVariant(bot.isActive ? 'active' : 'inactive')}
                  className={getStatusColor(bot.isActive ? 'active' : 'inactive')}
                >
                  {bot.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium">{formatDate(bot.createdAt)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Bot information not available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
