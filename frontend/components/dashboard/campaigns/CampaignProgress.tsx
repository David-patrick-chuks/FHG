'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/types';
import { BarChart3 } from 'lucide-react';

interface CampaignProgressProps {
  campaign: Campaign;
  getProgressPercentage: () => number;
}

export function CampaignProgress({ campaign, getProgressPercentage }: CampaignProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Campaign Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {campaign.sentEmails?.length || 0} of {campaign.emailList?.length || 0} emails sent
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {getProgressPercentage()}% complete
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}