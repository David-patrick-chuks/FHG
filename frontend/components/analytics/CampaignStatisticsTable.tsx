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
        <CardTitle className="text-lg sm:text-xl">Campaign Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto table-scrollbar">
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
                <tr key={stats.campaignId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
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

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {campaignStats.map((stats) => (
            <div key={stats.campaignId} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Campaign {stats.campaignId.slice(-8)}
                </h3>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {((stats.openRate ?? 0) * 100).toFixed(1)}% Open Rate
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {((stats.replyRate ?? 0) * 100).toFixed(1)}% Reply Rate
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Sent:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.sent ?? 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Delivered:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.delivered ?? 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Opened:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.opened ?? 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Replied:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.replied ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
