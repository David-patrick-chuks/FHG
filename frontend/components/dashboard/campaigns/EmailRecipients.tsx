'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types';
import { Eye, Mail, Users } from 'lucide-react';
import { useState } from 'react';

interface EmailRecipientsProps {
  campaign: Campaign;
}

export function EmailRecipients({ campaign }: EmailRecipientsProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(campaign.emailList.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmails = campaign.emailList.slice(startIndex, endIndex);

  const getStatusBadge = (email: string) => {
    const isSent = (campaign.sentEmails || []).includes(email);
    return isSent ? (
      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700">
        <Mail className="w-3 h-3 mr-1" />
        Sent
      </Badge>
    ) : (
      <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-700 dark:text-blue-400">
        Pending
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Email Recipients
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {campaign.emailList.length} recipient(s) in this campaign
            </CardDescription>
          </div>
          {campaign.emailList.length > itemsPerPage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(showAll ? currentEmails : campaign.emailList.slice(0, itemsPerPage)).map((email, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 border border-blue-100 dark:border-blue-800/50 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{email}</span>
              </div>
              {getStatusBadge(email)}
            </div>
          ))}
          
          {showAll && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-blue-100 dark:border-blue-800/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
              >
                Previous
              </Button>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20"
              >
                Next
              </Button>
            </div>
          )}
          
          {!showAll && campaign.emailList.length > itemsPerPage && (
            <div className="text-center py-3">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                ... and {campaign.emailList.length - itemsPerPage} more recipients
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
