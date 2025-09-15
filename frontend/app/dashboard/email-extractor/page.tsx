'use client';

import { CurrentJobStatus } from '@/components/email-extractor/CurrentJobStatus';
import { EmailExtractorForm } from '@/components/email-extractor/EmailExtractorForm';
import { EmailExtractorSkeleton } from '@/components/email-extractor/EmailExtractorSkeleton';
import { RecentExtractions } from '@/components/email-extractor/RecentExtractions';
import { SubscriptionLimitsDisplay } from '@/components/email-extractor/SubscriptionLimitsDisplay';
import { SubscriptionInfo } from '@/components/email-extractor/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob, EmailExtractorAPI } from '@/lib/api/email-extractor';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function EmailExtractorPage() {
  const router = useRouter();
  const [currentJob, setCurrentJob] = useState<EmailExtractionJob | null>(null);
  const [extractionHistory, setExtractionHistory] = useState<EmailExtractionJob[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [jobStartTime, setJobStartTime] = useState<number | null>(null);
  const fetchInProgress = useRef(false);
  const { toast } = useToast();

  // Real-time duration tracking for processing jobs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentJob && currentJob.status === 'processing' && jobStartTime) {
      interval = setInterval(() => {
        setCurrentJob(prev => {
          if (!prev || prev.status !== 'processing') return prev;
          
          const elapsed = Date.now() - jobStartTime;
          return {
            ...prev,
            duration: elapsed
          };
        });
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJob?.status, jobStartTime]);

  useEffect(() => {
    // Fetch subscription info and recent extractions
    const fetchData = async () => {
      // Prevent duplicate calls
      if (fetchInProgress.current) {
        return;
      }
      
      fetchInProgress.current = true;
      
      try {
        const [subscriptionResponse, historyResponse] = await Promise.all([
          EmailExtractorAPI.getSubscriptionInfo(),
          EmailExtractorAPI.getExtractions(10, 0)
        ]);

        if (subscriptionResponse.success && subscriptionResponse.data) {
          setSubscriptionInfo(subscriptionResponse.data);
        }

        if (historyResponse.success && historyResponse.data) {
          setExtractionHistory(historyResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        fetchInProgress.current = false;
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const startExtraction = async (urls: string[], extractionType: 'single' | 'multiple' | 'csv' = 'multiple') => {
    try {
      setIsLoading(true);
      const response = await EmailExtractorAPI.startExtraction(urls, extractionType);
      
      if (response.success && response.data) {
        const startTime = Date.now();
        setJobStartTime(startTime);
        setCurrentJob({
          id: response.data.jobId,
          jobId: response.data.jobId,
          status: 'pending',
          urls,
          results: [],
          totalEmails: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          startedAt: new Date().toISOString()
        });

        // Immediately refresh subscription info to update usage count
        refreshSubscriptionInfo();

        toast({
          title: 'Success',
          description: 'Email extraction job started successfully'
        });

        // Start polling for updates
        pollJobStatus(response.data.jobId);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to start extraction',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start extraction',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes with 2-second intervals
    
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        const response = await EmailExtractorAPI.getExtraction(jobId);
        
        if (response.success && response.data) {
          setCurrentJob(response.data);
          
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            clearInterval(pollInterval);
            setJobStartTime(null); // Clear start time when job completes
            loadExtractionHistory();
            refreshSubscriptionInfo(); // Refresh subscription info to update usage count
            
            // Show completion toast
            if (response.data.status === 'completed') {
              toast({
                title: 'Extraction Completed',
                description: `Found ${response.data.totalEmails} emails from ${response.data.urls.length} websites`
              });
            } else {
              toast({
                title: 'Extraction Failed',
                description: response.data.error || 'An error occurred during extraction',
                variant: 'destructive'
              });
            }
          }
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setJobStartTime(null); // Clear start time on timeout
          toast({
            title: 'Extraction Timeout',
            description: 'The extraction is taking longer than expected. Please check back later.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        pollCount++;
        
        // Stop polling after too many errors
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setJobStartTime(null); // Clear start time on error
        }
      }
    }, 2000);
  };

  const loadExtractionHistory = async () => {
    try {
      const response = await EmailExtractorAPI.getExtractions(10, 0);
      if (response.success && response.data) {
        setExtractionHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading extraction history:', error);
    }
  };

  const refreshSubscriptionInfo = async () => {
    try {
      const response = await EmailExtractorAPI.getSubscriptionInfo();
      if (response.success && response.data) {
        setSubscriptionInfo(response.data);
      }
    } catch (error) {
      console.error('Error refreshing subscription info:', error);
    }
  };

  const downloadResults = async (jobId: string) => {
    try {
      const blob = await EmailExtractorAPI.downloadResults(jobId);
      EmailExtractorAPI.downloadCsvFile(blob, `email-extraction-${jobId}.csv`);
      
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

  const shareExtraction = async (job: EmailExtractionJob) => {
    try {
      const shareData = {
        title: 'Email Extraction Results',
        text: `Found ${job.totalEmails} emails from ${job.urls.length} websites`,
        url: window.location.href
      };

      // Check if Web Share API is available and supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          toast({
            title: 'Success',
            description: 'Extraction shared successfully'
          });
          return;
        } catch (shareError) {
          // If user cancels the share dialog, don't show error
          if (shareError.name === 'AbortError') {
            return;
          }
          // For other share errors, fall back to clipboard
          console.warn('Web Share API failed, falling back to clipboard:', shareError);
        }
      }

      // Fallback to clipboard
      const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Success',
        description: 'Extraction details copied to clipboard'
      });
    } catch (error) {
      console.error('Share extraction error:', error);
      toast({
        title: 'Error',
        description: 'Failed to share extraction. Please try copying the URL manually.',
        variant: 'destructive'
      });
    }
  };

  const handleViewAll = () => {
    router.push('/dashboard/email-extractor/history');
  };

  if (isInitialLoading) {
    return (
      <DashboardLayout
        title="Email Extractor"
        description="Extract email addresses from websites using our powerful AI-powered tool"
      >
        <EmailExtractorSkeleton />
      </DashboardLayout>
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
        title="Email Extractor"
        description="Extract email addresses from websites using our powerful AI-powered tool"
      >
        <div className="relative space-y-4 sm:space-y-6">
          {/* Subscription Limits - Hidden on mobile if not needed */}
          {subscriptionInfo && (
            <div className="group relative hidden sm:block">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
              <div className="relative p-4 sm:p-6">
                <SubscriptionLimitsDisplay subscriptionInfo={subscriptionInfo} />
              </div>
            </div>
          )}

          {/* Email Extraction Form */}
          <div className="group relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
            <div className="relative p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-slate-900 dark:text-white">Extract Emails</h2>
              <EmailExtractorForm
                subscriptionInfo={subscriptionInfo}
                onExtractionStart={startExtraction}
                isLoading={isLoading}
                onExtractionComplete={refreshSubscriptionInfo}
              />
            </div>
          </div>

          {/* Current Job Status - Only show if there's an active job */}
          {currentJob && (
            <div className="group relative">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
              <div className="relative p-4 sm:p-6">
                <CurrentJobStatus
                  currentJob={currentJob}
                  onDownloadResults={downloadResults}
                  onShareExtraction={shareExtraction}
                />
              </div>
            </div>
          )}

          {/* Recent Extractions - Only show if there are extractions */}
          {extractionHistory.length > 0 && (
            <div className="group relative">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
              <div className="relative p-4 sm:p-6">
                <RecentExtractions
                  extractionHistory={extractionHistory}
                  onDownloadResults={downloadResults}
                  onShareExtraction={shareExtraction}
                  onViewAll={handleViewAll}
                />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}