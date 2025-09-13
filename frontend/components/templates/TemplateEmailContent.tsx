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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">Email Content</h3>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="e.g., Follow up on our conversation about {{product}}"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Email Body *</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
          placeholder="Hi {{name}},\n\nI wanted to follow up on our conversation about {{product}} at {{company}}.\n\nBest regards,\n{{sender_name}}"
          rows={8}
          required
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use variables like {"{{variableName}}"} for dynamic content
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">Use Case *</Label>
        <Textarea
          id="useCase"
          value={formData.useCase}
          onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
          placeholder="Describe when and why to use this template..."
          rows={3}
          required
        />
      </div>
    </div>
  );
}
