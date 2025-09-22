'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';

interface ApiDocsAuthenticationProps {
  searchQuery: string;
}

export function ApiDocsAuthentication({ searchQuery }: ApiDocsAuthenticationProps) {
  const authHeaderCode = `Authorization: Bearer mail_quill_your_api_key_here
# OR
X-API-Key: mail_quill_your_api_key_here`;

  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('authentication api key security')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            All API requests require authentication using your API key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVisible('api key') && (
            <div id="api-key">
              <h3 className="font-semibold mb-2">API Key</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Include your API key in the request headers:
              </p>
              <CodeBlock
                code={authHeaderCode}
                language="text"
                id="auth-header"
              />
            </div>
          )}

          {isVisible('getting your api key') && (
            <div id="getting-api-key">
              <h3 className="font-semibold mb-2">Getting Your API Key</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Sign up for a MailQuill account</li>
                <li>Go to your Profile page</li>
                <li>Click "Generate API Key"</li>
                <li>Copy the key immediately (you won't see it again)</li>
              </ol>
            </div>
          )}

          {isVisible('security') && (
            <div id="security-notice" className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Security Notice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Keep your API key secure and never share it publicly. If compromised, regenerate it immediately.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
