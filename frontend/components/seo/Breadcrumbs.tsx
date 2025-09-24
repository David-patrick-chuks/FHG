'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbJsonLd } from './JsonLd';

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Add home as first item if not present
  const breadcrumbItems = items[0]?.url === '/' ? items : [
    { name: 'Home', url: '/' },
    ...items
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              )}
              {item.current ? (
                <span 
                  className="font-medium text-gray-900 dark:text-white"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {item.url === '/' ? (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {item.name}
                    </div>
                  ) : (
                    item.name
                  )}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Pre-built breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  home: [],
  pricing: [
    { name: 'Pricing', url: '/pricing', current: true }
  ],
  features: [
    { name: 'Features', url: '/features', current: true }
  ],
  about: [
    { name: 'About', url: '/about', current: true }
  ],
  contact: [
    { name: 'Contact', url: '/contact', current: true }
  ],
  help: [
    { name: 'Help Center', url: '/help-center', current: true }
  ],
  apiDocs: [
    { name: 'API Documentation', url: '/api-docs', current: true }
  ],
  privacy: [
    { name: 'Privacy Policy', url: '/privacy', current: true }
  ],
  terms: [
    { name: 'Terms of Service', url: '/terms', current: true }
  ],
  blog: [
    { name: 'Blog', url: '/blog', current: true }
  ],
  blogPost: (postTitle: string, postSlug: string) => [
    { name: 'Blog', url: '/blog' },
    { name: postTitle, url: `/blog/${postSlug}`, current: true }
  ],
  helpArticle: (articleTitle: string, articleSlug: string) => [
    { name: 'Help Center', url: '/help-center' },
    { name: articleTitle, url: `/help-center/${articleSlug}`, current: true }
  ],
};
