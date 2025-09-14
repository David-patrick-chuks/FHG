'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateTemplateRequest, TemplateSample } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TemplateSamplesProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

export function TemplateSamples({ formData, setFormData }: TemplateSamplesProps) {
  const [newSample, setNewSample] = useState({ subject: '', body: '' });

  const addSample = () => {
    if (newSample.subject.trim() && newSample.body.trim()) {
      const sample: TemplateSample = {
        _id: Date.now().toString(),
        subject: newSample.subject.trim(),
        body: newSample.body.trim(),
        createdAt: new Date()
      };

      setFormData(prev => ({
        ...prev,
        samples: [...prev.samples, sample]
      }));

      setNewSample({ subject: '', body: '' });
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
    <Card>
      <CardHeader>
        <CardTitle>Email Samples</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add 10-20 email samples that demonstrate your template. The AI will learn from these patterns to generate personalized messages.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Sample */}
        <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="sample-subject">Subject Line</Label>
              <Input
                id="sample-subject"
                placeholder="e.g., Quick question about your business"
                value={newSample.subject}
                onChange={(e) => setNewSample(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sample-body">Email Body</Label>
              <Textarea
                id="sample-body"
                placeholder="Enter the email content..."
                rows={6}
                value={newSample.body}
                onChange={(e) => setNewSample(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={addSample}
            disabled={!newSample.subject.trim() || !newSample.body.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample
          </Button>
        </div>

        {/* Existing Samples */}
        {formData.samples.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">
              Samples ({formData.samples.length}/20)
            </h4>
            {formData.samples.map((sample, index) => (
              <Card key={sample._id} className="border-l-4 border-l-cyan-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Sample {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSample(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={sample.subject}
                      onChange={(e) => updateSample(index, 'subject', e.target.value)}
                      placeholder="Subject line"
                    />
                  </div>
                  <div>
                    <Label>Body</Label>
                    <Textarea
                      value={sample.body}
                      onChange={(e) => updateSample(index, 'body', e.target.value)}
                      rows={4}
                      placeholder="Email content"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Validation Message */}
        {formData.samples.length < 10 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Minimum 10 samples required.</strong> You need {10 - formData.samples.length} more samples to create this template.
            </p>
          </div>
        )}

        {formData.samples.length >= 10 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Great! You have {formData.samples.length} samples. You can add up to 20 samples total.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
