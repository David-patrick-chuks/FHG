'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Plus, 
  Eye, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { useGet } from '@/hooks/useApi';
import { Campaign } from '@/types';
import { cn } from '@/lib/utils';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: Play,
        label: 'Active'
      };
    case 'paused':
      return {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Pause,
        label: 'Paused'
      };
    case 'completed':
      return {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: CheckCircle,
        label: 'Completed'
      };
    case 'draft':
      return {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        icon: Clock,
        label: 'Draft'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        icon: Clock,
        label: status
      };
  }
};

export function CampaignOverview() {
  const { data: campaigns, loading, error } = useGet<Campaign[]>('/campaigns?limit=5');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest email campaigns and their performance</CardDescription>
            </div>
            <Button size="sm" disabled>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest email campaigns and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Failed to load campaigns. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentCampaigns = campaigns || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest email campaigns and their performance</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first email campaign to get started
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => {
              const statusConfig = getStatusConfig(campaign.status);
              const StatusIcon = statusConfig.icon;
              const progress = (campaign.stats.sentEmails / campaign.stats.totalEmails) * 100;

              return (
                <div key={campaign._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {campaign.name}
                      </h4>
                      <Badge className={cn('text-xs', statusConfig.color)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {campaign.description || 'No description'}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {campaign.stats.sentEmails.toLocaleString()} / {campaign.stats.totalEmails.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{campaign.stats.openRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{campaign.stats.clickRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {recentCampaigns.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Campaigns
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
