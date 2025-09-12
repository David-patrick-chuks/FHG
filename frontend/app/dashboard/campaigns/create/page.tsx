'use client';

import { CampaignScheduler } from '@/components/campaigns/CampaignScheduler';
import { EmailIntervalSelector } from '@/components/campaigns/EmailIntervalSelector';
import { TemplateSelector } from '@/components/campaigns/TemplateSelector';
import { CampaignBasicsStep } from '@/components/dashboard/campaigns/CampaignBasicsStep';
import { CampaignProgressSteps } from '@/components/dashboard/campaigns/CampaignProgressSteps';
import { TargetAudienceStep } from '@/components/dashboard/campaigns/TargetAudienceStep';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignCreation } from '@/hooks/useCampaignCreation';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
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
  } = useCampaignCreation();

  const steps = [
    { id: 1, title: 'Campaign Basics', description: 'Set up your campaign foundation' },
    { id: 2, title: 'Email Template', description: 'Choose your email template' },
    { id: 3, title: 'Target Audience', description: 'Define who will receive your emails' },
    { id: 4, title: 'AI Configuration', description: 'Configure your AI email bot' },
    { id: 5, title: 'Schedule & Timing', description: 'Set when and how often to send emails' }
  ];

  return (
    <DashboardLayout
      title="Create New Campaign"
      description="Build your email campaign step by step with AI-powered automation"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/campaigns')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <CampaignProgressSteps steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Campaign Basics */}
          {currentStep === 1 && (
            <CampaignBasicsStep
              formData={{
                name: formData.name,
                description: formData.description,
                botId: formData.botId
              }}
              onFormDataChange={updateFormData}
              bots={bots}
              botsLoading={botsLoading}
              isFormDisabled={isFormDisabled}
              onNext={() => setCurrentStep(2)}
              canProceed={canProceedToStep2}
            />
          )}

          {/* Step 2: Email Template */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <TemplateSelector
                templates={templates}
                selectedTemplateId={formData.templateId}
                onTemplateSelect={(templateId) => updateFormData({ templateId })}
                loading={templatesLoading}
              />
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isFormDisabled}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={isFormDisabled}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <TargetAudienceStep
              formData={{
                emailList: formData.emailList,
                botId: formData.botId
              }}
              onFormDataChange={updateFormData}
              bots={bots}
              uploadedEmails={uploadedEmails}
              uploadedFileName={uploadedFileName}
              onFileUpload={handleFileUpload}
              onClearUploaded={clearUploadedEmails}
              isUploading={isUploading}
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              isFormDisabled={isFormDisabled}
              canProceed={canProceedToStep3}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
              userSubscription={user?.subscription || 'FREE'}
            />
          )}

          {/* Step 4: AI Configuration */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  AI Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI configuration will be handled automatically based on your selected template.
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  disabled={isFormDisabled}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(5)}
                  disabled={isFormDisabled}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Schedule & Timing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CampaignScheduler
                  campaignId=""
                  onSchedule={(scheduledFor) => updateFormData({ scheduledFor })}
                  onStartNow={() => updateFormData({ scheduledFor: undefined })}
                  isScheduled={!!formData.scheduledFor}
                  scheduledFor={formData.scheduledFor}
                  disabled={isFormDisabled}
                />
                
                <EmailIntervalSelector
                  emailInterval={formData.emailInterval}
                  emailIntervalUnit={formData.emailIntervalUnit}
                  onIntervalChange={(interval, unit) => updateFormData({ emailInterval: interval, emailIntervalUnit: unit })}
                  disabled={isFormDisabled}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                  disabled={isFormDisabled}
                  className="h-12 px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to AI Configuration
                </Button>
                
                <Button
                  onClick={handleCreateCampaign}
                  disabled={!canCreateCampaign || isFormDisabled}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
