'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export function ApiDocsQuickStart() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Start
        </CardTitle>
        <CardDescription>
          Get started with MailQuill API in minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
            <h3 className="font-semibold mb-2">Get API Key</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign up and generate your API key from your profile page
            </p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">2</div>
            <h3 className="font-semibold mb-2">Make Request</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send URLs to our extraction endpoint with your API key
            </p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
            <h3 className="font-semibold mb-2">Get Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive extracted emails in JSON or CSV format
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
