'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateTemplateRequest } from '@/types';

interface TemplateEmailContentProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

export function TemplateEmailContent({ formData, setFormData }: TemplateEmailContentProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Email Content
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Define the main email template content and use case
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
          Subject Line *
        </Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="e.g., Follow up on our conversation about {{product}}"
          required
          className="h-10 sm:h-11 text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
          Email Body *
        </Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
          placeholder="Hi {{name}},\n\nI wanted to follow up on our conversation about {{product}} at {{company}}.\n\nBest regards,\n{{sender_name}}"
          rows={8}
          required
          className="text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
        />
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Use variables like {"{{variableName}}"} for dynamic content
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
          Use Case *
        </Label>
        <Textarea
          id="useCase"
          value={formData.useCase}
          onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
          placeholder="Describe when and why to use this template..."
          rows={3}
          required
          className="text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
        />
      </div>
    </div>
  );
}
