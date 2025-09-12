'use client';

import { BotsAPI, CampaignsAPI } from '@/lib/api';
import { TemplatesAPI } from '@/lib/api/templates';
import { Bot, Template } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useCampaignCreation() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    botId: '',
    templateId: '',
    emailList: '',
    scheduledFor: undefined as Date | undefined,
    emailInterval: 0,
    emailIntervalUnit: 'minutes' as 'seconds' | 'minutes' | 'hours'
  });
  const [uploadedEmails, setUploadedEmails] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // State for API data
  const [bots, setBots] = useState<Bot[]>([]);
  const [botsLoading, setBotsLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);

  // Fetch bots data
  const fetchBots = useCallback(async () => {
    if (fetchInProgress.current) {
      return;
    }
    
    try {
      fetchInProgress.current = true;
      setBotsLoading(true);
      setError(null);
      const response = await BotsAPI.getBots();
      if (response.success && response.data) {
        setBots(response.data.data || []);
      } else {
        setError(response.error || 'Failed to fetch bots');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch bots');
    } finally {
      setBotsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  // Fetch templates data
  const fetchTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      setError(null);
      const response = await TemplatesAPI.getMyTemplates();
      if (response.success && response.data) {
        // Filter templates that have at least 10 samples
        const validTemplates = response.data.filter(template => 
          template.samples && template.samples.length >= 10
        );
        setTemplates(validTemplates);
      } else {
        setError(response.error || 'Failed to fetch templates');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
    fetchTemplates();
  }, [fetchBots, fetchTemplates]);

  // Redirect to bots page if no bots are available
  useEffect(() => {
    if (!botsLoading && bots.length === 0 && !error) {
      router.push('/dashboard/bots?message=create-bot-first');
    }
  }, [botsLoading, bots.length, error, router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['text/csv', 'text/plain'].includes(file.type)) {
      alert('Please upload a CSV or text file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/campaigns/upload-emails', {
        method: 'POST',
        credentials: 'include', // Include cookies automatically
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedEmails(result.data.emails);
        setUploadedFileName(result.data.fileName);
        setFormData(prev => ({ ...prev, emailList: result.data.emails.join('\n') }));
        
        if (result.data.invalidEmails.length > 0) {
          alert(`File uploaded successfully! Found ${result.data.validCount} valid emails and ${result.data.invalidEmails.length} invalid emails. The valid emails have been loaded into the text field below for your review.`);
        } else {
          alert(`File uploaded successfully! Found ${result.data.validCount} valid emails. They have been loaded into the text field below for your review.`);
        }
      } else {
        alert(result.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploadedEmails = () => {
    setUploadedEmails([]);
    setUploadedFileName('');
    setFormData(prev => ({ ...prev, emailList: '' }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        handleFileUpload({ target: { files: [file] } } as any);
      }
    }
  };

  const handleCreateCampaign = async () => {
    try {
      setCreating(true);
      setError(null);
      
      const emailList = formData.emailList.split('\n').filter(email => email.trim());
      const response = await CampaignsAPI.createCampaign({
        name: formData.name,
        description: formData.description,
        botId: formData.botId,
        emailList,
        scheduledFor: formData.scheduledFor,
        emailInterval: formData.emailInterval,
        emailIntervalUnit: formData.emailIntervalUnit
      });
      
      if (response.success) {
        router.push('/dashboard/campaigns');
      } else {
        setError(response.error || 'Failed to create campaign');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canProceedToStep2 = Boolean(formData.name.trim() && formData.botId);
  const canProceedToStep3 = Boolean(canProceedToStep2 && (uploadedEmails.length > 0 || formData.emailList.trim()));
  const canCreateCampaign = Boolean(canProceedToStep3);
  
  const isFormDisabled = creating;

  return {
    // State
    currentStep,
    formData,
    uploadedEmails,
    uploadedFileName,
    isUploading,
    isDragOver,
    bots,
    botsLoading,
    templates,
    templatesLoading,
    creating,
    error,
    isFormDisabled,
    
    // Computed values
    canProceedToStep2,
    canProceedToStep3,
    canCreateCampaign,
    
    // Actions
    setCurrentStep,
    updateFormData,
    handleFileUpload,
    clearUploadedEmails,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCreateCampaign
  };
}
