'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackingStats } from '@/types';

interface CampaignStatisticsTableProps {
  campaignStats: TrackingStats[];
}

export function CampaignStatisticsTable({ campaignStats }: CampaignStatisticsTableProps) {
  if (campaignStats.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Campaign</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Delivered</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Opened</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Replied</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Open Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Reply Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaignStats.map((stats) => (
                <tr key={stats.campaignId} className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {stats.campaignId.slice(-8)}
                  </td>
                  <td className="py-3 px-4">{stats.sent ?? 0}</td>
                  <td className="py-3 px-4">{stats.delivered ?? 0}</td>
                  <td className="py-3 px-4">{stats.opened ?? 0}</td>
                  <td className="py-3 px-4">{stats.replied ?? 0}</td>
                  <td className="py-3 px-4">{((stats.openRate ?? 0) * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4">{((stats.replyRate ?? 0) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
