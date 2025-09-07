'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob } from '@/lib/api/email-extractor';
import {
    CheckCircle,
    Clock,
    Copy,
    Download,
    Globe,
    Loader2,
    Share,
    XCircle
} from 'lucide-react';

interface CurrentJobStatusProps {
  currentJob: EmailExtractionJob | null;
  onDownloadResults: (jobId: string) => void;
  onShareExtraction: (job: EmailExtractionJob) => void;
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
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'processing':
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

function getProgress(job: EmailExtractionJob): number {
  if (job.status === 'completed') return 100;
  if (job.status === 'failed') return 100;
  if (job.results.length === 0) return 0;
  
  const completedResults = job.results.filter(result => 
    result.status === 'success' || result.status === 'failed'
  ).length;
  
  return Math.min((completedResults / job.urls.length) * 100, 100);
}

function getProgressText(job: EmailExtractionJob): string {
  if (job.status === 'completed') return 'Extraction completed';
  if (job.status === 'failed') return 'Extraction failed';
  
  const completedResults = job.results.filter(result => 
    result.status === 'success' || result.status === 'failed'
  ).length;
  
  return `Processing ${completedResults} of ${job.urls.length} URLs...`;
}

export function CurrentJobStatus({ 
  currentJob, 
  onDownloadResults, 
  onShareExtraction 
}: CurrentJobStatusProps) {
  const { toast } = useToast();

  const copyEmails = async (emails: string[]) => {
    try {
      const emailText = emails.join(', ');
      await navigator.clipboard.writeText(emailText);
      toast({
        title: 'Success',
        description: `${emails.length} email(s) copied to clipboard`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy emails',
        variant: 'destructive'
      });
    }
  };

  if (!currentJob) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(currentJob.status)}
          Current Extraction Job
          {currentJob.status === 'processing' && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              In Progress
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Job ID: {currentJob.jobId}
          {currentJob.status === 'processing' && (
            <span className="ml-2 text-blue-600">
              • {getProgressText(currentJob)}
            </span>
          )}
          {currentJob.startedAt && (
            <span className="ml-2 text-muted-foreground">
              • Started: {new Date(currentJob.startedAt).toLocaleTimeString()}
            </span>
          )}
          {currentJob.duration && (
            <span className="ml-2 text-muted-foreground">
              • Duration: {formatDuration(currentJob.duration)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(currentJob.status)}>
            {currentJob.status.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentJob.totalEmails} emails found
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{getProgressText(currentJob)}</span>
            <span className="font-medium">{Math.round(getProgress(currentJob))}%</span>
          </div>
          <Progress value={getProgress(currentJob)} className="w-full" />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Results:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentJob.results.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono truncate max-w-xs">
                      {result.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {result.emails.length} emails
                    </Badge>
                    {result.duration && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(result.duration)}
                      </Badge>
                    )}
                    {getStatusIcon(result.status)}
                    {result.status === 'processing' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
                {result.emails.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Emails found:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyEmails(result.emails)}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.emails.map((email, emailIndex) => (
                        <div key={emailIndex} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs">
                          <span className="font-mono">{email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyEmails([email])}
                            className="h-4 w-4 p-0 hover:bg-gray-200"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.error && (
                  <div className="text-xs text-red-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {currentJob.status === 'completed' && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              onClick={() => onDownloadResults(currentJob.jobId)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => onShareExtraction(currentJob)}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
