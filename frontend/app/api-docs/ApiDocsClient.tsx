'use client';

import { ApiDocsContent, ApiDocsSidebar } from '@/components/api-docs';
import { useState } from 'react';

export function ApiDocsClient() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                API Documentation
              </span>
            </div>
            <div className="flex items-center">
              <a 
                href="/signup" 
                className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-16 h-auto lg:h-screen overflow-y-auto">
              <ApiDocsSidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="py-4 lg:py-6 pb-8 lg:pb-16">
              <ApiDocsContent 
                activeSection={activeSection}
                searchQuery={searchQuery}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
