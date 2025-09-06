'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UpgradePlanModal } from '@/components/modals/UpgradePlanModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob, EmailExtractorAPI } from '@/lib/api/email-extractor';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Link,
  Loader2,
  Mail,
  Upload,
  XCircle
} from 'lucide-react';
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchInProgress = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch subscription info and simulate initial loading
    const fetchData = async () => {
      // Prevent duplicate calls
      if (fetchInProgress.current) {
        return;
      }

      try {
        fetchInProgress.current = true;
        const response = await EmailExtractorAPI.getSubscriptionInfo();
        if (response.success) {
          setSubscriptionInfo(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription info:', error);
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

    await startExtraction([singleUrl.trim()], 'single');
  };

  const handleMultipleUrlsExtraction = async () => {
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
      setUpgradeReason('CSV upload is not available in your current plan. Upgrade to Pro or Enterprise to use this feature.');
      setShowUpgradeModal(true);
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
          setUpgradeReason(response.message || 'CSV upload requires an upgrade.');
          setShowUpgradeModal(true);
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

    await startExtraction(parsedUrls, 'csv');
  };

  const handleUpgrade = (plan: 'pro' | 'enterprise') => {
    // Here you would typically redirect to a payment page or handle the upgrade
    toast({
      title: 'Upgrade Selected',
      description: `Redirecting to upgrade to ${plan} plan...`,
    });
    setShowUpgradeModal(false);
    // TODO: Implement actual upgrade flow
  };

  const startExtraction = async (urls: string[], extractionType: 'single' | 'multiple' | 'csv' = 'multiple') => {
    try {
      setIsLoading(true);
      const response = await EmailExtractorAPI.startExtraction(urls, extractionType);
      
      if (response.success) {
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
    const pollInterval = setInterval(async () => {
      try {
        const response = await EmailExtractorAPI.getExtraction(jobId);
        
        if (response.success && response.data) {
          setCurrentJob(response.data);
          
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            clearInterval(pollInterval);
            loadExtractionHistory();
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 2000);

    // Clear interval after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const loadExtractionHistory = async () => {
    try {
      const response = await EmailExtractorAPI.getExtractions(10, 0);
      if (response.success) {
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
    return (completedResults / job.urls.length) * 100;
  };

  const EmailExtractorSkeleton = () => (
    <div className="space-y-6">
      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="grid w-full grid-cols-3 gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Single URL Tab Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Multiple URLs Tab Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* CSV Upload Tab Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-76" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
              <Skeleton className="h-3 w-80" />
            </div>
          </CardContent>
        </Card>

        {/* Current Job Status Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2 max-h-60">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Extraction History Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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
                {subscriptionInfo.needsUpgrade && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUpgradeReason(subscriptionInfo.upgradeRecommendation?.reason || 'Upgrade to unlock more features');
                      setShowUpgradeModal(true);
                    }}
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
                    {subscriptionInfo.canUseCsv ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {subscriptionInfo.canUseCsv ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
                {!subscriptionInfo.canUseCsv && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      CSV upload is not available in your current plan. 
                      <Button
                        variant="link"
                        className="p-0 h-auto ml-1"
                        onClick={() => {
                          setUpgradeReason('CSV upload is not available in your current plan. Upgrade to Pro or Enterprise to use this feature.');
                          setShowUpgradeModal(true);
                        }}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Single URL
          </TabsTrigger>
          <TabsTrigger value="multiple" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Multiple URLs
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
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
              <div className="space-y-2">
                <Label htmlFor="single-url">Store Website URL</Label>
                <Input
                  id="single-url"
                  type="url"
                  placeholder="https://example-store.com"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                />
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
              <div className="space-y-2">
                <Label htmlFor="multiple-urls">Store Website URLs</Label>
                <Textarea
                  id="multiple-urls"
                  placeholder="https://example-store1.com&#10;https://example-store2.com&#10;https://example-store3.com"
                  value={multipleUrls}
                  onChange={(e) => setMultipleUrls(e.target.value)}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Enter one URL per line. Maximum 50 URLs allowed.
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
            </CardTitle>
            <CardDescription>
              Job ID: {currentJob.jobId}
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
            
            <Progress value={getProgress(currentJob)} className="w-full" />
            
            <div className="space-y-2">
              <h4 className="font-medium">Results:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {currentJob.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
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
                    </div>
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
              {extractionHistory.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResults(job.jobId)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentJob(job)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        currentPlan={subscriptionInfo?.limits.planName || 'free'}
        feature="CSV Upload"
        reason={upgradeReason}
      />
    </DashboardLayout>
  );
}
