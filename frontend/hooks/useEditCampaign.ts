'use client';

import { BotsAPI, CampaignsAPI } from '@/lib/api';
import { Bot, Campaign } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  description: string;
  emailList: string[];
  emailInterval: number;
  emailIntervalUnit: 'minutes' | 'hours' | 'days';
  scheduledFor: string;
  status: 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'stopped';
}

export function useEditCampaign(campaignId: string) {
  const router = useRouter();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    emailList: [],
    emailInterval: 0,
    emailIntervalUnit: 'minutes',
    scheduledFor: '',
    status: 'draft'
  });

  // Fetch campaign details
  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignsAPI.getCampaign(campaignId);
      
      if (response.success && response.data) {
        const campaignData = response.data;
        setCampaign(campaignData);
        
        // Set form data
        setFormData({
          name: campaignData.name || '',
          description: campaignData.description || '',
          emailList: campaignData.emailList || [],
          emailInterval: campaignData.emailInterval || 0,
          emailIntervalUnit: campaignData.emailIntervalUnit || 'minutes',
          scheduledFor: campaignData.scheduledFor ? new Date(campaignData.scheduledFor).toISOString().slice(0, 16) : '',
          status: campaignData.status || 'draft'
        });
        
        // Fetch bot details
        const botResponse = await BotsAPI.getBot(campaignData.botId);
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaign) return;

    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        emailList: formData.emailList,
        emailInterval: formData.emailInterval,
        emailIntervalUnit: formData.emailIntervalUnit,
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null,
        status: formData.status
      };

      const response = await CampaignsAPI.updateCampaign(campaign._id, updateData);
      
      if (response.success) {
        toast.success('Campaign updated successfully');
        router.push(`/dashboard/campaigns/${campaign._id}`);
      } else {
        setError(response.error || 'Failed to update campaign');
        toast.error(response.error || 'Failed to update campaign');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle email list changes
  const handleEmailListChange = (value: string) => {
    const emails = value.split('\n').map(email => email.trim()).filter(email => email);
    setFormData(prev => ({ ...prev, emailList: emails }));
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
      case 'draft':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'ready':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return {
    campaign,
    bot,
    loading,
    saving,
    error,
    formData,
    setFormData,
    handleSubmit,
    handleEmailListChange,
    getStatusColor,
    fetchCampaign
  };
}
