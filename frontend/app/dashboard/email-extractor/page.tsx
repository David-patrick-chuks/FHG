'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob, EmailExtractorAPI } from '@/lib/api/email-extractor';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Link,
  Loader2,
  Mail,
  Share,
  Upload,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SubscriptionInfo {
  limits: {
    dailyExtractionLimit: number;
    canUseCsvUpload: boolean;
    planName: string;
    isUnlimited: boolean;
  };
  usage: {
    used: number;
    remaining: number;
    resetTime: string;
    limit: number;
  };
  canUseCsv: boolean;
  needsUpgrade: boolean;
  upgradeRecommendation?: {
    needsUpgrade: boolean;
    reason: string;
    recommendedPlan: string;
    currentPlan: string;
  };
}

export default function EmailExtractorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [multipleUrls, setMultipleUrls] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentJob, setCurrentJob] = useState<EmailExtractionJob | null>(null);
  const [extractionHistory, setExtractionHistory] = useState<EmailExtractionJob[]>([]);
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchInProgress = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch subscription info and recent extractions
    const fetchData = async () => {
      // Prevent duplicate calls
      if (fetchInProgress.current) {
        return;
      }

      try {
        fetchInProgress.current = true;
        
        // Fetch subscription info and recent extractions in parallel
        const [subscriptionResponse, extractionsResponse] = await Promise.all([
          EmailExtractorAPI.getSubscriptionInfo(),
          EmailExtractorAPI.getExtractions(10, 0)
        ]);
        
        if (subscriptionResponse.success && subscriptionResponse.data) {
          setSubscriptionInfo(subscriptionResponse.data);
        }
        
        if (extractionsResponse.success && extractionsResponse.data) {
          setExtractionHistory(extractionsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        fetchInProgress.current = false;
      }
    };

    fetchData();

    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSingleUrlExtraction = async () => {
    if (!singleUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive'
      });
      return;
    }

    // Check if user has reached their daily limit
    if (subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${subscriptionInfo.limits.dailyExtractionLimit} extractions. Upgrade your plan for more extractions.`,
        variant: 'destructive'
      });
      router.push('/pricing');
      return;
    }

    await startExtraction([singleUrl.trim()], 'single');
  };

  const handleMultipleUrlsExtraction = async () => {
    // Check if user is on free plan
    if (isFreePlan) {
      toast({
        title: 'Upgrade Required',
        description: 'Multiple URL extraction is not available in the free plan. Upgrade to Pro or Enterprise to use this feature.',
        variant: 'destructive'
      });
      router.push('/pricing');
      return;
    }

    const urls = multipleUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one valid URL',
        variant: 'destructive'
      });
      return;
    }

    if (urls.length > 50) {
      toast({
        title: 'Error',
        description: 'Maximum 50 URLs allowed per extraction',
        variant: 'destructive'
      });
      return;
    }

    // Check if user has reached their daily limit
    if (subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${subscriptionInfo.limits.dailyExtractionLimit} extractions. Upgrade your plan for more extractions.`,
        variant: 'destructive'
      });
      router.push('/pricing');
      return;
    }

    await startExtraction(urls, 'multiple');
  };

  const handleCsvFileUpload = async () => {
    if (!csvFile) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file',
        variant: 'destructive'
      });
      return;
    }

    // Check if user can use CSV upload
    if (subscriptionInfo && !subscriptionInfo.canUseCsv) {
      toast({
        title: 'Upgrade Required',
        description: 'CSV upload is not available in your current plan. Upgrade to Pro or Enterprise to use this feature.',
        variant: 'destructive'
      });
      router.push('/pricing');
      return;
    }

    try {
      setIsLoading(true);
      const response = await EmailExtractorAPI.parseCsvFile(csvFile);
      
      if (response.success) {
        setParsedUrls(response.data.urls);
        // Update subscription info if provided
        if (response.data.limits && response.data.usage) {
          setSubscriptionInfo(prev => prev ? {
            ...prev,
            limits: response.data.limits,
            usage: response.data.usage
          } : null);
        }
        toast({
          title: 'Success',
          description: `Parsed ${response.data.validUrls} valid URLs from CSV file`
        });
      } else {
        if (response.requiresUpgrade) {
          toast({
            title: 'Upgrade Required',
            description: response.message || 'CSV upload requires an upgrade.',
            variant: 'destructive'
          });
          router.push('/pricing');
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to parse CSV file',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse CSV file',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvExtraction = async () => {
    if (parsedUrls.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload and parse a CSV file first',
        variant: 'destructive'
      });
      return;
    }

    // Check if user has reached their daily limit
    if (subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${subscriptionInfo.limits.dailyExtractionLimit} extractions. Upgrade your plan for more extractions.`,
        variant: 'destructive'
      });
      router.push('/pricing');
      return;
    }

    await startExtraction(parsedUrls, 'csv');
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  // Check if user is on free plan
  const isFreePlan = subscriptionInfo?.limits.planName === 'free';

  const startExtraction = async (urls: string[], extractionType: 'single' | 'multiple' | 'csv' = 'multiple') => {
    try {
      setIsLoading(true);
      const response = await EmailExtractorAPI.startExtraction(urls, extractionType);
      
      if (response.success && response.data) {
        setCurrentJob({
          id: response.data.jobId,
          jobId: response.data.jobId,
          status: 'pending',
          urls,
          results: [],
          totalEmails: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Clear form fields after successful extraction start
        if (extractionType === 'single') {
          setSingleUrl('');
        } else if (extractionType === 'multiple') {
          setMultipleUrls('');
        } else if (extractionType === 'csv') {
          setParsedUrls([]);
          setCsvFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }

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
        // Fallback: copy to clipboard
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

  const getProgress = (job: EmailExtractionJob) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'failed') return 0;
    if (job.results.length === 0) return 0;
    
    const completedResults = job.results.filter(r => r.status === 'success' || r.status === 'failed').length;
    const progress = (completedResults / job.urls.length) * 100;
    
    // Ensure progress is between 0 and 100
    return Math.min(Math.max(progress, 0), 100);
  };

  const getProgressText = (job: EmailExtractionJob) => {
    if (job.status === 'completed') return 'Completed';
    if (job.status === 'failed') return 'Failed';
    if (job.results.length === 0) return 'Starting...';
    
    const completedResults = job.results.filter(r => r.status === 'success' || r.status === 'failed').length;
    const processingResults = job.results.filter(r => r.status === 'processing').length;
    
    if (completedResults === 0 && processingResults === 0) {
      return 'Initializing...';
    }
    
    if (processingResults > 0) {
      return `Processing ${processingResults} of ${job.urls.length} URLs...`;
    }
    
    return `Completed ${completedResults} of ${job.urls.length} URLs`;
  };

  const EmailExtractorSkeleton = () => (
    <div className="space-y-6">
      {/* Subscription Limits Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Skeleton */}
      <div className="grid w-full grid-cols-3 gap-2">
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Tab Content Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>

      {/* Recent Extractions Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isInitialLoading) {
    return (
      <DashboardLayout
        title="Email Extractor"
        description="Extract email addresses from store websites"
      >
        <EmailExtractorSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Email Extractor"
      description="Extract email addresses from store websites"
    >
      {/* Subscription Limits Display */}
      {subscriptionInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Daily Usage Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Daily Usage</CardTitle>
                </div>
                <Badge variant="outline" className="capitalize">
                  {subscriptionInfo.limits.planName} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    URLs extracted today
                  </span>
                  <span className="font-medium">
                    {subscriptionInfo.usage.used} / {subscriptionInfo.limits.isUnlimited ? '∞' : subscriptionInfo.limits.dailyExtractionLimit}
                  </span>
                </div>
                <Progress 
                  value={subscriptionInfo.limits.isUnlimited ? 0 : (subscriptionInfo.usage.used / subscriptionInfo.limits.dailyExtractionLimit) * 100}
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {subscriptionInfo.usage.remaining > 0 ? `${subscriptionInfo.usage.remaining} remaining` : 'Limit reached'}
                  </span>
                  <span>
                    Resets at {new Date(subscriptionInfo.usage.resetTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Features Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Plan Features</CardTitle>
              {subscriptionInfo?.needsUpgrade && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpgrade}
                >
                  Upgrade Plan
                </Button>
              )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Daily Extraction Limit</span>
                  <span className="font-medium">
                    {subscriptionInfo.limits.isUnlimited ? 'Unlimited' : subscriptionInfo.limits.dailyExtractionLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">CSV Upload</span>
                  <div className="flex items-center gap-2">
                    {subscriptionInfo?.canUseCsv ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {subscriptionInfo?.canUseCsv ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
                {subscriptionInfo && !subscriptionInfo.canUseCsv && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      CSV upload is not available in your current plan. 
                    <Button
                      variant="link"
                      className="p-0 h-auto ml-1"
                      onClick={handleUpgrade}
                    >
                      Upgrade now
                    </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => {
        // Prevent free users from accessing Multiple URLs tab
        if (value === 'multiple' && isFreePlan) {
          toast({
            title: 'Upgrade Required',
            description: 'Multiple URL extraction is not available in the free plan. Upgrade to Pro or Enterprise to use this feature.',
            variant: 'destructive'
          });
          router.push('/pricing');
          return;
        }
        setActiveTab(value);
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="single" 
            className="flex items-center gap-2"
            disabled={!!(subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited)}
          >
            <Link className="h-4 w-4" />
            Single URL
            {subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited && (
              <Crown className="h-3 w-3 text-yellow-500" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="multiple" 
            className="flex items-center gap-2"
            disabled={isFreePlan || !!(subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited)}
          >
            <FileText className="h-4 w-4" />
            Multiple URLs
            {isFreePlan && (
              <Crown className="h-3 w-3 text-yellow-500" />
            )}
            {subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited && !isFreePlan && (
              <Crown className="h-3 w-3 text-yellow-500" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="csv" 
            className="flex items-center gap-2"
            disabled={!subscriptionInfo?.canUseCsv || false}
          >
            <Upload className="h-4 w-4" />
            CSV Upload
            {!subscriptionInfo?.canUseCsv && (
              <Crown className="h-3 w-3 text-yellow-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extract from Single URL</CardTitle>
              <CardDescription>
                Enter a single store website URL to extract email addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>You've reached your daily limit of {subscriptionInfo.limits.dailyExtractionLimit} extractions.</p>
                      <Button onClick={handleUpgrade} className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Plan for More Extractions
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="single-url">Store Website URL</Label>
                    <Input
                      id="single-url"
                      type="text"
                      placeholder="example-store.com or https://example-store.com"
                      value={singleUrl}
                      onChange={(e) => setSingleUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      You can enter URLs with or without https:// - we'll add it automatically if needed.
                    </p>
                  </div>
                  <Button 
                    onClick={handleSingleUrlExtraction} 
                    disabled={isLoading || !singleUrl.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Extract Emails
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extract from Multiple URLs</CardTitle>
              <CardDescription>
                Enter multiple store website URLs (one per line, max 50)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFreePlan ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>Multiple URL extraction is not available in the free plan. Upgrade to Pro or Enterprise to extract emails from multiple URLs at once.</p>
                      <Button onClick={handleUpgrade} className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Plan for Multiple URL Extraction
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>You've reached your daily limit of {subscriptionInfo.limits.dailyExtractionLimit} extractions.</p>
                      <Button onClick={handleUpgrade} className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Plan for More Extractions
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="multiple-urls">Store Website URLs</Label>
                    <Textarea
                      id="multiple-urls"
                      placeholder="example-store1.com&#10;example-store2.com&#10;https://example-store3.com"
                      value={multipleUrls}
                      onChange={(e) => setMultipleUrls(e.target.value)}
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter one URL per line. Maximum 50 URLs allowed. You can enter URLs with or without https://.
                    </p>
                  </div>
                  <Button 
                    onClick={handleMultipleUrlsExtraction} 
                    disabled={isLoading || !multipleUrls.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Extract Emails
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extract from CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file containing store website URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!subscriptionInfo?.canUseCsv ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>CSV upload is not available in your current plan. Upgrade to Pro or Enterprise to use this feature.</p>
                      <Button onClick={handleUpgrade} className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Plan for CSV Upload
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : subscriptionInfo && subscriptionInfo.usage.used >= subscriptionInfo.usage.limit && !subscriptionInfo.limits.isUnlimited ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>You've reached your daily limit of {subscriptionInfo.limits.dailyExtractionLimit} extractions.</p>
                      <Button onClick={handleUpgrade} className="w-full">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Plan for More Extractions
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">CSV File</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CSV file should contain URLs in the first column. Maximum file size: 5MB.
                    </p>
                  </div>

                  {csvFile && (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleCsvFileUpload} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Parse CSV File
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {parsedUrls.length > 0 && (
                    <div className="space-y-2">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Successfully parsed {parsedUrls.length} URLs from CSV file
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={handleCsvExtraction} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Extract Emails from {parsedUrls.length} URLs
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Job Status */}
      {currentJob && (
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
                            <div key={emailIndex} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                              <span className="truncate max-w-32">{email}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyEmails([email])}
                                className="h-4 w-4 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {currentJob.status === 'completed' && (
              <Button 
                onClick={() => downloadResults(currentJob.jobId)}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Results as CSV
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Extraction History */}
      {extractionHistory.length > 0 && (
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
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>Websites: {job.urls.slice(0, 2).join(', ')}{job.urls.length > 2 && ` +${job.urls.length - 2} more`}</p>
                      <p>{new Date(job.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResults(job.jobId)}
                          title="Download CSV"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareExtraction(job)}
                          title="Share extraction"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentJob(job)}
                      title="View details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {extractionHistory.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/email-extractor/history')}
                  >
                    View All Extractions ({extractionHistory.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </DashboardLayout>
  );
}
