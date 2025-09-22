'use client';

import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useTemplatePreview(templateId: string) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedSample, setCopiedSample] = useState<number | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TemplatesAPI.getTemplate(templateId);
      if (response.success && response.data) {
        setTemplate(response.data);
      } else {
        setError(response.message || 'Template not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const validateVariables = useCallback(() => {
    if (!template?.variables) return true;
    
    const errors: Record<string, string> = {};
    let isValid = true;
    
    template.variables.forEach(variable => {
      if (variable.required && (!variableValues[variable.key] || variableValues[variable.key].trim() === '')) {
        errors[variable.key] = `${variable.key} is required`;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  }, [template?.variables, variableValues]);

  const handleAddToMyTemplates = useCallback(async () => {
    if (!template) return;
    
    if (!validateVariables()) {
      toast.error('Please fill in all required variables before adding the template');
      return;
    }
    
    try {
      setAdding(true);
      const response = await TemplatesAPI.useTemplate(template._id);
      if (response.success) {
        toast.success('Template added to your collection!');
        router.push('/dashboard/templates');
      } else {
        toast.error(response.message || 'Failed to add template');
      }
    } catch (err) {
      toast.error('Failed to add template');
    } finally {
      setAdding(false);
    }
  }, [template, validateVariables, router]);

  const handleVariableChange = useCallback((key: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleSubmitReview = useCallback(async () => {
    if (!template || !userRating || !userReview.trim()) return;
    
    try {
      setSubmittingReview(true);
      const response = await TemplatesAPI.reviewTemplate(template._id, {
        rating: userRating,
        comment: userReview
      });
      
      if (response.success) {
        toast.success('Review submitted successfully!');
        setUserReview('');
        setUserRating(0);
        loadTemplate();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }, [template, userRating, userReview, loadTemplate]);

  const copySampleToClipboard = useCallback(async (sample: any, index: number) => {
    try {
      const text = `Subject: ${sample.subject}\n\n${sample.body}`;
      await navigator.clipboard.writeText(text);
      setCopiedSample(index);
      toast.success('Sample copied to clipboard!');
      setTimeout(() => setCopiedSample(null), 2000);
    } catch (err) {
      toast.error('Failed to copy sample');
    }
  }, []);

  const handleBack = useCallback(() => {
    router.push('/dashboard/templates');
  }, [router]);

  return {
    template,
    loading,
    error,
    adding,
    userRating,
    userReview,
    submittingReview,
    copiedSample,
    variableValues,
    validationErrors,
    handleAddToMyTemplates,
    handleVariableChange,
    handleSubmitReview,
    copySampleToClipboard,
    handleBack,
    setUserRating,
    setUserReview
  };
}
