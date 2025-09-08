'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailExtractionJob } from '@/lib/api/email-extractor';
import {
    CheckCircle,
    Clock,
    Download,
    Share,
    XCircle
} from 'lucide-react';

interface RecentExtractionsProps {
  extractionHistory: EmailExtractionJob[];
  onDownloadResults: (jobId: string) => void;
  onShareExtraction: (job: EmailExtractionJob) => void;
  onViewAll: () => void;
}

// Utility function to format duration
function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

export function RecentExtractions({ 
  extractionHistory, 
  onDownloadResults, 
  onShareExtraction,
  onViewAll 
}: RecentExtractionsProps) {
  if (extractionHistory.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Extractions</CardTitle>
        <CardDescription>
          Your recent email extraction jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {extractionHistory.slice(0, 5).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  <span className="font-medium">Job {job.jobId.slice(-8)}</span>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {job.urls.length} URLs • {job.totalEmails} emails found
                  {job.duration && (
                    <span className="ml-2">
                      • <Clock className="h-3 w-3 inline mr-1" />
                      {formatDuration(job.duration)}
                    </span>
                  )}
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>Websites: {job.urls.slice(0, 2).join(', ')}{job.urls.length > 2 && ` +${job.urls.length - 2} more`}</p>
                  <p>{new Date(job.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.status === 'completed' && job.totalEmails > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadResults(job.jobId)}
                      title="Download CSV"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShareExtraction(job)}
                      title="Share extraction"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {extractionHistory.length > 5 && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={onViewAll}
                className="w-full"
              >
                View All Extractions ({extractionHistory.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
