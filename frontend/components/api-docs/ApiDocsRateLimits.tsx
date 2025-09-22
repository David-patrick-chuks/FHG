'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';

interface ApiDocsRateLimitsProps {
  searchQuery: string;
}

export function ApiDocsRateLimits({ searchQuery }: ApiDocsRateLimitsProps) {
  const rateLimitHeadersCode = `X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 975
X-RateLimit-Reset: 1704067200`;

  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('rate limits plan headers exceeded')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>
            API usage limits based on your subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVisible('plan') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Free Plan</h3>
                <div className="text-2xl font-bold text-blue-600 mb-1">100</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">extractions/day</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Pro Plan</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">1,000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">extractions/day</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Enterprise</h3>
                <div className="text-2xl font-bold text-purple-600 mb-1">10,000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">extractions/day</div>
              </div>
            </div>
          )}

          {isVisible('headers') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📊 Rate Limit Headers
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                API responses include rate limit information in headers:
              </p>
              <CodeBlock
                code={rateLimitHeadersCode}
                language="text"
                id="rate-limit-headers"
              />
            </div>
          )}

          {isVisible('exceeded') && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Rate Limit Exceeded
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                When you exceed your rate limit, you'll receive a 429 status code. Limits reset daily at midnight UTC.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
