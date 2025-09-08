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
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">3</span>
          </div>
          <div>
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              AI Configuration
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
              Configure how your AI bot will write emails
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
          <div className="space-y-6">
            <Label htmlFor="aiPrompt" className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-purple-500" />
              AI Prompt 
              <span className="text-purple-600 font-normal ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="aiPrompt"
              value={formData.aiPrompt}
              onChange={(e) => onFormDataChange({ aiPrompt: e.target.value })}
              placeholder="Describe the type of email you want the AI to generate...&#10;Example: Write a professional email introducing our new product to potential customers"
              rows={6}
              disabled={isFormDisabled}
              className={`border-2 resize-none text-base rounded-xl transition-all duration-200 ${
                isFormDisabled 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600'
                  : 'border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
              }`}
            />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                    AI Prompt Guidelines
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This prompt defines how your AI bot will write emails. Be specific about tone, style, and goals. 
                    <span className="font-semibold"> This field is optional and can be configured later.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFormDisabled}
            className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Target Audience
          </Button>
          <Button
            onClick={onCreateCampaign}
            disabled={creating}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                Creating Campaign...
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 mr-3" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
