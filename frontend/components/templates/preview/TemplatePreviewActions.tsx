'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

interface TemplatePreviewActionsProps {
  adding: boolean;
  onBack: () => void;
  onAddToTemplates: () => void;
}

export function TemplatePreviewActions({ adding, onBack, onAddToTemplates }: TemplatePreviewActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={onBack}
        className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-900/20 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base order-2 sm:order-1"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Back</span>
        <span className="sm:hidden">← Back</span>
      </Button>
      <Button
        onClick={onAddToTemplates}
        disabled={adding}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base order-1 sm:order-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{adding ? 'Adding...' : 'Add to My Templates'}</span>
        <span className="sm:hidden">{adding ? 'Adding...' : '+ Add'}</span>
      </Button>
    </div>
  );
}
