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
            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Campaigns</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button 
            onClick={() => router.push(`/dashboard/campaigns/${localCampaign._id}/edit`)}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
          >
            <Edit className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Edit Campaign</span>
            <span className="sm:hidden">Edit</span>
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
