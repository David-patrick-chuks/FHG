'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatVariableSyntax } from '@/lib/utils/variableValidation';
import { TEMPLATE_VALIDATION_RULES } from '@/lib/utils/templateValidation';
import { CreateTemplateRequest, TemplateSample } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TemplateSamplesProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

export function TemplateSamples({ formData, setFormData }: TemplateSamplesProps) {
  const [newSample, setNewSample] = useState({ subject: '', body: '' });

  // Validation for new sample
  const isSubjectValid = newSample.subject.length <= TEMPLATE_VALIDATION_RULES.samples.subject.maxLength;
  const isBodyValid = newSample.body.length <= TEMPLATE_VALIDATION_RULES.samples.body.maxLength;
  const canAddSample = newSample.subject.trim() && 
                      newSample.body.trim() && 
                      isSubjectValid && 
                      isBodyValid && 
                      formData.samples.length < 100;

  const addSample = () => {
    if (formData.samples.length >= 100) {
      toast.error('Maximum 100 samples allowed per template');
      return;
    }

    if (canAddSample) {
      // Format variable syntax before adding
      const formattedSubject = formatVariableSyntax(newSample.subject.trim());
      const formattedBody = formatVariableSyntax(newSample.body.trim());
      
      const sample: TemplateSample = {
        _id: Date.now().toString(),
        subject: formattedSubject,
        body: formattedBody,
        createdAt: new Date()
      };

      setFormData(prev => ({
        ...prev,
        samples: [...prev.samples, sample]
      }));

      setNewSample({ subject: '', body: '' });
      
      // Show toast if formatting was applied
      if (formattedSubject !== newSample.subject.trim() || formattedBody !== newSample.body.trim()) {
        toast.success('Variable syntax automatically formatted');
      }
    }
  };

  const removeSample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      samples: prev.samples.filter((_, i) => i !== index)
    }));
  };

  const updateSample = (index: number, field: 'subject' | 'body', value: string) => {
    setFormData(prev => ({
      ...prev,
      samples: prev.samples.map((sample, i) => 
        i === index ? { ...sample, [field]: value } : sample
      )
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Email Samples
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Add 10-100 email samples that demonstrate your template. The AI will learn from these patterns to generate personalized messages.
        </p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Add New Sample */}
        <div className="space-y-4 p-4 sm:p-6 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="sample-subject" className="text-sm font-medium">Subject Line</Label>
                <span className={`text-xs ${isSubjectValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {newSample.subject.length}/{TEMPLATE_VALIDATION_RULES.samples.subject.maxLength}
                </span>
              </div>
              <Input
                id="sample-subject"
                placeholder="e.g., Quick question about your business"
                value={newSample.subject}
                onChange={(e) => setNewSample(prev => ({ ...prev, subject: e.target.value }))}
                className={`h-10 sm:h-11 text-sm sm:text-base ${
                  isSubjectValid 
                    ? 'border-blue-200 focus:border-blue-500' 
                    : 'border-red-300 focus:border-red-500'
                }`}
              />
              {!isSubjectValid && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Subject line must be {TEMPLATE_VALIDATION_RULES.samples.subject.maxLength} characters or less
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="sample-body" className="text-sm font-medium">Email Body</Label>
                <span className={`text-xs ${isBodyValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {newSample.body.length}/{TEMPLATE_VALIDATION_RULES.samples.body.maxLength}
                </span>
              </div>
              <Textarea
                id="sample-body"
                placeholder="Enter the email content..."
                rows={6}
                value={newSample.body}
                onChange={(e) => setNewSample(prev => ({ ...prev, body: e.target.value }))}
                className={`text-sm sm:text-base ${
                  isBodyValid 
                    ? 'border-blue-200 focus:border-blue-500' 
                    : 'border-red-300 focus:border-red-500'
                }`}
              />
              {!isBodyValid && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Email body must be {TEMPLATE_VALIDATION_RULES.samples.body.maxLength} characters or less
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            onClick={addSample}
            disabled={!canAddSample}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-10 sm:h-11 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            {formData.samples.length >= 100 ? 'Maximum Reached' : 'Add Sample'}
          </Button>
        </div>

        {/* Existing Samples */}
        {formData.samples.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm sm:text-base">
              Samples ({formData.samples.length}/100)
            </h4>
            {formData.samples.map((sample, index) => (
              <div key={sample._id} className="border border-blue-200 dark:border-blue-800 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h5 className="font-medium text-sm sm:text-base">Sample {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSample(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-fit self-end sm:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <Input
                        value={sample.subject}
                        onChange={(e) => updateSample(index, 'subject', e.target.value)}
                        placeholder="Subject line"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Body</Label>
                      <Textarea
                        value={sample.body}
                        onChange={(e) => updateSample(index, 'body', e.target.value)}
                        rows={4}
                        placeholder="Email content"
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Validation Message */}
        {formData.samples.length < 10 && (
          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Minimum 10 samples required.</strong> You need {10 - formData.samples.length} more samples to create this template.
            </p>
          </div>
        )}

        {formData.samples.length >= 10 && formData.samples.length < 100 && (
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Great! You have {formData.samples.length} samples. You can add up to 100 samples total.
            </p>
          </div>
        )}

        {formData.samples.length >= 100 && (
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🎯 Maximum reached! You have {formData.samples.length} samples. This is the maximum allowed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
