'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Template } from '@/types';
import { Check, Copy, FileText } from 'lucide-react';

interface TemplateSamplesProps {
  template: Template;
  copiedSample: number | null;
  onCopySample: (sample: any, index: number) => void;
}

export function TemplateSamples({ template, copiedSample, onCopySample }: TemplateSamplesProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Sample Emails
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Preview the actual email content and copy samples to your clipboard
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {template.samples?.map((sample, index) => (
            <div key={index} className="border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 sm:p-4 bg-gradient-to-br from-cyan-50/30 to-blue-50/30 dark:from-cyan-900/10 dark:to-blue-900/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h4 className="font-medium text-cyan-700 dark:text-cyan-300 text-sm sm:text-base">Sample {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopySample(sample, index)}
                  className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20 h-9 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
                >
                  {copiedSample === index ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    Subject:
                  </label>
                  <p className="mt-1 p-3 bg-white/50 dark:bg-gray-800/50 rounded border border-cyan-200 dark:border-cyan-800 text-sm sm:text-base">
                    {sample.subject}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    Body:
                  </label>
                  <div className="mt-1 p-3 bg-white/50 dark:bg-gray-800/50 rounded border border-cyan-200 dark:border-cyan-800 whitespace-pre-wrap text-sm sm:text-base max-h-40 overflow-y-auto">
                    {sample.body}
                  </div>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8">
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                <FileText className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No samples available</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">This template doesn't have sample emails</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
