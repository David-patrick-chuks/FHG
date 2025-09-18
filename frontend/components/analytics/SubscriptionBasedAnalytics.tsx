'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsAPI, AnalyticsSummary, UserAnalytics } from '@/lib/api';
import {
    ArrowRight,
    BarChart3,
    Crown,
    Mail,
    TrendingUp
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
      
      console.log('Analytics access response:', accessResponse);
      
      if (accessResponse.success && accessResponse.data) {
        setHasAccess(accessResponse.data.hasAccess);
        
        if (accessResponse.data.hasAccess) {
          // User has paid subscription, fetch full analytics
          console.log('User has access, fetching analytics data...');
          const analyticsResponse = await AnalyticsAPI.getUserAnalytics();
          console.log('Analytics data response:', analyticsResponse);
          
          if (analyticsResponse.success && analyticsResponse.data) {
            setAnalyticsData(analyticsResponse.data);
          } else {
            // Don't set error for analytics data fetch failure, just log it
            console.warn('Analytics data fetch failed:', analyticsResponse.message);
            // Set empty analytics data instead of error
            setAnalyticsData({
              metrics: {
                totalEmails: 0,
                totalOpened: 0,
                totalDelivered: 0,
                totalFailed: 0,
                averageOpenRate: 0,
                totalCampaigns: 0,
                activeCampaigns: 0,
                completedCampaigns: 0,
                topPerformingCampaign: null
              },
              campaignPerformance: [],
              emailTrends: [],
              subscriptionTier: accessResponse.data.subscriptionTier,
              hasAccess: true
            });
          }
        } else {
          // User has free subscription, show upgrade prompt with basic info
          // Don't fetch summary data to avoid errors, just show the upgrade prompt
          setSummaryData({
            totalEmails: 0,
            totalCampaigns: 0,
            subscriptionTier: accessResponse.data.subscriptionTier,
            upgradeMessage: accessResponse.data.message || 'Analytics requires a paid subscription. Upgrade to Basic or Premium to access detailed analytics.'
          });
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

  // Debug logging
  console.log('Analytics component state:', {
    loading,
    error,
    hasAccess,
    analyticsData: !!analyticsData,
    summaryData: !!summaryData
  });

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error) {
    return <AnalyticsErrorState error={error} onRetry={fetchAnalyticsData} />;
  }

  // Free users see blurred analytics preview with upgrade prompt
  if (!hasAccess) {
    return (
      <div className={`space-y-6 ${className} relative`}>
        {/* Blurred Analytics Preview */}
        <div className="blur-sm pointer-events-none">
          <AnalyticsMetricsCards trackingSummary={{
            metrics: {
              totalEmails: 1247,
              totalCampaigns: 8,
              openRate: 24.5,
              clickRate: 3.2,
              replyRate: 1.8,
              bounceRate: 2.1
            },
            campaignPerformance: [
              {
                campaignId: 'demo-1',
                campaignName: 'Q4 Product Launch',
                emailsSent: 500,
                openRate: 28.4,
                clickRate: 4.2,
                replyRate: 2.1,
                bounceRate: 1.8,
                status: 'completed' as const,
                createdAt: new Date('2024-01-15'),
                completedAt: new Date('2024-01-20')
              },
              {
                campaignId: 'demo-2',
                campaignName: 'Customer Onboarding',
                emailsSent: 300,
                openRate: 32.1,
                clickRate: 5.8,
                replyRate: 3.2,
                bounceRate: 1.2,
                status: 'completed' as const,
                createdAt: new Date('2024-01-10'),
                completedAt: new Date('2024-01-18')
              }
            ],
            emailTrends: [
              {
                date: new Date('2024-01-01'),
                emailsSent: 150,
                emailsOpened: 45,
                openRate: 30.0
              },
              {
                date: new Date('2024-01-02'),
                emailsSent: 200,
                emailsOpened: 52,
                openRate: 26.0
              }
            ],
            subscriptionTier: 'free' as const,
            hasAccess: false
          }} />
          
          <PerformanceTrendsChart campaignStats={[
            {
              campaignId: 'demo-1',
              campaignName: 'Q4 Product Launch',
              emailsSent: 500,
              openRate: 28.4,
              clickRate: 4.2,
              replyRate: 2.1,
              bounceRate: 1.8,
              status: 'completed' as const,
              createdAt: new Date('2024-01-15'),
              completedAt: new Date('2024-01-20')
            }
          ]} />
          
          <TopPerformingCampaigns trackingSummary={{
            metrics: {
              totalEmails: 1247,
              totalCampaigns: 8,
              openRate: 24.5,
              clickRate: 3.2,
              replyRate: 1.8,
              bounceRate: 2.1
            },
            campaignPerformance: [],
            emailTrends: [],
            subscriptionTier: 'free' as const,
            hasAccess: false
          }} />
        </div>

        {/* Upgrade Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm rounded-lg">
          <Card className="max-w-2xl mx-4 p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full">
                  <Crown className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Unlock Advanced Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Get detailed insights into your email campaigns with comprehensive analytics, performance trends, and campaign tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div className="text-left">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Performance Trends</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Track email performance over time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <p className="font-semibold text-green-900 dark:text-green-100">Campaign Analytics</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Detailed campaign insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div className="text-left">
                    <p className="font-semibold text-purple-900 dark:text-purple-100">Open Rate Tracking</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Monitor engagement metrics</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/payments">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg">
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.history.back()}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 px-8 py-3 text-lg"
                >
                  Go Back
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Starting from just $29.99/month • Cancel anytime
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Paid users see full analytics
  if (hasAccess) {
    if (analyticsData) {
      // Map UserAnalytics to UserTrackingSummary format
      const trackingSummary = {
        totalCampaigns: analyticsData.metrics.totalCampaigns,
        totalEmails: analyticsData.metrics.totalEmails,
        totalOpened: analyticsData.metrics.totalOpened,
        averageOpenRate: analyticsData.metrics.averageOpenRate,
        topPerformingCampaigns: analyticsData.metrics.topPerformingCampaign ? [{
          campaignId: analyticsData.metrics.topPerformingCampaign.campaignId,
          openRate: analyticsData.metrics.topPerformingCampaign.openRate,
          totalEmails: analyticsData.metrics.topPerformingCampaign.totalEmails
        }] : []
      };

      return (
        <div className={`space-y-6 ${className}`}>
          <AnalyticsMetricsCards trackingSummary={trackingSummary} />
          
          <PerformanceTrendsChart campaignStats={analyticsData.campaignPerformance} />
          
          <TopPerformingCampaigns trackingSummary={trackingSummary} />
          
          <CampaignStatisticsTable campaignStats={analyticsData.campaignPerformance} />

          {!analyticsData.metrics.totalCampaigns && <AnalyticsEmptyState />}
        </div>
      );
    } else if (!loading && !error) {
      // User has access but analytics data is still loading or failed to load
      return <AnalyticsLoadingSkeleton />;
    }
  }

  // Fallback empty state
  return <AnalyticsEmptyState />;
}
