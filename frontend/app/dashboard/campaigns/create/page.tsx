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
    canProceedToStep4,
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
    { id: 4, title: 'Schedule & Timing', description: 'Set when and how often to send emails' }
  ];

  return (
    <DashboardLayout
      title="Create New Campaign"
      description="Build your email campaign step by step with AI-powered automation"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/campaigns')}
          className="flex items-center gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>
      }
    >
      <div className="space-y-4 lg:space-y-6">
        {/* Progress Steps */}
        <div className="px-2 lg:px-0">
          <CampaignProgressSteps steps={steps} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="space-y-4 lg:space-y-6 px-2 lg:px-0">
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
              
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isFormDisabled}
                  className="h-11 sm:h-12 px-4 sm:px-6 order-2 sm:order-1 text-sm sm:text-base border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={isFormDisabled || !formData.templateId}
                  className="h-11 sm:h-12 px-4 sm:px-6 order-1 sm:order-2 text-sm sm:text-base bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
              canProceed={canProceedToStep4}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
              userSubscription={user?.subscription || 'free'}
            />
          )}

          {/* Step 4: Schedule & Timing */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
              
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  disabled={isFormDisabled}
                  className="h-11 sm:h-12 px-4 sm:px-6 lg:px-8 order-2 sm:order-1 text-sm sm:text-base border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Target Audience</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                
                <Button
                  onClick={handleCreateCampaign}
                  disabled={!canCreateCampaign || isFormDisabled}
                  className="h-11 sm:h-12 px-4 sm:px-6 lg:px-8 order-1 sm:order-2 text-sm sm:text-base bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
