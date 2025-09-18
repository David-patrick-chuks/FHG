'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTrackingSummary } from '@/types';

interface TopPerformingCampaignsProps {
  trackingSummary: UserTrackingSummary | null;
}

export function TopPerformingCampaigns({ trackingSummary }: TopPerformingCampaignsProps) {
  if (!trackingSummary?.topPerformingCampaigns || trackingSummary.topPerformingCampaigns.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trackingSummary.topPerformingCampaigns.map((campaign, index) => (
            <div key={campaign.campaignId} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Campaign {campaign.campaignId.slice(-4)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {campaign.totalEmails ?? 0} emails sent
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {((campaign.openRate ?? 0) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Open Rate
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
