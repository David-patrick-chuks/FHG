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
    <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl rounded-lg p-4 sm:p-6">
      {/* Mobile: Vertical layout */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
            Step {currentStep} of {steps.length}
          </div>
        </div>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                currentStep >= step.id 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium transition-colors block ${
                  currentStep >= step.id 
                    ? 'text-cyan-700 dark:text-cyan-300' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </span>
                <span className={`text-xs transition-colors ${
                  currentStep >= step.id 
                    ? 'text-cyan-600 dark:text-cyan-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep >= step.id 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-sm font-medium transition-colors ${
                currentStep >= step.id 
                  ? 'text-cyan-700 dark:text-cyan-300' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ml-4 transition-all duration-300 ${
                  currentStep > step.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
          Step {currentStep} of {steps.length}
        </div>
      </div>
    </div>
  );
}
