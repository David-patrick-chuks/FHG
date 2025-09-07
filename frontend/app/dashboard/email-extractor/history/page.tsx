'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { EmailExtractionJob, EmailExtractorAPI } from '@/lib/api/email-extractor';
import {
    CheckCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Globe,
    Loader2,
    Mail,
    Search,
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

export default function EmailExtractorHistoryPage() {
  const router = useRouter();
  const [extractions, setExtractions] = useState<EmailExtractionJob[]>([]);
  const [filteredExtractions, setFilteredExtractions] = useState<EmailExtractionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const itemsPerPage = 20;

  useEffect(() => {
    loadExtractions();
  }, []);

  useEffect(() => {
    // Filter extractions based on search term
    if (searchTerm.trim()) {
      const filtered = extractions.filter(job =>
        job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.urls.some(url => url.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.results.some(result => 
          result.emails.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
      setFilteredExtractions(filtered);
    } else {
      setFilteredExtractions(extractions);
    }
  }, [searchTerm, extractions]);

  const loadExtractions = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const skip = (page - 1) * itemsPerPage;
      const response = await EmailExtractorAPI.getExtractions(itemsPerPage, skip);
      
      if (response.success && response.data) {
        if (append) {
          setExtractions(prev => [...prev, ...response.data!]);
        } else {
          setExtractions(response.data);
        }
        setHasMore(response.data.length === itemsPerPage);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load extraction history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadExtractions(nextPage, true);
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

  const ExtractionSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout
      title="Email Extraction History"
      description="View all your email extraction jobs and results"
    >
      <div className="space-y-6">
        {/* Search and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job ID, URL, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredExtractions.length} of {extractions.length} extractions
            </div>
          </div>
        </div>

        {/* Extractions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Extractions</CardTitle>
            <CardDescription>
              Complete history of your email extraction jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && extractions.length === 0 ? (
              <ExtractionSkeleton />
            ) : filteredExtractions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No extractions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No extractions match your search criteria.' : 'You haven\'t performed any email extractions yet.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/dashboard/email-extractor')}>
                    Start Your First Extraction
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExtractions.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
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
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
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
                          onClick={() => router.push(`/dashboard/email-extractor?jobId=${job.jobId}`)}
                          title="View details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Website URLs */}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Websites:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.urls.slice(0, 3).map((url, index) => (
                          <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-32">{url}</span>
                          </div>
                        ))}
                        {job.urls.length > 3 && (
                          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                            +{job.urls.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Results */}
                    {job.results.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Email Results:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {job.results.slice(0, 3).map((result, index) => (
                            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-mono truncate max-w-48">{result.url}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">{result.emails.length} emails</span>
                                  {result.emails.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyEmails(result.emails)}
                                      className="h-5 w-5 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {result.emails.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {result.emails.slice(0, 3).map((email, emailIndex) => (
                                    <div key={emailIndex} className="flex items-center gap-1 bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                                      <span className="truncate max-w-24">{email}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyEmails([email])}
                                        className="h-3 w-3 p-0"
                                      >
                                        <Copy className="h-2 w-2" />
                                      </Button>
                                    </div>
                                  ))}
                                  {result.emails.length > 3 && (
                                    <span className="text-xs text-muted-foreground">+{result.emails.length - 3} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {job.results.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{job.results.length - 3} more results
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && !searchTerm && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
