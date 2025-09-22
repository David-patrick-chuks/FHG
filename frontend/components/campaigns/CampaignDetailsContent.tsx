'use client';

import { CampaignScheduler } from '@/components/campaigns/CampaignScheduler';
import {
  AIMessages,
  CampaignDialogs,
  CampaignHeader,
  CampaignInfo,
  CampaignProgress,
  CampaignStats,
  EmailRecipients
} from '@/components/dashboard/campaigns';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Campaign } from '@/types';
import { formatDate, getProgressPercentage, getStatusBadgeVariant, getStatusColor } from '@/utils/campaignUtils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CampaignDetailsContentProps {
  campaign: Campaign;
  bot: Bot | null;
  isUpdating: boolean;
  onPauseCampaign: (campaign: Campaign) => Promise<void>;
  onResumeCampaign: (campaign: Campaign) => Promise<void>;
  onDeleteCampaign: (campaign: Campaign) => Promise<void>;
  onScheduleCampaign: (campaign: Campaign, scheduledFor: Date) => Promise<Campaign | null>;
  onStartCampaign: (campaign: Campaign) => Promise<Campaign | null>;
  onCampaignUpdate: (updatedCampaign: Campaign) => void;
}

export function CampaignDetailsContent({
  campaign,
  bot,
  isUpdating,
  onPauseCampaign,
  onResumeCampaign,
  onDeleteCampaign,
  onScheduleCampaign,
  onStartCampaign,
  onCampaignUpdate
}: CampaignDetailsContentProps) {
  const router = useRouter();
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleScheduleCampaign = async (scheduledFor: Date) => {
    const updatedCampaign = await onScheduleCampaign(campaign, scheduledFor);
    if (updatedCampaign) {
      onCampaignUpdate(updatedCampaign);
    }
  };

  const handleStartCampaign = async () => {
    const updatedCampaign = await onStartCampaign(campaign);
    if (updatedCampaign) {
      onCampaignUpdate(updatedCampaign);
    }
  };

  const handlePauseCampaign = async () => {
    await onPauseCampaign(campaign);
    setIsPauseDialogOpen(false);
  };

  const handleDeleteCampaign = async () => {
    await onDeleteCampaign(campaign);
  };

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <CampaignHeader
        campaign={campaign}
        isUpdating={isUpdating}
        onPause={() => setIsPauseDialogOpen(true)}
        onResume={() => onResumeCampaign(campaign)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onEdit={() => router.push(`/dashboard/campaigns/${campaign._id}/edit`)}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getStatusColor={getStatusColor}
      />

      {/* Campaign Stats */}
      <CampaignStats
        campaign={campaign}
        bot={bot}
        getProgressPercentage={() => getProgressPercentage(campaign)}
      />

      {/* Progress Bar */}
      <CampaignProgress
        campaign={campaign}
        getProgressPercentage={() => getProgressPercentage(campaign)}
      />

      {/* Campaign Scheduler - Only show for draft/ready campaigns */}
      {(campaign.status === 'draft' || campaign.status === 'ready') && (
        <Card>
          <CardContent className="pt-6">
            <CampaignScheduler
              campaignId={campaign._id}
              onSchedule={handleScheduleCampaign}
              onStartNow={handleStartCampaign}
              isScheduled={campaign.isScheduled}
              scheduledFor={campaign.scheduledFor}
              disabled={isUpdating}
            />
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
