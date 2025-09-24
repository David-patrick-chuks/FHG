'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { TemplatesAPI } from '@/lib/api/templates';
import { validateTemplateData, ValidationError } from '@/lib/utils/templateValidation';
import { validateTemplateVariables, VariableValidationResult } from '@/lib/utils/variableValidation';
import { CreateTemplateRequest } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { TemplateBasicInfo } from './TemplateBasicInfo';
import { TemplateSamples } from './TemplateSamples';
import { TemplateTags } from './TemplateTags';
import { TemplateValidationModal } from './TemplateValidationModal';
import { TemplateVariables } from './TemplateVariables';
import { VariableValidationModal } from './VariableValidationModal';

interface CreateTemplateFormProps {
  initialData?: Partial<CreateTemplateRequest>;
  onTemplateCreated?: (template: any) => void;
  isEditMode?: boolean;
  templateId?: string;
  isCloned?: boolean;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

export function CreateTemplateForm({ 
  initialData, 
  onTemplateCreated,
  isEditMode = false,
  templateId,
  isCloned = false,
  onUnsavedChangesChange
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
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<VariableValidationResult | null>(null);
  const [showTemplateValidationModal, setShowTemplateValidationModal] = useState(false);
  const [templateValidationErrors, setTemplateValidationErrors] = useState<ValidationError[]>([]);

  // Track initial data for unsaved changes detection
  const initialFormData = useRef<CreateTemplateRequest>({
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

  // Update initial data when initialData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      initialFormData.current = {
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
      };
    }
  }, [initialData, isEditMode]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditMode) return false;
    
    return JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
  }, [formData, isEditMode]);

  // Notify parent component about unsaved changes
  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  // Function to reset initial data (call this after successful update)
  const resetInitialData = () => {
    initialFormData.current = { ...formData };
  };

  // Validation
  const canCreateTemplate = formData.name.trim() && 
                           formData.description.trim() && 
                           formData.useCase.trim() && 
                           formData.category &&
                           formData.samples.length > 0;

  // Validate template data before submission
  const validateTemplate = (): boolean => {
    // First validate basic template data
    const templateValidation = validateTemplateData(formData);
    if (!templateValidation.isValid) {
      setTemplateValidationErrors(templateValidation.errors);
      setShowTemplateValidationModal(true);
      return false;
    }

    // Then validate variables if samples exist
    if (formData.samples.length > 0) {
      const variableResult = validateTemplateVariables(formData.samples, formData.variables);
      setValidationResult(variableResult);
      
      if (!variableResult.isValid || variableResult.warnings.length > 0) {
        setShowValidationModal(true);
        return false;
      }
    }
    
    return true;
  };

  // Apply formatting to samples
  const applyFormatting = () => {
    if (!validationResult) return;
    
    setFormData(prev => ({
      ...prev,
      samples: prev.samples.map((sample, index) => ({
        ...sample,
        subject: validationResult.formattedSamples[index]?.subject || sample.subject,
        body: validationResult.formattedSamples[index]?.body || sample.body
      }))
    }));
    
    setShowValidationModal(false);
    toast.success('Variable formatting applied successfully');
  };

  // Ignore validation and continue
  const ignoreValidation = () => {
    setShowValidationModal(false);
    // Continue with form submission
    submitForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate template data before submission
    if (!validateTemplate()) {
      return; // Validation modal will be shown
    }

    // If validation passes, submit the form
    submitForm();
  };

  const submitForm = async () => {
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
        
        // Reset initial data after successful update to prevent unsaved changes detection
        if (isEditMode) {
          resetInitialData();
        }
        
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
            <CardDescription>
              Basic details about your email template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateBasicInfo formData={formData} setFormData={setFormData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Template Variables</CardTitle>
            <CardDescription>
              Define variables that can be customized in your template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateVariables formData={formData} setFormData={setFormData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Samples</CardTitle>
            <CardDescription>
              Create sample emails using your template and variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateSamples formData={formData} setFormData={setFormData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tags & Settings</CardTitle>
            <CardDescription>
              Add tags and configure template settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateTags formData={formData} setFormData={setFormData} />
            
            {/* Public Template Option - Only show if not cloned */}
            {!isCloned && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg mt-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Make this template public</h4>
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
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/templates')}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canCreateTemplate || isLoading}
            className="order-1 sm:order-2"
          >
            {isLoading 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update Template' : 'Create Template')
            }
          </Button>
        </div>
      </form>

      {/* Template Validation Modal */}
      <TemplateValidationModal
        isOpen={showTemplateValidationModal}
        onClose={() => setShowTemplateValidationModal(false)}
        errors={templateValidationErrors}
        onFixErrors={() => setShowTemplateValidationModal(false)}
      />

      {/* Variable Validation Modal */}
      {validationResult && (
        <VariableValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          validationResult={validationResult}
          onApplyFormatting={applyFormatting}
          onIgnore={ignoreValidation}
        />
      )}
    </div>
  );
}
