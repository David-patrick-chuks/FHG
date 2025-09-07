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

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Email Extraction Results: Found ${job.totalEmails} emails from ${job.urls.length} websites`
        );
        toast({
          title: 'Success',
          description: 'Results copied to clipboard'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share results',
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
    <DashboardLayout
      title="Email Extractor"
      description="Extract email addresses from websites using our powerful AI-powered tool"
    >
      <div className="space-y-6">
        {/* Subscription Limits */}
        <SubscriptionLimitsDisplay subscriptionInfo={subscriptionInfo} />

        {/* Email Extraction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Extract Emails</h2>
          <EmailExtractorForm
            subscriptionInfo={subscriptionInfo}
            onExtractionStart={startExtraction}
            isLoading={isLoading}
          />
        </div>

        {/* Current Job Status */}
        <CurrentJobStatus
          currentJob={currentJob}
          onDownloadResults={downloadResults}
          onShareExtraction={shareExtraction}
        />

        {/* Recent Extractions */}
        <RecentExtractions
          extractionHistory={extractionHistory}
          onDownloadResults={downloadResults}
          onShareExtraction={shareExtraction}
          onViewAll={handleViewAll}
        />
      </div>
    </DashboardLayout>
  );
}