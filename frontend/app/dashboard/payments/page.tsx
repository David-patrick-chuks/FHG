'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaymentsLoadingSkeleton } from '@/components/payments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentAPI, PaymentHistory, PaymentHistoryFilters } from '@/lib/api/payment';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Crown,
    Download,
    Filter,
    Search,
    X,
    XCircle,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function UserPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [canUpgrade, setCanUpgrade] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState<PaymentHistoryFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPayments();
    checkUpgradeEligibility();
  }, [filters]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await PaymentAPI.getPaymentHistory(filters);
      
      if (response.success && response.data) {
        setPayments(response.data.payments);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load payment history');
      }
    } catch (error) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const checkUpgradeEligibility = async () => {
    try {
      const response = await PaymentAPI.canUpgrade();
      if (response.success && response.data) {
        setCanUpgrade(response.data.canUpgrade);
      }
    } catch (error) {
      console.error('Error checking upgrade eligibility:', error);
      // Default to showing upgrade banner if API fails
      setCanUpgrade(true);
    }
  };

  // Filter and search functions
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1 // Reset to first page when searching
    }));
  };

  const handleFilterChange = (key: keyof PaymentHistoryFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    setFilters(prev => ({
      ...prev,
      limit,
      page: 1 // Reset to first page when changing items per page
    }));
  };

  const handleDownloadReceipt = async (reference: string) => {
    try {
      await PaymentAPI.downloadReceipt(reference);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'enterprise':
        return <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Payment History"
        description="View your payment transactions and subscription history"
      >
        <PaymentsLoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Payment History"
      description="View your payment transactions and subscription history"
      // actions={
      //   <Button
      //     variant="outline"
      //     onClick={() => router.push('/dashboard/payments/subscription')}
      //     className="flex items-center gap-2"
      //   >
      //     <Settings className="h-4 w-4" />
      //     Manage Subscription
      //   </Button>
      // }
    >
      <div className="space-y-6">
        {/* Upgrade Section - Only show if user can upgrade */}
        {canUpgrade && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Need to upgrade your plan?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Access more features and higher limits with our premium plans.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full sm:w-auto"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment List - Only show if user has transactions */}
        {pagination.totalItems > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Payment Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                  {(filters.status || filters.subscriptionTier || filters.billingCycle || filters.search) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by reference, gateway response, or failure reason..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Status
                      </label>
                      <Select
                        value={filters.status || ''}
                        onValueChange={(value) => handleFilterChange('status', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Plan
                      </label>
                      <Select
                        value={filters.subscriptionTier || ''}
                        onValueChange={(value) => handleFilterChange('subscriptionTier', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All plans" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All plans</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Billing Cycle
                      </label>
                      <Select
                        value={filters.billingCycle || ''}
                        onValueChange={(value) => handleFilterChange('billingCycle', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All cycles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All cycles</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Sort By
                      </label>
                      <Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onValueChange={(value) => {
                          const [sortBy, sortOrder] = value.split('-');
                          handleFilterChange('sortBy', sortBy);
                          handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
                          <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
                          <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                          <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                          <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                          <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {payments.length} of {pagination.totalItems} payments
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm">Items per page:</span>
                    <Select
                      value={filters.limit?.toString() || '10'}
                      onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-16 sm:w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Payment Items */}
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Mobile Layout */}
                    <div className="flex flex-col sm:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            {getPlanIcon(payment.subscriptionTier)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {payment.subscriptionTier.toUpperCase()} - {payment.billingCycle}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {formatPrice(payment.amount)}
                          </p>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Reference: {payment.reference}
                        </p>
                        {payment.paidAt && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Paid: {formatDate(payment.paidAt)}
                          </p>
                        )}
                      </div>
                      
                      {payment.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownloadReceipt(payment.reference)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download Receipt
                        </Button>
                      )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          {getPlanIcon(payment.subscriptionTier)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {payment.subscriptionTier.toUpperCase()} - {payment.billingCycle}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Reference: {payment.reference}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(payment.createdAt)}
                          </p>
                          {payment.paidAt && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Paid: {formatDate(payment.paidAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(payment.amount)}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(payment.status)}
                        </div>
                        {payment.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleDownloadReceipt(payment.reference)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Mobile Pagination */}
                  <div className="flex flex-col sm:hidden space-y-4">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
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
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State - Only show when no transactions and no filters applied */}
        {pagination.totalItems === 0 && !filters.search && !filters.status && !filters.subscriptionTier && !filters.billingCycle && (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-6 opacity-50 text-gray-400 dark:text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No payment history</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't made any payments yet. Upgrade to a paid plan to start using premium features.
              </p>
              <Button
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>
        )}

      
      </div>
    </DashboardLayout>
  );
}