'use client';

import { useMemo, useRef } from 'react';

interface CampaignFormData {
  name: string;
  description: string;
  botId: string;
  templateId: string;
  emailList: string;
  scheduledFor?: Date;
  emailInterval: number;
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
}

interface UseCampaignUnsavedChangesOptions {
  formData: CampaignFormData;
  uploadedEmails: string[];
  uploadedFileName: string;
  currentStep: number;
}

export function useCampaignUnsavedChanges({
  formData,
  uploadedEmails,
  uploadedFileName,
  currentStep
}: UseCampaignUnsavedChangesOptions) {
  // Store initial state for comparison
  const initialFormData = useRef<CampaignFormData>({
    name: '',
    description: '',
    botId: '',
    templateId: '',
    emailList: '',
    scheduledFor: undefined,
    emailInterval: 0,
    emailIntervalUnit: 'minutes'
  });
  
  const initialUploadedEmails = useRef<string[]>([]);
  const initialUploadedFileName = useRef<string>('');
  const initialStep = useRef<number>(1);

  // Function to reset initial state (call this after successful submission)
  const resetInitialState = () => {
    initialFormData.current = {
      name: '',
      description: '',
      botId: '',
      templateId: '',
      emailList: '',
      scheduledFor: undefined,
      emailInterval: 0,
      emailIntervalUnit: 'minutes'
    };
    initialUploadedEmails.current = [];
    initialUploadedFileName.current = '';
    initialStep.current = 1;
  };

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // Check if any form data has changed
    const formDataChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
    
    // Check if uploaded emails have changed
    const uploadedEmailsChanged = 
      JSON.stringify(uploadedEmails) !== JSON.stringify(initialUploadedEmails.current) ||
      uploadedFileName !== initialUploadedFileName.current;
    
    // Check if user has progressed beyond step 1
    const hasProgressed = currentStep > initialStep.current;
    
    // Check if any meaningful data has been entered
    const hasEnteredData = 
      formData.name.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.botId !== '' ||
      formData.templateId !== '' ||
      formData.emailList.trim() !== '' ||
      uploadedEmails.length > 0 ||
      formData.scheduledFor !== undefined ||
      formData.emailInterval > 0;

    return (formDataChanged || uploadedEmailsChanged || hasProgressed) && hasEnteredData;
  }, [formData, uploadedEmails, uploadedFileName, currentStep]);

  return {
    hasUnsavedChanges,
    resetInitialState
  };
}
