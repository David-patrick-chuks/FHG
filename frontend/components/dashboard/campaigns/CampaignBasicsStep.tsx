'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BotSelector } from '@/components/dashboard/campaigns/BotSelector';
import { Bot } from '@/types';
import { ArrowLeft, Mail, Users } from 'lucide-react';

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
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">1</span>
          </div>
          <div>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Campaign Basics
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-1">
              Set up the foundation of your email campaign
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-blue-500" />
              Campaign Name 
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="e.g., Q1 Sales Outreach"
              disabled={isFormDisabled}
              className={`h-14 text-base border-2 rounded-xl transition-all duration-200 ${
                isFormDisabled 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600'
                  : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              }`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose a descriptive name that reflects your campaign's purpose
            </p>
          </div>
          
          <BotSelector
            bots={bots}
            selectedBotId={formData.botId}
            onBotSelect={(botId) => onFormDataChange({ botId })}
            isLoading={botsLoading}
            disabled={isFormDisabled}
          />
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <Users className="w-4 h-4 mr-2 text-purple-500" />
            Campaign Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Describe your campaign goals, target audience, and what you want to achieve..."
            rows={5}
            disabled={isFormDisabled}
            className={`border-2 rounded-xl resize-none transition-all duration-200 ${
              isFormDisabled 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
            }`}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide context to help the AI understand your campaign objectives
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!canProceed || isFormDisabled}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Continue to Target Audience
            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
