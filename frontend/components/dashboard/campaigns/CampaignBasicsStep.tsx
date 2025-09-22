'use client';

import { CustomBotSelector } from '@/components/dashboard/campaigns/CustomBotSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot } from '@/types';
import { ArrowLeft, Mail } from 'lucide-react';

interface CampaignBasicsStepProps {
  formData: {
    name: string;
    description: string;
    botId: string;
  };
  onFormDataChange: (data: Partial<CampaignBasicsStepProps['formData']>) => void;
  bots: Bot[];
  botsLoading: boolean;
  isFormDisabled: boolean;
  onNext: () => void;
  canProceed: boolean;
}

export function CampaignBasicsStep({
  formData,
  onFormDataChange,
  bots,
  botsLoading,
  isFormDisabled,
  onNext,
  canProceed
}: CampaignBasicsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl">Campaign Basics</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
              Set up the foundation of your email campaign
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Campaign Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="e.g., Q1 Sales Outreach"
              disabled={isFormDisabled}
              className="h-11 sm:h-12 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose a descriptive name that reflects your campaign's purpose
            </p>
          </div>
          
          <CustomBotSelector
            bots={bots}
            selectedBotId={formData.botId}
            onBotSelect={(botId) => onFormDataChange({ botId })}
            isLoading={botsLoading}
            disabled={isFormDisabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Campaign Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Describe your campaign goals, target audience, and what you want to achieve..."
            rows={4}
            disabled={isFormDisabled}
            className="resize-none border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide context to help the AI understand your campaign objectives
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!canProceed || isFormDisabled}
            className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
          >
            <span className="hidden sm:inline">Continue to Email Template</span>
            <span className="sm:hidden">Next</span>
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
