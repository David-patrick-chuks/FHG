'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmailExtractionJob } from '@/lib/api/email-extractor';
import {
    CheckCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Globe,
    Mail,
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
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export function RecentExtractions({ 
  extractionHistory, 
  onDownloadResults, 
  onShareExtraction,
  onViewAll 
}: RecentExtractionsProps) {
  if (extractionHistory.length === 0) return null;

  const copyEmails = async (emails: string[]) => {
    try {
      const emailText = emails.join(', ');
      await navigator.clipboard.writeText(emailText);
    } catch (error) {
      console.error('Failed to copy emails:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recent Extractions</h2>
          <p className="text-slate-600 dark:text-slate-300">Your recent email extraction jobs</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
        >
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {extractionHistory.slice(0, 4).map((job) => (
          <div key={job.id} className="group/item relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <span className="font-semibold text-slate-900 dark:text-white">Job {job.jobId.slice(-8)}</span>
                    <Badge className={`${getStatusColor(job.status)} border-0 shadow-sm`}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {job.urls.length} URLs • {job.totalEmails} emails found
                    {job.duration && (
                      <span className="ml-2">
                        • <Clock className="h-3 w-3 inline mr-1" />
                        {formatDuration(job.duration)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === 'completed' && job.totalEmails > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadResults(job.jobId)}
                        title="Download CSV"
                        className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onShareExtraction(job)}
                        title="Share extraction"
                        className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/dashboard/email-extractor/${job.jobId}`, '_blank')}
                    title="View details"
                    className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Website URLs */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Websites:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.urls.slice(0, 3).map((url, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-3 py-2 rounded-lg text-xs shadow-sm">
                      <Globe className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                      <span className="truncate max-w-32 text-slate-700 dark:text-slate-300">{url}</span>
                    </div>
                  ))}
                  {job.urls.length > 3 && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-3 py-2 rounded-lg text-xs shadow-sm text-slate-600 dark:text-slate-400">
                      +{job.urls.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              {/* Email Results - Only show if there are emails found */}
              {job.totalEmails > 0 && job.results.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Email Results:
                  </h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {job.results.slice(0, 3).map((result, index) => (
                      <div key={index} className="p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono truncate max-w-48 text-slate-700 dark:text-slate-300">{result.url}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-2 py-1 rounded">{result.emails.length} emails</span>
                            {result.emails.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyEmails(result.emails)}
                                className="h-6 w-6 p-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {result.emails.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {result.emails.slice(0, 3).map((email, emailIndex) => (
                              <div key={emailIndex} className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 px-2 py-1 rounded text-xs shadow-sm">
                                <span className="truncate max-w-24 text-slate-700 dark:text-slate-300">{email}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyEmails([email])}
                                  className="h-4 w-4 p-0 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                                >
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </div>
                            ))}
                            {result.emails.length > 3 && (
                              <span className="text-xs text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-2 py-1 rounded">+{result.emails.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {job.results.length > 3 && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 text-center py-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-lg">
                        +{job.results.length - 3} more results
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
