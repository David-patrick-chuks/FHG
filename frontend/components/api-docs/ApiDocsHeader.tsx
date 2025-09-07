'use client';

import { Badge } from '@/components/ui/badge';
import { Key, Zap } from 'lucide-react';

export function ApiDocsHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          MailQuill API
        </h1>
      </div>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Powerful email extraction API for developers. Extract emails from websites with our advanced AI-powered engine.
      </p>
      <div className="flex items-center justify-center gap-4 mt-6">
        <Badge variant="secondary" className="px-4 py-2">
          <Key className="h-4 w-4 mr-2" />
          API Key Required
        </Badge>
        <Badge variant="secondary" className="px-4 py-2">
          <Zap className="h-4 w-4 mr-2" />
          Rate Limited
        </Badge>
      </div>
    </div>
  );
}
