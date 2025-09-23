'use client';

import { useMemo, useRef } from 'react';

interface BotFormData {
  name: string;
  description: string;
  email: string;
  password: string;
}

interface UseBotUnsavedChangesOptions {
  formData: BotFormData;
  currentStep: number;
  verificationStatus: 'idle' | 'success' | 'error';
}

export function useBotUnsavedChanges({
  formData,
  currentStep,
  verificationStatus
}: UseBotUnsavedChangesOptions) {
  // Store initial state for comparison
  const initialFormData = useRef<BotFormData>({
    name: '',
    description: '',
    email: '',
    password: ''
  });
  
  const initialStep = useRef<number>(1);
  const initialVerificationStatus = useRef<'idle' | 'success' | 'error'>('idle');

  // Function to reset initial state (call this after successful submission)
  const resetInitialState = () => {
    initialFormData.current = {
      name: '',
      description: '',
      email: '',
      password: ''
    };
    initialStep.current = 1;
    initialVerificationStatus.current = 'idle';
  };

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // Check if any form data has changed
    const formDataChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
    
    // Check if user has progressed beyond step 1
    const hasProgressed = currentStep > initialStep.current;
    
    // Check if verification status has changed (user has verified credentials)
    const verificationChanged = verificationStatus !== initialVerificationStatus.current;
    
    // Check if any meaningful data has been entered
    const hasEnteredData = 
      formData.name.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.email.trim() !== '' ||
      formData.password.trim() !== '' ||
      verificationStatus === 'success';

    return (formDataChanged || hasProgressed || verificationChanged) && hasEnteredData;
  }, [formData, currentStep, verificationStatus]);

  return {
    hasUnsavedChanges,
    resetInitialState
  };
}
