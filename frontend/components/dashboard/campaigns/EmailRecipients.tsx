'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Users } from 'lucide-react';

interface EmailRecipientsProps {
  campaign: Campaign;
}

export function EmailRecipients({ campaign }: EmailRecipientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Email Recipients
        </CardTitle>
        <CardDescription>
          {campaign.emailList.length} recipient(s) in this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {campaign.emailList.slice(0, 10).map((email, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm font-mono">{email}</span>
              {campaign.sentEmails.includes(email) ? (
                <Badge variant="default" className="bg-green-600">
                  Sent
                </Badge>
              ) : (
                <Badge variant="outline">
                  Pending
                </Badge>
              )}
            </div>
          ))}
          {campaign.emailList.length > 10 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-2">
              ... and {campaign.emailList.length - 10} more recipients
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
