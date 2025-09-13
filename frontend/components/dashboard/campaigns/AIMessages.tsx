'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Mail } from 'lucide-react';

interface AIMessagesProps {
  campaign: Campaign;
}

export function AIMessages({ campaign }: AIMessagesProps) {
  // Show generated messages if available, otherwise show old aiMessages for backward compatibility
  const hasGeneratedMessages = campaign.generatedMessages && campaign.generatedMessages.length > 0;
  const messages = hasGeneratedMessages ? campaign.generatedMessages : [];
  const oldMessages = campaign.aiMessages || [];

  if (!hasGeneratedMessages && oldMessages.length === 0) {
    return null; // Don't show the component if there are no messages
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {hasGeneratedMessages ? 'Generated Messages' : 'AI Messages'}
        </CardTitle>
        <CardDescription>
          {hasGeneratedMessages 
            ? `${messages.length} personalized message(s) generated for each recipient`
            : `${oldMessages.length} message(s) generated for this campaign`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasGeneratedMessages ? (
            // Show generated messages (limit to first 5 for preview)
            messages.slice(0, 5).map((message, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {message.recipientName || message.recipientEmail}
                  </span>
                  <Badge variant={message.isSent ? "default" : "secondary"} className={message.isSent ? "bg-green-600" : ""}>
                    {message.isSent ? "Sent" : "Pending"}
                  </Badge>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject: </span>
                  <span className="text-sm text-gray-900 dark:text-white">{message.subject}</span>
                </div>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm">
                  {message.body.length > 200 ? `${message.body.substring(0, 200)}...` : message.body}
                </p>
              </div>
            ))
          ) : (
            // Show old aiMessages for backward compatibility
            oldMessages.map((message, index) => (
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
            ))
          )}
          
          {hasGeneratedMessages && messages.length > 5 && (
            <div className="text-center py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ... and {messages.length - 5} more personalized messages
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
