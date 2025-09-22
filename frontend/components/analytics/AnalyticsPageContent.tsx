'use client';

import { TrackingAPI } from '@/lib/api';
import { TrackingStats, UserTrackingSummary } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { AnalyticsErrorState } from './AnalyticsErrorState';
import { AnalyticsLoadingSkeleton } from './AnalyticsLoadingSkeleton';
import { AnalyticsMetricsCards } from './AnalyticsMetricsCards';
import { CampaignStatisticsTable } from './CampaignStatisticsTable';
import { PerformanceTrendsChart } from './PerformanceTrendsChart';
import { TopPerformingCampaigns } from './TopPerformingCampaigns';

export function AnalyticsPageContent() {
  const [trackingSummary, setTrackingSummary] = useState<UserTrackingSummary | null>(null);
  const [campaignStats, setCampaignStats] = useState<TrackingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchInProgress.current) {
      return;
    }
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);

      // Get user tracking summary
      const summaryResponse = await TrackingAPI.getUserTrackingSummary();
      if (summaryResponse.success && summaryResponse.data) {
        setTrackingSummary(summaryResponse.data);

        // Get detailed stats for each campaign
        const statsPromises = summaryResponse.data.topPerformingCampaigns.map(campaign =>
          TrackingAPI.getCampaignStats(campaign.campaignId)
        );

        const statsResults = await Promise.all(statsPromises);
        const validStats = statsResults
          .filter((result: any) => result.success && result.data)
          .map((result: any) => result.data!);

        setCampaignStats(validStats);
      } else {
        setError(summaryResponse.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error) {
    return <AnalyticsErrorState error={error} onRetry={fetchAnalyticsData} />;
  }

  return (
    <div className="space-y-6">
      <AnalyticsMetricsCards trackingSummary={trackingSummary} />
      
      <PerformanceTrendsChart campaignStats={campaignStats} />
      
      <TopPerformingCampaigns trackingSummary={trackingSummary} />
      
      <CampaignStatisticsTable campaignStats={campaignStats} />

      {!trackingSummary && !loading && <AnalyticsEmptyState />}
    </div>
  );
}
