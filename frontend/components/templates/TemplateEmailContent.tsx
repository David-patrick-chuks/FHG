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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Email Content
        </h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-cyan-700 dark:text-cyan-300 font-medium">
          Subject Line *
        </Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="e.g., Follow up on our conversation about {{product}}"
          required
          className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-cyan-700 dark:text-cyan-300 font-medium">
          Email Body *
        </Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
          placeholder="Hi {{name}},\n\nI wanted to follow up on our conversation about {{product}} at {{company}}.\n\nBest regards,\n{{sender_name}}"
          rows={8}
          required
          className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400 transition-all duration-200"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use variables like {"{{variableName}}"} for dynamic content
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase" className="text-cyan-700 dark:text-cyan-300 font-medium">
          Use Case *
        </Label>
        <Textarea
          id="useCase"
          value={formData.useCase}
          onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
          placeholder="Describe when and why to use this template..."
          rows={3}
          required
          className="border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400 transition-all duration-200"
        />
      </div>
    </div>
  );
}
