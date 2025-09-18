'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTrackingSummary } from '@/types';
import { BarChart3, Bot, Mail, TrendingUp } from 'lucide-react';

interface AnalyticsMetricsCardsProps {
  trackingSummary: UserTrackingSummary | null;
}

export function AnalyticsMetricsCards({ trackingSummary }: AnalyticsMetricsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(trackingSummary?.totalEmails ?? 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all campaigns
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Opened</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(trackingSummary?.totalOpened ?? 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {(trackingSummary?.averageOpenRate ?? 0).toFixed(1)}% average open rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {trackingSummary?.totalCampaigns ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Active and completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performance</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(trackingSummary?.topPerformingCampaigns?.[0]?.openRate ?? 0).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Best campaign open rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
