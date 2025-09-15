'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateTemplateRequest } from '@/types';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface TemplateTagsProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

export function TemplateTags({ formData, setFormData }: TemplateTagsProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Tags
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Add tags to help categorize and find your template
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag..."
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          className="h-10 sm:h-11 text-sm sm:text-base flex-1"
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={!newTag.trim()}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-10 sm:h-11 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {formData.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1 text-xs sm:text-sm">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title={`Remove ${tag} tag`}
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
