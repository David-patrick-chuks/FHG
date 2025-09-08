'use client';

import { CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface CampaignProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

export function CampaignProgressSteps({ steps, currentStep }: CampaignProgressStepsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className={`flex items-center space-x-4 transition-all duration-300 ${
              currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep > step.id 
                  ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25' 
                  : currentStep === step.id 
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="font-bold text-lg">{step.id}</span>
                )}
              </div>
              <div className="hidden lg:block">
                <p className={`font-semibold text-base transition-colors ${
                  currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className={`text-sm transition-colors ${
                  currentStep >= step.id ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${
                currentStep > step.id 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                  : 'bg-gray-200 dark:bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
