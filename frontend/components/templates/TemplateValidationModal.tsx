'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ValidationError } from '@/lib/utils/templateValidation';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

interface TemplateValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  onFixErrors: () => void;
}

export function TemplateValidationModal({
  isOpen,
  onClose,
  errors,
  onFixErrors
}: TemplateValidationModalProps) {
  // Group errors by field for better display
  const groupedErrors = errors.reduce((acc, error) => {
    const field = error.field.split('[')[0]; // Get base field name
    if (!acc[field]) {
      acc[field] = [];
    }
    acc[field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      name: 'Template Name',
      description: 'Description',
      useCase: 'Use Case',
      category: 'Category',
      industry: 'Industry',
      targetAudience: 'Target Audience',
      variables: 'Variables',
      tags: 'Tags',
      samples: 'Email Samples'
    };
    return fieldNames[field] || field;
  };

  const getFieldIcon = (field: string) => {
    const icons: Record<string, string> = {
      name: '📝',
      description: '📄',
      useCase: '🎯',
      category: '📂',
      industry: '🏭',
      targetAudience: '👥',
      variables: '🔧',
      tags: '🏷️',
      samples: '📧'
    };
    return icons[field] || '❌';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Template Validation Errors
          </DialogTitle>
          <DialogDescription>
            Please fix the following validation errors before creating your template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="font-semibold mb-2">
                {errors.length} validation error{errors.length !== 1 ? 's' : ''} found:
              </div>
              <div className="text-sm">
                The template cannot be created until all validation errors are resolved.
              </div>
            </AlertDescription>
          </Alert>

          {/* Grouped Errors */}
          <div className="space-y-4">
            {Object.entries(groupedErrors).map(([field, fieldErrors]) => (
              <div key={field} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getFieldIcon(field)}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {getFieldDisplayName(field)}
                  </h4>
                  <Badge variant="destructive" className="text-xs">
                    {fieldErrors.length} error{fieldErrors.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <ul className="space-y-2">
                  {fieldErrors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1">
                        <span className="text-gray-800 dark:text-gray-200">{error.message}</span>
                        {error.value && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Current value: </span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                              "{error.value}"
                            </code>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="font-semibold mb-1">Quick Tips:</div>
              <ul className="text-sm space-y-1">
                <li>• Description and Use Case must be at least 10 characters</li>
                <li>• Template name must be at least 2 characters</li>
                <li>• You need at least 10 email samples</li>
                <li>• Variable keys must be 1-50 characters</li>
                <li>• Each tag must be 30 characters or less</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          
          <Button
            onClick={onFixErrors}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Go Fix Errors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
