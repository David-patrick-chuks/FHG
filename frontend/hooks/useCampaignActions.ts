import { CampaignsAPI } from '@/lib/api';
import { Campaign } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface UseCampaignActionsReturn {
  isUpdating: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  handlePauseCampaign: (campaign: Campaign) => Promise<void>;
  handleResumeCampaign: (campaign: Campaign) => Promise<void>;
  handleDeleteCampaign: (campaign: Campaign) => Promise<void>;
  handleScheduleCampaign: (campaign: Campaign, scheduledFor: Date) => Promise<Campaign | null>;
  handleStartCampaign: (campaign: Campaign) => Promise<Campaign | null>;
}

export function useCampaignActions(): UseCampaignActionsReturn {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePauseCampaign = useCallback(async (campaign: Campaign) => {
    try {
      setIsUpdating(true);
      const response = await CampaignsAPI.pauseCampaign(campaign._id);
      
      if (response.success) {
        // Campaign will be updated by parent component
      } else {
        setError(response.error || 'Failed to pause campaign');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pause campaign');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleResumeCampaign = useCallback(async (campaign: Campaign) => {
    try {
      setIsUpdating(true);
      const response = await CampaignsAPI.resumeCampaign(campaign._id);
      
      if (response.success) {
        // Campaign will be updated by parent component
      } else {
        setError(response.error || 'Failed to resume campaign');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resume campaign');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleDeleteCampaign = useCallback(async (campaign: Campaign) => {
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
  }, [router]);

  const handleScheduleCampaign = useCallback(async (campaign: Campaign, scheduledFor: Date) => {
    try {
      setIsUpdating(true);
      const response = await CampaignsAPI.scheduleCampaign(campaign._id, scheduledFor);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to schedule campaign');
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule campaign');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleStartCampaign = useCallback(async (campaign: Campaign) => {
    try {
      setIsUpdating(true);
      
      // First prepare the campaign if it's in draft status
      if (campaign.status === 'draft') {
        const prepareResponse = await CampaignsAPI.prepareCampaign(campaign._id);
        if (!prepareResponse.success) {
          setError(prepareResponse.error || 'Failed to prepare campaign');
          return null;
        }
      }
      
      // Then start the campaign
      const response = await CampaignsAPI.startCampaign(campaign._id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to start campaign');
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start campaign');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    isUpdating,
    error,
    setError,
    handlePauseCampaign,
    handleResumeCampaign,
    handleDeleteCampaign,
    handleScheduleCampaign,
    handleStartCampaign
  };
}
