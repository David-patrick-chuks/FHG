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
        <CardTitle className="text-lg sm:text-xl">Top Performing Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {trackingSummary.topPerformingCampaigns.map((campaign, index) => (
            <div key={campaign.campaignId} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    Campaign {campaign.campaignId.slice(-4)}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {campaign.totalEmails ?? 0} emails sent
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {((campaign.openRate ?? 0) * 100).toFixed(1)}%
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
