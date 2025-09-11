'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/types';
import { FileText, Star, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  loading?: boolean;
}

export function TemplateSelector({ 
  templates, 
  selectedTemplateId, 
  onTemplateSelect, 
  loading = false 
}: TemplateSelectorProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Templates Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No templates with at least 10 samples are available. Please create a template first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Select Email Template
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a template to use for your campaign. The AI will generate 20 variations of each sample (minimum 10 samples required).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template._id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedTemplateId === template._id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
            )}
            onClick={() => onTemplateSelect(template._id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                {selectedTemplateId === template._id && (
                  <div className="ml-2">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Template Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {template.samples.length} samples
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {template.rating.average.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {template.usageCount} uses
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.category.replace('_', ' ')}
                  </Badge>
                  {template.industry && (
                    <Badge variant="outline" className="text-xs">
                      {template.industry}
                    </Badge>
                  )}
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 2} more
                    </Badge>
                  )}
                </div>

                {/* AI Generation Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>AI Generation:</strong> {template.samples.length} samples × 20 variations = {template.samples.length * 20} unique emails
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplateId && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Template selected! The AI will cycle through all samples and generate 20 variations of each.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
