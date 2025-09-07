'use client';

import { ApiDocsContent, ApiDocsSidebar } from '@/components/api-docs';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  MailQuill
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  API Documentation
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/signup" 
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Get API Key
              </a>
              <a 
                href="/dashboard/profile" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Profile
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-16 h-screen overflow-y-auto">
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
            <div className="py-6 pb-16">
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
