'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob } from '@/lib/api/email-extractor';
import {
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Copy,
    Database,
    Download,
    Globe,
    Home,
    Link,
    Loader2,
    Shield,
    ShoppingCart,
    XCircle,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface CurrentJobStatusProps {
  currentJob: EmailExtractionJob | null;
  onDownloadResults: (jobId: string) => void;
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
      return <CheckCircle className="h-5 w-5 text-cyan-600" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'processing':
      return <Loader2 className="h-5 w-5 text-cyan-600 animate-spin" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30';
    case 'failed':
      return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30';
    case 'processing':
      return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30';
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

function getStepIcon(step: string) {
  switch (step) {
    case 'browser_initialization':
      return <Globe className="h-4 w-4" />;
    case 'ecommerce_checkout':
      return <ShoppingCart className="h-4 w-4" />;
    case 'homepage_analysis':
      return <Home className="h-4 w-4" />;
    case 'contact_discovery':
      return <Link className="h-4 w-4" />;
    case 'deep_crawling':
      return <Zap className="h-4 w-4" />;
    case 'whois_lookup':
      return <Database className="h-4 w-4" />;
    case 'final_deduplication':
      return <Shield className="h-4 w-4" />;
    case 'extraction_complete':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getStepStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    case 'skipped':
      return <Clock className="h-4 w-4 text-gray-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

function getStepStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'processing':
      return 'text-blue-600';
    case 'skipped':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

function formatStepName(step: string): string {
  const stepNames: { [key: string]: string } = {
    'browser_initialization': 'Browser Initialization',
    'ecommerce_checkout': 'E-commerce Checkout',
    'homepage_analysis': 'Homepage Analysis',
    'contact_discovery': 'Contact Page Discovery',
    'deep_crawling': 'Deep Site Crawling',
    'whois_lookup': 'WHOIS Database',
    'final_deduplication': 'Final Deduplication',
    'extraction_complete': 'Extraction Complete'
  };
  
  return stepNames[step] || step
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface DetailedProgressProps {
  result: any;
}

function DetailedProgress({ result }: DetailedProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!result.progress || result.progress.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2 border-t pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-6 px-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
      >
        {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
        View Progress Details
      </Button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          {result.progress.map((step: any, index: number) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <div className="flex items-center gap-1 flex-shrink-0">
                {getStepIcon(step.step)}
                {getStepStatusIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-medium ${getStepStatusColor(step.status)} block sm:inline`}>
                  {formatStepName(step.step)}
                </span>
                {step.message && (
                  <span className="text-slate-600 dark:text-slate-400 block sm:inline sm:ml-2">
                    {step.message}
                  </span>
                )}
              </div>
              {step.duration && (
                <span className="text-slate-500 dark:text-slate-500 flex-shrink-0 sm:ml-auto">
                  {formatDuration(step.duration)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CurrentJobStatus({ 
  currentJob, 
  onDownloadResults
}: CurrentJobStatusProps) {
  const { toast } = useToast();
  const [copiedEmails, setCopiedEmails] = useState<Set<string>>(new Set());

  const copyEmails = async (emails: string[]) => {
    try {
      const emailText = emails.join(', ');
      await navigator.clipboard.writeText(emailText);
      
      // Add emails to copied set for visual feedback
      setCopiedEmails(prev => new Set([...prev, ...emails]));
      
      // Remove from copied set after 2 seconds
      setTimeout(() => {
        setCopiedEmails(prev => {
          const newSet = new Set(prev);
          emails.forEach(email => newSet.delete(email));
          return newSet;
        });
      }, 2000);
      
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
        <CardDescription className="space-y-1 sm:space-y-0">
          <div className="text-sm">
            Job ID: {currentJob.jobId}
          </div>
          {currentJob.status === 'processing' && (
            <div className="text-sm text-blue-600">
              {getProgressText(currentJob)}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
            {currentJob.startedAt && (
              <span>Started: {new Date(currentJob.startedAt).toLocaleTimeString()}</span>
            )}
            {currentJob.duration && (
              <span>Duration: {formatDuration(currentJob.duration)}</span>
            )}
          </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-mono truncate">
                      {result.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Emails found:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyEmails(result.emails)}
                        className="h-6 px-2 text-xs self-start sm:self-auto"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy All
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-1">
                      {result.emails.map((email, emailIndex) => {
                        const isCopied = copiedEmails.has(email);
                        return (
                          <div key={emailIndex} className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                            isCopied 
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                              : 'bg-slate-100 dark:bg-slate-700'
                          }`}>
                            <span className="font-mono text-slate-900 dark:text-slate-100 truncate flex-1 min-w-0">{email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyEmails([email])}
                              className="h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 flex-shrink-0"
                            >
                              {isCopied ? (
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {result.error && (
                  <div className="text-xs text-red-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
                <DetailedProgress result={result} />
              </div>
            ))}
          </div>
        </div>

        {currentJob.status === 'completed' && currentJob.totalEmails > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              onClick={() => onDownloadResults(currentJob.jobId)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
