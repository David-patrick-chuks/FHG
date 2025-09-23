'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCharacterCountInfo } from '@/lib/utils/templateValidation';
import { CreateTemplateRequest, TemplateCategory } from '@/types';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface TemplateBasicInfoProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

const categoryOptions: { value: TemplateCategory; label: string }[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'event_invitation', label: 'Event Invitation' },
  { value: 'thank_you', label: 'Thank You' },
  { value: 'apology', label: 'Apology' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'feedback_request', label: 'Feedback Request' },
  { value: 'other', label: 'Other' }
];

export function TemplateBasicInfo({ formData, setFormData }: TemplateBasicInfoProps) {
  // Track which fields have been touched by the user
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Get validation info for each field
  const nameInfo = getCharacterCountInfo(formData.name, 'name');
  const descriptionInfo = getCharacterCountInfo(formData.description, 'description');
  const useCaseInfo = getCharacterCountInfo(formData.useCase, 'useCase');
  const industryInfo = getCharacterCountInfo(formData.industry || '', 'industry');
  const targetAudienceInfo = getCharacterCountInfo(formData.targetAudience || '', 'targetAudience');

  // Helper function to mark field as touched
  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  // Helper function to check if field should show validation state
  const shouldShowValidation = (fieldName: string, isValid: boolean) => {
    return touchedFields.has(fieldName) || isValid;
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Basic Information */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="name" className="font-medium">
              Template Name *
            </Label>
            <div className="flex items-center gap-1">
              {shouldShowValidation('name', nameInfo.isValid) ? (
                nameInfo.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )
              ) : (
                <span className="w-4 h-4" />
              )}
              <span className={`text-xs ${
                shouldShowValidation('name', nameInfo.isValid) 
                  ? (nameInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {nameInfo.current}/{nameInfo.max}
              </span>
            </div>
          </div>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              markFieldAsTouched('name');
            }}
            onBlur={() => markFieldAsTouched('name')}
            placeholder="e.g., Sales Follow-up Template"
            required
            className={`${
              shouldShowValidation('name', nameInfo.isValid)
                ? (nameInfo.isValid 
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500')
                : ''
            }`}
          />
          {shouldShowValidation('name', nameInfo.isValid) && !nameInfo.isValid && nameInfo.message && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {nameInfo.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="font-medium">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value: TemplateCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="font-medium">
            Description *
          </Label>
          <div className="flex items-center gap-1">
            {shouldShowValidation('description', descriptionInfo.isValid) ? (
              descriptionInfo.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )
            ) : (
              <span className="w-4 h-4" />
            )}
            <span className={`text-xs ${
              shouldShowValidation('description', descriptionInfo.isValid) 
                ? (descriptionInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {descriptionInfo.current}/{descriptionInfo.max}
            </span>
          </div>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, description: e.target.value }));
            markFieldAsTouched('description');
          }}
          onBlur={() => markFieldAsTouched('description')}
          placeholder="Describe what this template is used for..."
          rows={3}
          required
          className={`${
            shouldShowValidation('description', descriptionInfo.isValid)
              ? (descriptionInfo.isValid 
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                  : 'border-red-300 focus:border-red-500 focus:ring-red-500')
              : ''
          }`}
        />
        {shouldShowValidation('description', descriptionInfo.isValid) && !descriptionInfo.isValid && descriptionInfo.message && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {descriptionInfo.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="useCase" className="font-medium">
            Use Case *
          </Label>
          <div className="flex items-center gap-1">
            {shouldShowValidation('useCase', useCaseInfo.isValid) ? (
              useCaseInfo.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )
            ) : (
              <span className="w-4 h-4" />
            )}
            <span className={`text-xs ${
              shouldShowValidation('useCase', useCaseInfo.isValid) 
                ? (useCaseInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {useCaseInfo.current}/{useCaseInfo.max}
            </span>
          </div>
        </div>
        <Textarea
          id="useCase"
          value={formData.useCase}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, useCase: e.target.value }));
            markFieldAsTouched('useCase');
          }}
          onBlur={() => markFieldAsTouched('useCase')}
          placeholder="Describe when and why to use this template..."
          rows={3}
          required
          className={`${
            shouldShowValidation('useCase', useCaseInfo.isValid)
              ? (useCaseInfo.isValid 
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                  : 'border-red-300 focus:border-red-500 focus:ring-red-500')
              : ''
          }`}
        />
        {shouldShowValidation('useCase', useCaseInfo.isValid) && !useCaseInfo.isValid && useCaseInfo.message && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {useCaseInfo.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="industry" className="font-medium">
              Industry (Optional)
            </Label>
            <div className="flex items-center gap-1">
              {shouldShowValidation('industry', industryInfo.isValid) ? (
                industryInfo.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )
              ) : (
                <span className="w-4 h-4" />
              )}
              <span className={`text-xs ${
                shouldShowValidation('industry', industryInfo.isValid) 
                  ? (industryInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {industryInfo.current}/{industryInfo.max}
              </span>
            </div>
          </div>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, industry: e.target.value }));
              markFieldAsTouched('industry');
            }}
            onBlur={() => markFieldAsTouched('industry')}
            placeholder="e.g., Technology, Healthcare"
            className={`${
              shouldShowValidation('industry', industryInfo.isValid)
                ? (industryInfo.isValid 
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500')
                : ''
            }`}
          />
          {shouldShowValidation('industry', industryInfo.isValid) && !industryInfo.isValid && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Industry must be 50 characters or less
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="targetAudience" className="font-medium">
              Target Audience (Optional)
            </Label>
            <div className="flex items-center gap-1">
              {shouldShowValidation('targetAudience', targetAudienceInfo.isValid) ? (
                targetAudienceInfo.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )
              ) : (
                <span className="w-4 h-4" />
              )}
              <span className={`text-xs ${
                shouldShowValidation('targetAudience', targetAudienceInfo.isValid) 
                  ? (targetAudienceInfo.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {targetAudienceInfo.current}/{targetAudienceInfo.max}
              </span>
            </div>
          </div>
          <Input
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, targetAudience: e.target.value }));
              markFieldAsTouched('targetAudience');
            }}
            onBlur={() => markFieldAsTouched('targetAudience')}
            placeholder="e.g., B2B Sales Teams"
            className={`${
              shouldShowValidation('targetAudience', targetAudienceInfo.isValid)
                ? (targetAudienceInfo.isValid 
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500')
                : ''
            }`}
          />
          {shouldShowValidation('targetAudience', targetAudienceInfo.isValid) && !targetAudienceInfo.isValid && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Target audience must be 100 characters or less
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
