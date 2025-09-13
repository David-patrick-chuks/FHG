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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">Variables</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Define variables that can be replaced in your email content
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="variableKey">Variable Key</Label>
          <Input
            id="variableKey"
            value={newVariable.key}
            onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
            placeholder="e.g., name, product"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variableValue">Default Value</Label>
          <Input
            id="variableValue"
            value={newVariable.value}
            onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
            placeholder="e.g., there, our solution"
          />
        </div>

        <div className="space-y-2">
          <Label>Required</Label>
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
        className="bg-cyan-600 hover:bg-cyan-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Variable
      </Button>

      {formData.variables.length > 0 && (
        <div className="space-y-2">
          <Label>Added Variables</Label>
          <div className="space-y-2">
            {formData.variables.map((variable, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-cyan-600 dark:text-cyan-400">
                    {`{{${variable.key}}}`}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    = "{variable.value}"
                  </span>
                  {variable.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
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
