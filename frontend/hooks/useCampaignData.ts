import { BotsAPI, CampaignsAPI } from '@/lib/api';
import { Bot, Campaign } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseCampaignDataReturn {
  campaign: Campaign | null;
  bot: Bot | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCampaignData(campaignId: string): UseCampaignDataReturn {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    campaign,
    bot,
    loading,
    error,
    refetch: fetchCampaign
  };
}
