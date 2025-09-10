'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot, Plus } from 'lucide-react';

interface AIConfigurationStepProps {
  formData: {
    aiPrompt: string;
  };
  onFormDataChange: (data: Partial<AIConfigurationStepProps['formData']>) => void;
  isFormDisabled: boolean;
  creating: boolean;
  onBack: () => void;
  onCreateCampaign: () => void;
}

export function AIConfigurationStep({
  formData,
  onFormDataChange,
  isFormDisabled,
  creating,
  onBack,
  onCreateCampaign
}: AIConfigurationStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl">AI Configuration</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
              Configure how your AI bot will write emails
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="aiPrompt" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            AI Prompt <span className="text-gray-500 font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="aiPrompt"
            value={formData.aiPrompt}
            onChange={(e) => onFormDataChange({ aiPrompt: e.target.value })}
            placeholder="Describe the type of email you want the AI to generate...&#10;Example: Write a professional email introducing our new product to potential customers"
            rows={5}
            disabled={isFormDisabled}
            className="resize-none border border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  AI Prompt Guidelines
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Define how your bot writes emails. Be specific about tone, style, and goals. This field is optional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFormDisabled}
            className="h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Target Audience
          </Button>
          <Button
            onClick={onCreateCampaign}
            disabled={creating}
            className="h-12 px-8 bg-purple-600 hover:bg-purple-700"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating Campaign...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
