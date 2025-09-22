'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Key } from 'lucide-react';

export function ApiDocsCTA() {
  return (
    <Card className="mt-12">
      <CardContent className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of developers using MailQuill API to extract emails from websites with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open('/signup', '_blank')}
          >
            <Key className="mr-2 h-5 w-5" />
            Get Your API Key
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => window.open('/dashboard/profile', '_blank')}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
