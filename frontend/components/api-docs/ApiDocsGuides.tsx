'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';

interface ApiDocsGuidesProps {
  searchQuery: string;
  activeGuide?: string;
}

export function ApiDocsGuides({ searchQuery, activeGuide }: ApiDocsGuidesProps) {
  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('guides getting started best practices error handling webhooks')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  const gettingStartedCode = `curl -X POST https://backend.agentworld.online/api/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "maxEmails": 100
  }'`;

  const bestPracticesCode = `// Good: Check rate limits before making requests
const checkLimits = async () => {
  const response = await fetch('/api/v1/usage', {
    headers: { 'Authorization': 'Bearer ' + apiKey }
  });
  const { remaining, limit } = await response.json();
  
  if (remaining < 10) {
    console.warn('Low API quota remaining');
  }
};

// Good: Implement retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};`;

  const errorHandlingCode = `// Handle different error types
try {
  const response = await fetch('/api/v1/extract', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: 'https://example.com' })
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 400:
        console.error('Bad Request:', error.message);
        break;
      case 401:
        console.error('Unauthorized: Check your API key');
        break;
      case 429:
        console.error('Rate Limited:', error.retryAfter);
        break;
      case 500:
        console.error('Server Error:', error.message);
        break;
      default:
        console.error('Unknown Error:', error.message);
    }
  }
} catch (error) {
  console.error('Network Error:', error.message);
}`;

  const webhookCode = `// Webhook endpoint example
app.post('/webhook/mailquill', (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'extraction.completed':
      console.log('Extraction completed:', data.jobId);
      // Process the completed extraction
      break;
    case 'extraction.failed':
      console.log('Extraction failed:', data.error);
      // Handle the failure
      break;
    default:
      console.log('Unknown event:', event);
  }
  
  res.status(200).send('OK');
});`;

  const renderGettingStarted = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Learn how to quickly integrate MailQuill API into your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Get Your API Key</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              First, you'll need to create an account and generate an API key:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
              <li>Sign up for a MailQuill account</li>
              <li>Go to your Profile page</li>
              <li>Click "Generate API Key"</li>
              <li>Copy the key immediately (you won't see it again)</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Make Your First Request</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Here's a simple example to extract emails from a website:
            </p>
            <CodeBlock
              code={gettingStartedCode}
              language="bash"
              id="getting-started-curl"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Check the Response</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              The API will return a job ID that you can use to track the extraction:
            </p>
            <CodeBlock
              code={`{
  "success": true,
  "jobId": "ext_1234567890abcdef",
  "message": "Extraction started successfully"
}`}
              language="json"
              id="getting-started-response"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Poll for Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Use the job ID to check the status and get results:
            </p>
            <CodeBlock
              code={`curl -X GET https://backend.agentworld.online/api/v1/extract/ext_1234567890abcdef \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              language="bash"
              id="getting-started-poll"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBestPractices = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Follow these guidelines to get the most out of the MailQuill API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Rate Limit Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Always check your remaining quota before making requests:
            </p>
            <CodeBlock
              code={bestPracticesCode}
              language="javascript"
              id="best-practices-rate-limits"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">URL Validation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Validate URLs before sending them to the API:
            </p>
            <CodeBlock
              code={`// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Check if domain is accessible
const isAccessibleDomain = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};`}
              language="javascript"
              id="best-practices-validation"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Batch Processing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              For multiple URLs, process them in batches to avoid overwhelming the API:
            </p>
            <CodeBlock
              code={`// Process URLs in batches
const processBatch = async (urls, batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => extractEmails(url));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Wait between batches to respect rate limits
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};`}
              language="javascript"
              id="best-practices-batching"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Caching Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Cache extraction results to avoid duplicate requests:
            </p>
            <CodeBlock
              code={`// Simple in-memory cache
const cache = new Map();

const getCachedResult = async (url) => {
  const cacheKey = \`extract_\${url}\`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await extractEmails(url);
  cache.set(cacheKey, result);
  
  // Cache for 1 hour
  setTimeout(() => cache.delete(cacheKey), 60 * 60 * 1000);
  
  return result;
};`}
              language="javascript"
              id="best-practices-caching"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderErrorHandling = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
          <CardDescription>
            Learn how to properly handle errors and edge cases in your API integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">HTTP Status Codes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              The API uses standard HTTP status codes to indicate success or failure:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-16 text-green-600 font-mono">200</span>
                <span className="text-gray-600 dark:text-gray-400">Success</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-16 text-red-600 font-mono">400</span>
                <span className="text-gray-600 dark:text-gray-400">Bad Request - Invalid parameters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-16 text-red-600 font-mono">401</span>
                <span className="text-gray-600 dark:text-gray-400">Unauthorized - Invalid API key</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-16 text-red-600 font-mono">429</span>
                <span className="text-gray-600 dark:text-gray-400">Too Many Requests - Rate limited</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-16 text-red-600 font-mono">500</span>
                <span className="text-gray-600 dark:text-gray-400">Internal Server Error</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Error Response Format</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              All errors follow a consistent format:
            </p>
            <CodeBlock
              code={`{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not valid",
    "details": {
      "url": "not-a-url"
    }
  }
}`}
              language="json"
              id="error-response-format"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Implementing Error Handling</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Here's how to properly handle errors in your application:
            </p>
            <CodeBlock
              code={errorHandlingCode}
              language="javascript"
              id="error-handling-implementation"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Common Error Scenarios</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Invalid URL</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  The URL format is incorrect or the domain doesn't exist.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Rate Limit Exceeded</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  You've exceeded your monthly quota. Check the Retry-After header for when to retry.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Extraction Timeout</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  The website took too long to respond or was inaccessible.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">No Emails Found</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  The website doesn't contain any email addresses.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Set up webhooks to receive real-time notifications about your email extractions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What are Webhooks?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Webhooks allow you to receive real-time notifications when your email extractions complete, 
              fail, or encounter issues. This eliminates the need to constantly poll the API for status updates.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Setting Up Webhooks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Configure your webhook endpoint in your profile settings:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
              <li>Go to your Profile page</li>
              <li>Find the "Webhook Settings" section</li>
              <li>Enter your webhook URL (must be HTTPS)</li>
              <li>Select the events you want to receive</li>
              <li>Save your settings</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Webhook Events</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              The following events are available:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-32 text-blue-600 font-mono">extraction.started</span>
                <span className="text-gray-600 dark:text-gray-400">Extraction job has begun</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-32 text-green-600 font-mono">extraction.completed</span>
                <span className="text-gray-600 dark:text-gray-400">Extraction finished successfully</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-32 text-red-600 font-mono">extraction.failed</span>
                <span className="text-gray-600 dark:text-gray-400">Extraction encountered an error</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Webhook Payload</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Example webhook payload for a completed extraction:
            </p>
            <CodeBlock
              code={`{
  "event": "extraction.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "jobId": "ext_1234567890abcdef",
    "url": "https://example.com",
    "emailsFound": 25,
    "downloadUrl": "https://backend.agentworld.online/api/v1/extract/ext_1234567890abcdef/download"
  }
}`}
              language="json"
              id="webhook-payload"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Webhook Endpoint Example</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Here's how to handle webhook events in your application:
            </p>
            <CodeBlock
              code={webhookCode}
              language="javascript"
              id="webhook-endpoint"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Security Considerations</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Always use HTTPS for your webhook endpoints</p>
              <p>• Verify webhook signatures to ensure authenticity</p>
              <p>• Implement idempotency to handle duplicate events</p>
              <p>• Set up proper error handling and retry logic</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDefault = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guides</CardTitle>
          <CardDescription>
            Comprehensive guides to help you integrate and use the MailQuill API effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Learn the basics of integrating MailQuill API into your application
              </p>
              <button 
                onClick={() => window.location.hash = 'getting-started'}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Read Guide →
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Follow these guidelines to get the most out of the API
              </p>
              <button 
                onClick={() => window.location.hash = 'best-practices'}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Read Guide →
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Error Handling</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Learn how to properly handle errors and edge cases
              </p>
              <button 
                onClick={() => window.location.hash = 'error-handling'}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Read Guide →
              </button>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Webhooks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Set up real-time notifications for your extractions
              </p>
              <button 
                onClick={() => window.location.hash = 'webhooks'}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Read Guide →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (activeGuide) {
    case 'getting-started':
      return renderGettingStarted();
    case 'best-practices':
      return renderBestPractices();
    case 'error-handling':
      return renderErrorHandling();
    case 'webhooks':
      return renderWebhooks();
    default:
      return renderDefault();
  }
}
