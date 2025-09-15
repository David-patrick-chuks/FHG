'use client';

import { EmailListManager } from '@/components/dashboard/campaigns/EmailListManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, SubscriptionTier } from '@/types';
import { ArrowLeft, Users } from 'lucide-react';

interface TargetAudienceStepProps {
  formData: {
    emailList: string;
    botId: string;
  };
  onFormDataChange: (data: Partial<TargetAudienceStepProps['formData']>) => void;
  bots: Bot[];
  uploadedEmails: string[];
  uploadedFileName: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearUploaded: () => void;
  isUploading: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isFormDisabled: boolean;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
  userSubscription: SubscriptionTier;
}

export function TargetAudienceStep({
  formData,
  onFormDataChange,
  bots,
  uploadedEmails,
  uploadedFileName,
  onFileUpload,
  onClearUploaded,
  isUploading,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  isFormDisabled,
  canProceed,
  onNext,
  onBack,
  userSubscription
}: TargetAudienceStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl">Target Audience</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
              Define who will receive your emails
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 border">
          <EmailListManager
            emailList={formData.emailList}
            onEmailListChange={(emails) => onFormDataChange({ emailList: emails })}
            uploadedEmails={uploadedEmails}
            uploadedFileName={uploadedFileName}
            onFileUpload={onFileUpload}
            onClearUploaded={onClearUploaded}
            isUploading={isUploading}
            isDragOver={isDragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            selectedBotEmailsRemaining={(() => {
              const selectedBot = bots.find(bot => bot._id === formData.botId);
              if (!selectedBot) return 500; // Default Gmail limit
              const emailsSentToday = selectedBot.emailsSentToday || 0;
              return Math.max(0, 500 - emailsSentToday);
            })()}
            disabled={isFormDisabled}
            userSubscription={userSubscription}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFormDisabled}
            className="h-11 sm:h-12 px-4 sm:px-6 order-2 sm:order-1 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Email Template</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed || isFormDisabled}
            className="h-11 sm:h-12 px-4 sm:px-8 order-1 sm:order-2 text-sm sm:text-base bg-green-600 hover:bg-green-700"
          >
            <span className="hidden sm:inline">Continue to Schedule & Timing</span>
            <span className="sm:hidden">Next</span>
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
