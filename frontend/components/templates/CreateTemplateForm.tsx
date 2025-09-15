'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TemplatesAPI } from '@/lib/api/templates';
import { CreateTemplateRequest } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { TemplateBasicInfo } from './TemplateBasicInfo';
import { TemplateEmailContent } from './TemplateEmailContent';
import { TemplateSamples } from './TemplateSamples';
import { TemplateTags } from './TemplateTags';
import { TemplateVariables } from './TemplateVariables';

interface CreateTemplateFormProps {
  initialData?: Partial<CreateTemplateRequest>;
}

export function CreateTemplateForm({ initialData }: CreateTemplateFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
    category: 'sales',
    industry: '',
    targetAudience: '',
    isPublic: false,
    useCase: '',
    variables: [],
    tags: [],
    samples: [],
    ...initialData
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const canCreateTemplate = formData.name.trim() && 
                           formData.description.trim() && 
                           formData.useCase.trim() && 
                           formData.category &&
                           formData.subject.trim() &&
                           formData.body.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await TemplatesAPI.createTemplate(formData);
      
      if (response.success && response.data) {
        toast.success('Template created successfully!');
        router.push('/dashboard/templates');
      } else {
        toast.error(response.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TemplateBasicInfo formData={formData} setFormData={setFormData} />
      
      <TemplateEmailContent formData={formData} setFormData={setFormData} />
      
      <TemplateVariables formData={formData} setFormData={setFormData} />
      
      <TemplateTags formData={formData} setFormData={setFormData} />

      {/* Public Template Option */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-cyan-800 rounded-lg">
        <div>
          <h4 className="font-medium text-cyan-700 dark:text-cyan-300">Make this template public</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Public templates are available to all users after admin approval
          </p>
        </div>
        <Switch
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/templates')}
          className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canCreateTemplate || isLoading}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? 'Creating...' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
