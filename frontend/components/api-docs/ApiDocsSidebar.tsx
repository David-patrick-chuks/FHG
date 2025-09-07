'use client';

import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

interface ApiDocsSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

interface NavItem {
  id: string;
  title: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'overview',
    title: 'Overview'
  },
  {
    id: 'authentication',
    title: 'Authentication'
  },
  {
    id: 'endpoints',
    title: 'Endpoints',
    children: [
      { id: 'extract', title: 'POST /extract' },
      { id: 'get-extraction', title: 'GET /extract/{jobId}' },
      { id: 'download', title: 'GET /extract/{jobId}/download' },
      { id: 'usage', title: 'GET /usage' }
    ]
  },
  {
    id: 'examples',
    title: 'Examples',
    children: [
      { id: 'curl', title: 'cURL' },
      { id: 'javascript', title: 'JavaScript' },
      { id: 'python', title: 'Python' }
    ]
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits'
  },
  {
    id: 'guides',
    title: 'Guides',
    children: [
      { id: 'getting-started', title: 'Getting Started' },
      { id: 'best-practices', title: 'Best Practices' },
      { id: 'error-handling', title: 'Error Handling' },
      { id: 'webhooks', title: 'Webhooks' }
    ]
  }
];

export function ApiDocsSidebar({ 
  activeSection, 
  setActiveSection, 
  searchQuery, 
  setSearchQuery 
}: ApiDocsSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['endpoints', 'examples']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string) => {
    setActiveSection(itemId);
  };

  const filteredItems = navigationItems.filter(item => 
    !searchQuery || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-4 lg:pt-6 pb-4 mb-4 lg:mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
            ⌘K
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 pr-2">
        {filteredItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.id);
                } else {
                  handleItemClick(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{item.title}</span>
              {item.children && (
                expandedItems.includes(item.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
            </button>
            
            {item.children && expandedItems.includes(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleItemClick(child.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === child.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {child.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        </nav>

        {/* Quick Links */}
        <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Links
          </h3>
          <div className="space-y-2">
            <a
              href="/signup"
              className="block px-3 pb-5 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            >
              Get API Key
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
