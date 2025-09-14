'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob, EmailExtractorAPI } from '@/lib/api/email-extractor';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Globe,
    Loader2,
    Mail,
    RefreshCw,
    Share,
    XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

// Progress step interface
interface ProgressStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  details?: string;
}

export default function EmailExtractionDetailsPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<EmailExtractionJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    {
      name: 'Homepage Scan',
      status: 'pending',
      details: 'Scanning homepage for email addresses'
    },
    {
      name: 'Homepage Email Extraction',
      status: 'pending',
      details: 'Extracting emails from homepage content'
    },
    {
      name: 'Contact Pages',
      status: 'pending',
      details: 'Scanning contact and about pages'
    },
    {
      name: 'Puppeteer Scan',
      status: 'pending',
      details: 'Advanced JavaScript-based email detection'
    }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (params.jobId) {
      loadJobDetails();
    }
  }, [params.jobId]);

  // Auto-refresh for processing jobs
  useEffect(() => {
    if (job?.status === 'processing') {
      const interval = setInterval(() => {
        loadJobDetails(true);
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [job?.status]);

  const loadJobDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await EmailExtractorAPI.getExtractionDetails(params.jobId);
      
      if (response.success && response.data) {
        setJob(response.data);
        // Update progress steps based on actual backend data
        updateProgressSteps(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load extraction details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateProgressSteps = (jobData: EmailExtractionJob) => {
    // Get progress from the first result (assuming single URL for now)
    const firstResult = jobData.results?.[0];
    const progress = firstResult?.progress || [];
    
    // Map backend progress steps to frontend format
    const stepMapping: { [key: string]: string } = {
      'homepage_scan': 'Homepage Scan',
      'homepage_email_extraction': 'Homepage Email Extraction',
      'contact_pages': 'Contact Pages',
      'puppeteer_scan': 'Puppeteer Scan',
      'whois_lookup': 'WHOIS Lookup',
      'extraction_complete': 'Extraction Complete'
    };

    const steps: ProgressStep[] = [];
    
    // Add steps in order
    const stepOrder = ['homepage_scan', 'homepage_email_extraction', 'contact_pages', 'puppeteer_scan', 'whois_lookup'];
    
    stepOrder.forEach(stepKey => {
      const progressStep = progress.find(p => p.step === stepKey);
      const stepName = stepMapping[stepKey] || stepKey;
      
      if (progressStep) {
        steps.push({
          name: stepName,
          status: progressStep.status,
          duration: progressStep.duration,
          details: progressStep.message
        });
      } else {
        // If no progress data, determine status based on job status
        let status: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
        
        if (jobData.status === 'completed') {
          status = 'completed';
        } else if (jobData.status === 'failed') {
          status = 'failed';
        } else if (jobData.status === 'processing') {
          // For processing jobs, show first step as running
          if (stepKey === 'homepage_scan') {
            status = 'running';
          }
        }
        
        steps.push({
          name: stepName,
          status,
          details: status === 'completed' ? 'Step completed' : status === 'failed' ? 'Step failed' : 'Waiting to start'
        });
      }
    });

    setProgressSteps(steps);
  };

  const downloadResults = async () => {
    if (!job) return;
    
    try {
      const blob = await EmailExtractorAPI.downloadResults(job.jobId);
      EmailExtractorAPI.downloadCsvFile(blob, `email-extraction-${job.jobId}.csv`);
      
      toast({
        title: 'Success',
        description: 'Results downloaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download results',
        variant: 'destructive'
      });
    }
  };

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

  const shareExtraction = async () => {
    if (!job) return;
    
    try {
      const shareData = {
        title: 'Email Extraction Results',
        text: `Found ${job.totalEmails} emails from ${job.urls.length} websites`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast({
          title: 'Success',
          description: 'Extraction details copied to clipboard'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share extraction',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <DashboardLayout
          title="Loading..."
          description="Loading extraction details"
        >
          <div className="space-y-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
              <div className="relative p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <DashboardLayout
          title="Extraction Not Found"
          description="The requested extraction job could not be found"
        >
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Extraction Not Found</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The extraction job you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/dashboard/email-extractor/history')}>
              Back to History
            </Button>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Floating glass elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>

      <DashboardLayout
        title={`Extraction Details - Job ${job.jobId.slice(-8)}`}
        description="Detailed view of email extraction job"
      >
        <div className="relative space-y-6">
          {/* Back Button */}
          <div className="group relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5"></div>
            <div className="relative p-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/email-extractor/history')}
                className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </div>
          </div>

          {/* Job Overview */}
          <div className="group relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">Job {job.jobId.slice(-8)}</span>
                    <Badge className={`${getStatusColor(job.status)} border-0 shadow-sm`}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {job.urls.length} URLs • {job.totalEmails} emails found
                    {job.duration && (
                      <span className="ml-2">
                        • <Clock className="h-3 w-3 inline mr-1" />
                        {formatDuration(job.duration)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Started: {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadJobDetails(true)}
                    disabled={refreshing}
                    title="Refresh"
                    className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  {job.status === 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadResults}
                        title="Download CSV"
                        className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareExtraction}
                        title="Share extraction"
                        className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Website URLs */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Target Websites
                </h4>
                <div className="grid gap-3">
                  {job.urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-4 py-3 rounded-lg shadow-sm">
                      <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-sm flex-1">{url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                        className="h-8 w-8 p-0 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Extraction Progress
                </h4>
                <div className="space-y-3">
                  {progressSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-4 py-3 rounded-lg shadow-sm">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">{step.name}</span>
                          {step.duration && (
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDuration(step.duration)}
                            </span>
                          )}
                        </div>
                        {step.details && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{step.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Results - Only show if there are emails found */}
              {job.totalEmails > 0 && job.results.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Email Results
                  </h4>
                  <div className="space-y-4">
                    {job.results.map((result, index) => (
                      <div key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{result.url}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-2 py-1 rounded">
                              {result.emails.length} emails
                            </span>
                            {result.emails.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyEmails(result.emails)}
                                className="h-8 w-8 p-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {result.emails.length > 0 && (
                          <div className="grid gap-2">
                            {result.emails.map((email, emailIndex) => (
                              <div key={emailIndex} className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 px-3 py-2 rounded shadow-sm">
                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300 flex-1">{email}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyEmails([email])}
                                  className="h-6 w-6 p-0 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
