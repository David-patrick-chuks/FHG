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

  return (
    <div className="space-y-6">
      {/* Start Extraction */}
      {isVisible('extract') && (
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
      )}

      {/* Get Extraction */}
      {isVisible('extract') && (
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
      )}

      {/* Download Results */}
      {isVisible('download') && (
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
      )}

      {/* Get Usage */}
      {isVisible('usage') && (
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
      )}
    </div>
  );
}
