'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiDocsQuickStart } from './ApiDocsQuickStart';
import { CodeBlock } from './CodeBlock';

interface ApiDocsOverviewProps {
  searchQuery: string;
}

export function ApiDocsOverview({ searchQuery }: ApiDocsOverviewProps) {
  const baseUrlCode = "https://your-domain.com/api/v1";
  const responseFormatCode = `{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}`;
  const errorFormatCode = `{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`;

  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('overview base url response format error format')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  return (
    <div className="space-y-6">
      <div id="quick-start">
        <ApiDocsQuickStart />
      </div>
      
      <Card id="api-overview">
        <CardHeader>
          <CardTitle>API Overview</CardTitle>
          <CardDescription>
            MailQuill API provides powerful email extraction capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVisible('base url') && (
            <div id="base-url">
              <h3 className="font-semibold mb-2">Base URL</h3>
              <CodeBlock
                code={baseUrlCode}
                language="text"
                id="base-url-code"
              />
            </div>
          )}
          
          {isVisible('response format') && (
            <div id="response-format">
              <h3 className="font-semibold mb-2">Response Format</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                All API responses are in JSON format with the following structure:
              </p>
              <CodeBlock
                code={responseFormatCode}
                language="json"
                id="response-format-code"
              />
            </div>
          )}

          {isVisible('error format') && (
            <div id="error-format">
              <h3 className="font-semibold mb-2">Error Format</h3>
              <CodeBlock
                code={errorFormatCode}
                language="json"
                id="error-format-code"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
