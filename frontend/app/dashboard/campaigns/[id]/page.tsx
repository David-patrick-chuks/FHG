'use client';

import {
    AIMessages,
    CampaignDialogs,
    CampaignHeader,
    CampaignInfo,
    CampaignProgress,
    CampaignStats,
    EmailRecipients
} from '@/components/dashboard/campaigns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BotsAPI, CampaignsAPI } from '@/lib/api';
import { Bot, Campaign } from '@/types';
import { ArrowLeft, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch campaign details
  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignsAPI.getCampaign(campaignId);
      
      if (response.success && response.data) {
        setCampaign(response.data);
        
        // Fetch bot details
        const botResponse = await BotsAPI.getBot(response.data.botId);
        if (botResponse.success && botResponse.data) {
          setBot(botResponse.data);
        }
      } else {
        setError(response.error || 'Failed to fetch campaign details');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch campaign details');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, fetchCampaign]);

  // Campaign actions
  const handlePauseCampaign = async () => {
    if (!campaign) return;
    
    try {
      setIsUpdating(true);
      const response = await CampaignsAPI.updateCampaign(campaign._id, {
        status: 'paused'
      });
      
      if (response.success) {
        setCampaign(prev => prev ? { ...prev, status: 'paused' } : null);
        setIsPauseDialogOpen(false);
      } else {
        setError(response.error || 'Failed to pause campaign');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pause campaign');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResumeCampaign = async () => {
    if (!campaign) return;
    
    try {
      setIsUpdating(true);
      const response = await CampaignsAPI.updateCampaign(campaign._id, {
        status: 'running'
      });
      
      if (response.success) {
        setCampaign(prev => prev ? { ...prev, status: 'running' } : null);
      } else {
        setError(response.error || 'Failed to resume campaign');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resume campaign');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    
    try {
      setIsUpdating(true);
      const response = await CampaignsAPI.deleteCampaign(campaign._id);
      
      if (response.success) {
        router.push('/dashboard/campaigns');
      } else {
        setError(response.error || 'Failed to delete campaign');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete campaign');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper functions
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'stopped':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'completed':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'stopped':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!campaign) return 0;
    const total = campaign.emailList.length;
    const sent = campaign.sentEmails.length;
    return total > 0 ? Math.round((sent / total) * 100) : 0;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Campaign Not Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || 'The campaign you are looking for does not exist or has been deleted.'}
                </p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => router.push('/dashboard/campaigns')}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Campaigns
                  </Button>
                  {error && (
                    <Button 
                      onClick={() => fetchCampaign()}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Campaign Details"
      description={`View and manage ${campaign.name}`}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push('/dashboard/campaigns')}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <Button 
            onClick={() => router.push(`/dashboard/campaigns/${campaign._id}/edit`)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Campaign
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Campaign Header */}
        <CampaignHeader
          campaign={campaign}
          isUpdating={isUpdating}
          onPause={() => setIsPauseDialogOpen(true)}
          onResume={handleResumeCampaign}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onEdit={() => router.push(`/dashboard/campaigns/${campaign._id}/edit`)}
          getStatusBadgeVariant={getStatusBadgeVariant}
          getStatusColor={getStatusColor}
        />

        {/* Campaign Stats */}
        <CampaignStats
          campaign={campaign}
          bot={bot}
          getProgressPercentage={getProgressPercentage}
        />

        {/* Progress Bar */}
        <CampaignProgress
          campaign={campaign}
          getProgressPercentage={getProgressPercentage}
        />

        {/* Campaign Details */}
        <CampaignInfo
          campaign={campaign}
          bot={bot}
          getStatusBadgeVariant={getStatusBadgeVariant}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
        />

        {/* AI Messages */}
        <AIMessages campaign={campaign} />

        {/* Email List Preview */}
        <EmailRecipients campaign={campaign} />
      </div>

      {/* Campaign Dialogs */}
      <CampaignDialogs
        campaign={campaign}
        isPauseDialogOpen={isPauseDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isUpdating={isUpdating}
        onPauseDialogClose={() => setIsPauseDialogOpen(false)}
        onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
        onPauseCampaign={handlePauseCampaign}
        onDeleteCampaign={handleDeleteCampaign}
      />
    </DashboardLayout>
  );
}
