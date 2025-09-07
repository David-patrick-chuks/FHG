'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';

interface ApiDocsEndpointsProps {
  searchQuery: string;
  activeEndpoint?: string;
}

export function ApiDocsEndpoints({ searchQuery, activeEndpoint }: ApiDocsEndpointsProps) {
  const extractRequestCode = `{
  "urls": [
    "https://example.com",
    "https://another-site.com"
  ],
  "extractionType": "multiple"
}`;

  const extractResponseCode = `{
  "success": true,
  "message": "Email extraction started successfully",
  "data": {
    "jobId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "urls": ["https://example.com"],
    "extractionType": "multiple",
    "status": "processing"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}`;

  const getExtractionResponseCode = `{
  "success": true,
  "message": "Extraction retrieved successfully",
  "data": {
    "jobId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:01:00.000Z",
    "totalUrls": 1,
    "totalEmails": 3,
    "results": [
      {
        "url": "https://example.com",
        "status": "completed",
        "emailCount": 3,
        "emails": [
          "contact@example.com",
          "info@example.com",
          "support@example.com"
        ],
        "extractedAt": "2024-01-01T00:01:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-01T00:01:00.000Z"
}`;

  const csvResponseCode = `URL,Email,Status,Extracted At
"https://example.com","contact@example.com","completed","2024-01-01T00:01:00.000Z"
"https://example.com","info@example.com","completed","2024-01-01T00:01:00.000Z"`;

  const usageResponseCode = `{
  "success": true,
  "message": "API usage retrieved successfully",
  "data": {
    "limits": {
      "dailyExtractionLimit": 1000,
      "canUseCsvUpload": true,
      "planName": "pro",
      "isUnlimited": false
    },
    "usage": {
      "used": 25,
      "remaining": 975,
      "resetTime": "2024-01-02T00:00:00.000Z",
      "limit": 1000
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}`;

  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('extract endpoints usage download')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  const renderEndpoint = () => {
    switch (activeEndpoint) {
      case 'extract':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">POST</Badge>
                /extract
              </CardTitle>
              <CardDescription>
                Start email extraction from one or more URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <CodeBlock
                  code={extractRequestCode}
                  language="json"
                  id="extract-request"
                />
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <CodeBlock
                  code={extractResponseCode}
                  language="json"
                  id="extract-response"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 'get-extraction':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">GET</Badge>
                /extract/{`{jobId}`}
              </CardTitle>
              <CardDescription>
                Get extraction status and results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <CodeBlock
                  code={getExtractionResponseCode}
                  language="json"
                  id="get-extraction-response"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 'download':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">GET</Badge>
                /extract/{`{jobId}`}/download
              </CardTitle>
              <CardDescription>
                Download extraction results as CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Returns a CSV file with the following format:
                </p>
                <CodeBlock
                  code={csvResponseCode}
                  language="csv"
                  id="csv-response"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 'usage':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">GET</Badge>
                /usage
              </CardTitle>
              <CardDescription>
                Get your API usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <CodeBlock
                  code={usageResponseCode}
                  language="json"
                  id="usage-response"
                />
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Choose an endpoint to see detailed documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">POST</Badge>
                      <span className="font-semibold">/extract</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Start email extraction from URLs
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'extract'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">GET</Badge>
                      <span className="font-semibold">/extract/{`{jobId}`}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Get extraction status and results
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'get-extraction'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">GET</Badge>
                      <span className="font-semibold">/extract/{`{jobId}`}/download</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Download results as CSV
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'download'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">GET</Badge>
                      <span className="font-semibold">/usage</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Get API usage and limits
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'usage'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderEndpoint()}
    </div>
  );
}
