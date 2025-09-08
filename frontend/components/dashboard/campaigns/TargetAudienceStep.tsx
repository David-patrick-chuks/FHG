'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailListManager } from '@/components/dashboard/campaigns/EmailListManager';
import { Bot } from '@/types';
import { ArrowLeft } from 'lucide-react';

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
  onBack
}: TargetAudienceStepProps) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/20">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">2</span>
          </div>
          <div>
            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              Target Audience
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
              Define who will receive your emails
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-gradient-to-br from-gray-50 to-green-50/50 dark:from-gray-700 dark:to-green-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
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
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFormDisabled}
            className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Basics
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed || isFormDisabled}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Continue to AI Configuration
            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
