'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsAPI, AnalyticsSummary, UserAnalytics } from '@/lib/api';
import {
    ArrowRight,
    BarChart3,
    Crown,
    Lock,
    Mail,
    TrendingUp,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { AnalyticsErrorState } from './AnalyticsErrorState';
import { AnalyticsLoadingSkeleton } from './AnalyticsLoadingSkeleton';
import { AnalyticsMetricsCards } from './AnalyticsMetricsCards';
import { CampaignStatisticsTable } from './CampaignStatisticsTable';
import { PerformanceTrendsChart } from './PerformanceTrendsChart';
import { TopPerformingCampaigns } from './TopPerformingCampaigns';

interface SubscriptionBasedAnalyticsProps {
  className?: string;
}

export function SubscriptionBasedAnalytics({ className }: SubscriptionBasedAnalyticsProps) {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<UserAnalytics | null>(null);
  const [summaryData, setSummaryData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, check if user has access to analytics
      const accessResponse = await AnalyticsAPI.checkAnalyticsAccess();
      
      if (accessResponse.success && accessResponse.data) {
        setHasAccess(accessResponse.data.hasAccess);
        
        if (accessResponse.data.hasAccess) {
          // User has paid subscription, fetch full analytics
          const analyticsResponse = await AnalyticsAPI.getUserAnalytics();
          if (analyticsResponse.success && analyticsResponse.data) {
            setAnalyticsData(analyticsResponse.data);
          } else {
            setError(analyticsResponse.message || 'Failed to fetch analytics data');
          }
        } else {
          // User has free subscription, fetch summary only
          const summaryResponse = await AnalyticsAPI.getAnalyticsSummary();
          if (summaryResponse.success && summaryResponse.data) {
            setSummaryData(summaryResponse.data);
          } else {
            setError(summaryResponse.message || 'Failed to fetch analytics summary');
          }
        }
      } else {
        setError(accessResponse.message || 'Failed to check analytics access');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
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

  // Free users see limited analytics with upgrade prompt
  if (!hasAccess && summaryData) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Free User Analytics Summary */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Emails</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {summaryData.totalEmails.toLocaleString()}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-300">Across all campaigns</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Campaigns</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {summaryData.totalCampaigns}
                </p>
                <p className="text-xs text-green-500 dark:text-green-300">Active and completed</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Current Plan</p>
                <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700">
                  {summaryData.subscriptionTier.toUpperCase()}
                </Badge>
                <p className="text-xs text-purple-500 dark:text-purple-300 mt-1">Free tier</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Upgrade Available</p>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">Unlock Analytics</p>
                <p className="text-xs text-amber-500 dark:text-amber-300">Get detailed insights</p>
              </div>
              <Crown className="h-8 w-8 text-amber-500 dark:text-amber-400" />
            </div>
          </Card>
        </div>

        {/* Upgrade Prompt */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Unlock Advanced Analytics
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  {summaryData.upgradeMessage || 'Get detailed insights into your email campaigns with open rates, performance trends, and campaign analytics.'}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Performance Trends</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <BarChart3 className="h-4 w-4" />
                    <span>Campaign Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Mail className="h-4 w-4" />
                    <span>Open Rate Tracking</span>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/dashboard/payments">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Empty State for Free Users */}
        <AnalyticsEmptyState />
      </div>
    );
  }

  // Paid users see full analytics
  if (hasAccess && analyticsData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <AnalyticsMetricsCards trackingSummary={analyticsData} />
        
        <PerformanceTrendsChart campaignStats={analyticsData.campaignPerformance} />
        
        <TopPerformingCampaigns trackingSummary={analyticsData} />
        
        <CampaignStatisticsTable campaignStats={analyticsData.campaignPerformance} />

        {!analyticsData.metrics.totalCampaigns && <AnalyticsEmptyState />}
      </div>
    );
  }

  // Fallback empty state
  return <AnalyticsEmptyState />;
}
