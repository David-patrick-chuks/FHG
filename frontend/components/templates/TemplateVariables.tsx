'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreateTemplateRequest, TemplateVariable } from '@/types';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface TemplateVariablesProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

export function TemplateVariables({ formData, setFormData }: TemplateVariablesProps) {
  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    key: '',
    value: '',
    required: false
  });

  const addVariable = () => {
    if (newVariable.key.trim() && newVariable.value.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({ key: '', value: '', required: false });
    }
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Variables
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Define variables that can be replaced in your email content
        </p>
      </div>

      {/* Variable Usage Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          How to Use Variables
        </h4>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-medium mb-1">1. Declare Variables:</p>
            <p>Add variables below (e.g., <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">name</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">company</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">product</code>)</p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Use in Email Content:</p>
            <p>Wrap variable names in double curly braces: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{`{{name}}`}</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{`{{company}}`}</code></p>
          </div>
          <div>
            <p className="font-medium mb-1">3. Example Usage:</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3 font-mono text-xs">
              <div>Subject: Quick question about {`{{company}}`}</div>
              <div className="mt-1">Hi {`{{name}}`},</div>
              <div className="mt-1">I noticed {`{{company}}`} is using {`{{product}}`}...</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="variableKey" className="text-sm font-medium">Variable Key</Label>
          <Input
            id="variableKey"
            value={newVariable.key}
            onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
            placeholder="e.g., name, product"
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variableValue" className="text-sm font-medium">Default Value</Label>
          <Input
            id="variableValue"
            value={newVariable.value}
            onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
            placeholder="e.g., there, our solution"
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Required</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newVariable.required}
              onCheckedChange={(checked) => setNewVariable(prev => ({ ...prev, required: checked }))}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={addVariable}
        disabled={!newVariable.key.trim() || !newVariable.value.trim()}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-10 sm:h-11 text-sm sm:text-base"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Variable
      </Button>

      {formData.variables.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Added Variables</Label>
          <div className="space-y-2">
            {formData.variables.map((variable, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-800 rounded-lg backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="font-medium text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                    {`{{${variable.key}}}`}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    = "{variable.value}"
                  </span>
                  {variable.required && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs w-fit">
                      Required
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 w-fit self-end sm:self-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
