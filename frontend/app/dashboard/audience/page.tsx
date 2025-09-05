'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrackingAPI } from '@/lib/api';
import { TrackingLog } from '@/types';
import { ChevronLeft, ChevronRight, Download, Mail, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AudiencePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [emailRecords, setEmailRecords] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [campaigns, setCampaigns] = useState<Array<{_id: string, name: string}>>([]);
  const fetchInProgress = useRef(false);

  // Fetch email tracking data
  const fetchEmailRecords = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchInProgress.current) {
      return;
    }
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);

      // Get user's tracking summary to get all campaigns
      const summaryResponse = await TrackingAPI.getUserTrackingSummary();
      if (summaryResponse.success && summaryResponse.data) {
        const campaignIds = summaryResponse.data.topPerformingCampaigns.map(c => c.campaignId);
        
        // Fetch tracking logs for all campaigns
        const allLogs: TrackingLog[] = [];
        for (const campaignId of campaignIds) {
          const logsResponse = await TrackingAPI.getCampaignLogs(campaignId, {
            limit: 1000, // Get all logs for now
            offset: 0
          });
          if (logsResponse.success && logsResponse.data) {
            allLogs.push(...logsResponse.data.logs);
          }
        }

        // Set campaigns for filter
        setCampaigns(summaryResponse.data.topPerformingCampaigns.map(c => ({
          _id: c.campaignId,
          name: `Campaign ${c.campaignId.slice(-4)}`
        })));

        // Filter and paginate
        let filteredLogs = allLogs;
        
        if (searchTerm) {
          filteredLogs = filteredLogs.filter(log => 
            log.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (statusFilter !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.status === statusFilter);
        }

        // Sort by sent date (newest first)
        filteredLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

        setTotalItems(filteredLogs.length);
        setTotalPages(Math.ceil(filteredLogs.length / itemsPerPage));
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setEmailRecords(filteredLogs.slice(startIndex, endIndex));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch email records');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, campaignFilter]);

  useEffect(() => {
    fetchEmailRecords();
  }, [fetchEmailRecords]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'opened':
        return 'outline';
      case 'replied':
        return 'outline';
      case 'failed':
        return 'destructive';
      case 'bounced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'sent':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'opened':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'replied':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'bounced':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Email', 'Status', 'Sent Date', 'Delivered Date', 'Opened Date', 'Replied Date', 'Error Message'];
    const csvContent = [
      headers.join(','),
      ...emailRecords.map(record => [
        record.recipientEmail,
        record.status,
        formatDate(record.sentAt),
        record.deliveredAt ? formatDate(record.deliveredAt) : '',
        record.openedAt ? formatDate(record.openedAt) : '',
        record.repliedAt ? formatDate(record.repliedAt) : '',
        record.errorMessage || ''
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                <Button 
                  onClick={() => fetchEmailRecords()} 
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Audience"
      description="Track email delivery and engagement across all your campaigns"
      actions={
        <Button 
          onClick={handleExport}
          variant="outline"
          disabled={totalItems === 0 || loading}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Filters - Only show when there are email records */}
        {!loading && totalItems > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Email Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Records Table */}
        {emailRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No email records found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Email records will appear here once you start sending campaigns.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sent Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Delivered</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Opened</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Replied</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailRecords.map((record) => (
                        <tr key={record.emailId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {record.recipientEmail}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={getStatusBadgeVariant(record.status)}
                              className={getStatusColor(record.status)}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(record.sentAt)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {record.deliveredAt ? formatDate(record.deliveredAt) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {record.openedAt ? formatDate(record.openedAt) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {record.repliedAt ? formatDate(record.repliedAt) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-red-600 dark:text-red-400">
                            {record.errorMessage || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} records
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}