'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TemplatesAPI } from '@/lib/api/templates';
import { CreateTemplateRequest } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { TemplateBasicInfo } from './TemplateBasicInfo';
import { TemplateSamples } from './TemplateSamples';
import { TemplateTags } from './TemplateTags';
import { TemplateVariables } from './TemplateVariables';

interface CreateTemplateFormProps {
  initialData?: Partial<CreateTemplateRequest>;
  onTemplateCreated?: (template: any) => void;
  isEditMode?: boolean;
  templateId?: string;
  isCloned?: boolean;
}

export function CreateTemplateForm({ 
  initialData, 
  onTemplateCreated,
  isEditMode = false,
  templateId,
  isCloned = false
}: CreateTemplateFormProps) {
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
                           formData.samples.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      let response;
      if (isEditMode && templateId) {
        response = await TemplatesAPI.updateTemplate(templateId, formData);
      } else {
        response = await TemplatesAPI.createTemplate(formData);
      }
      
      if (response.success && response.data) {
        const successMessage = isEditMode ? 'Template updated successfully!' : 'Template created successfully!';
        toast.success(successMessage);
        
        if (onTemplateCreated) {
          onTemplateCreated(response.data);
        } else {
          router.push('/dashboard/templates');
        }
      } else {
        const errorMessage = isEditMode ? 'Failed to update template' : 'Failed to create template';
        toast.error(response.message || errorMessage);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} template:`, error);
      const errorMessage = isEditMode ? 'Failed to update template. Please try again.' : 'Failed to create template. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <TemplateBasicInfo formData={formData} setFormData={setFormData} />
      
      <TemplateSamples formData={formData} setFormData={setFormData} />
      
      <TemplateVariables formData={formData} setFormData={setFormData} />
      
      <TemplateTags formData={formData} setFormData={setFormData} />

      {/* Public Template Option - Only show if not cloned */}
      {!isCloned && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300">Make this template public</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Public templates are available to all users after admin approval
            </p>
          </div>
          <Switch
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/templates')}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canCreateTemplate || isLoading}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base order-1 sm:order-2"
        >
          {isLoading 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Template' : 'Create Template')
          }
        </Button>
      </div>
    </form>
  );
}
