'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Template } from '@/types';
import { AlertCircle } from 'lucide-react';

interface TemplateVariablesProps {
  template: Template;
  variableValues: Record<string, string>;
  validationErrors: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
}

export function TemplateVariables({ 
  template, 
  variableValues, 
  validationErrors, 
  onVariableChange 
}: TemplateVariablesProps) {
  if (!template.variables || template.variables.length === 0) {
    return null;
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Variables
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fill in these variables to customize your email
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {template.variables.map((variable, index) => (
            <div key={index} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label htmlFor={variable.key} className="text-sm font-medium">
                  <code className="text-xs sm:text-sm font-mono bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 px-2 py-1 rounded">
                    {`{{${variable.key}}}`}
                  </code>
                </Label>
                {variable.required && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs border-0 w-fit">
                    Required
                  </Badge>
                )}
              </div>
              <Input
                id={variable.key}
                value={variableValues[variable.key] || ''}
                onChange={(e) => onVariableChange(variable.key, e.target.value)}
                placeholder={variable.value}
                className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 ${
                  validationErrors[variable.key] 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-800 dark:focus:border-cyan-400'
                }`}
              />
              {validationErrors[variable.key] && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors[variable.key]}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {variable.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
