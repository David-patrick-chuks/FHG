'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Mail } from 'lucide-react';

interface AIMessagesProps {
  campaign: Campaign;
}

export function AIMessages({ campaign }: AIMessagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          AI Generated Messages
        </CardTitle>
        <CardDescription>
          {campaign.aiMessages.length} message(s) generated for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaign.aiMessages.map((message, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Message {index + 1}
                </span>
                {index === campaign.selectedMessageIndex && (
                  <Badge variant="default" className="bg-blue-600">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {message}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
