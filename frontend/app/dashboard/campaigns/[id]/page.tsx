'use client';

import { CampaignDetailsContent, CampaignDetailsErrorState, CampaignDetailsLoadingSkeleton } from '@/components/campaigns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useCampaignData } from '@/hooks/useCampaignData';
import { ArrowLeft, Edit } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Custom hooks for data and actions
  const { campaign, bot, loading, error, refetch } = useCampaignData(campaignId);
  const {
    isUpdating,
    error: actionError,
    setError,
    handlePauseCampaign,
    handleResumeCampaign,
    handleDeleteCampaign,
    handleScheduleCampaign,
    handleStartCampaign
  } = useCampaignActions();

  const [localCampaign, setLocalCampaign] = useState(campaign);

  // Update local campaign when data changes
  useEffect(() => {
    if (campaign) {
      setLocalCampaign(campaign);
    }
  }, [campaign]);

  const handleCampaignUpdate = (updatedCampaign: any) => {
    setLocalCampaign(updatedCampaign);
  };

  if (loading) {
    return <CampaignDetailsLoadingSkeleton />;
  }

  if (error || actionError || !localCampaign) {
    return <CampaignDetailsErrorState error={error || actionError} onRetry={refetch} />;
  }

  return (
    <DashboardLayout 
      title="Campaign Details"
      description={`View and manage ${localCampaign.name}`}
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
            onClick={() => router.push(`/dashboard/campaigns/${localCampaign._id}/edit`)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Campaign
          </Button>
        </div>
      }
    >
      <CampaignDetailsContent
        campaign={localCampaign}
        bot={bot}
        isUpdating={isUpdating}
        onPauseCampaign={handlePauseCampaign}
        onResumeCampaign={handleResumeCampaign}
        onDeleteCampaign={handleDeleteCampaign}
        onScheduleCampaign={handleScheduleCampaign}
        onStartCampaign={handleStartCampaign}
        onCampaignUpdate={handleCampaignUpdate}
      />
    </DashboardLayout>
  );
}
