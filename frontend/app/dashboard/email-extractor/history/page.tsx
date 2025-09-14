'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <div key={i} className="relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
        title="Email Extraction History"
        description="View all your email extraction jobs and results"
      >
        <div className="relative space-y-6">
          {/* Search and Stats */}
          <div className="group relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      placeholder="Search by job ID, URL, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 focus:bg-white/60 dark:focus:bg-slate-800/60 transition-all duration-300"
                    />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 px-3 py-1 rounded-lg">
                    {filteredExtractions.length} of {extractions.length} extractions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Extractions List */}
          <div className="group relative">
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 group-hover:shadow-xl group-hover:shadow-slate-900/10 transition-all duration-300"></div>
            <div className="relative p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All Extractions</h2>
                <p className="text-slate-600 dark:text-slate-300">Complete history of your email extraction jobs</p>
              </div>
            {loading && extractions.length === 0 ? (
              <ExtractionSkeleton />
            ) : filteredExtractions.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                  <Mail className="relative h-16 w-16 text-cyan-600 dark:text-cyan-400 mx-auto mb-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No extractions found</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                  {searchTerm ? 'No extractions match your search criteria.' : 'You haven\'t performed any email extractions yet.'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => router.push('/dashboard/email-extractor')}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Your First Extraction
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExtractions.map((job) => (
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
                          {job.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadResults(job.jobId)}
                                title="Download CSV"
                                className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareExtraction(job)}
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
                            onClick={() => router.push(`/dashboard/email-extractor/${job.jobId}`)}
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

                {/* Load More Button */}
                {hasMore && !searchTerm && (
                  <div className="text-center pt-6">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
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
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
