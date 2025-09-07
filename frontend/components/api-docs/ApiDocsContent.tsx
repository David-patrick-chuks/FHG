'use client';

import { ApiDocsAuthentication } from './ApiDocsAuthentication';
import { ApiDocsEndpoints } from './ApiDocsEndpoints';
import { ApiDocsExamples } from './ApiDocsExamples';
import { ApiDocsGuides } from './ApiDocsGuides';
import { ApiDocsOverview } from './ApiDocsOverview';
import { ApiDocsRateLimits } from './ApiDocsRateLimits';

interface ApiDocsContentProps {
  activeSection: string;
  searchQuery: string;
}

export function ApiDocsContent({ activeSection, searchQuery }: ApiDocsContentProps) {
  const getPageTitle = () => {
    switch (activeSection) {
      case 'overview': return 'API Overview';
      case 'authentication': return 'Authentication';
      case 'extract': return 'POST /extract';
      case 'get-extraction': return 'GET /extract/{jobId}';
      case 'download': return 'GET /extract/{jobId}/download';
      case 'usage': return 'GET /usage';
      case 'curl': return 'cURL Example';
      case 'javascript': return 'JavaScript Example';
      case 'python': return 'Python Example';
      case 'rate-limits': return 'Rate Limits';
      default: return 'API Documentation';
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = ['API Documentation'];
    
    if (activeSection === 'extract' || activeSection === 'get-extraction' || activeSection === 'download' || activeSection === 'usage') {
      breadcrumbs.push('Endpoints');
    } else if (activeSection === 'curl' || activeSection === 'javascript' || activeSection === 'python') {
      breadcrumbs.push('Examples');
    }
    
    breadcrumbs.push(getPageTitle());
    return breadcrumbs.join(' > ');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ApiDocsOverview searchQuery={searchQuery} />;
      case 'authentication':
        return <ApiDocsAuthentication searchQuery={searchQuery} />;
      case 'endpoints':
        return <ApiDocsEndpoints searchQuery={searchQuery} activeEndpoint={undefined} />;
      case 'extract':
      case 'get-extraction':
      case 'download':
      case 'usage':
        return <ApiDocsEndpoints searchQuery={searchQuery} activeEndpoint={activeSection} />;
      case 'examples':
        return <ApiDocsExamples searchQuery={searchQuery} activeExample={undefined} />;
      case 'curl':
      case 'javascript':
      case 'python':
        return <ApiDocsExamples searchQuery={searchQuery} activeExample={activeSection} />;
      case 'rate-limits':
        return <ApiDocsRateLimits searchQuery={searchQuery} />;
      case 'getting-started':
      case 'best-practices':
      case 'error-handling':
      case 'webhooks':
        return <ApiDocsGuides searchQuery={searchQuery} activeGuide={activeSection} />;
      default:
        return <ApiDocsOverview searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Breadcrumbs */}
      <div className="mb-4 lg:mb-6">
        <nav className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
          {getBreadcrumbs()}
        </nav>
      </div>

      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none prose-sm lg:prose-base">
        {renderContent()}
      </div>
    </div>
  );
}
