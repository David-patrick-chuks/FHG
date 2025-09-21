'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAPI, AdminUser, SuspendUserRequest, UpdateSubscriptionRequest } from '@/lib/api/admin';
import {
    Ban,
    CheckCircle,
    Crown,
    Edit,
    RefreshCw,
    Search,
    Shield,
    User,
    Users,
    XCircle,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateSubscriptionRequest>({
    tier: 'free',
    duration: 1,
    amount: 0,
    paymentMethod: 'CASH'
  });
  const [suspendData, setSuspendData] = useState<SuspendUserRequest>({
    reason: ''
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, router, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAllUsers(currentPage, 20);
      
      if (response.success && response.data) {
        console.log('API Response:', response);
        console.log('Response data type:', typeof response.data);
        console.log('Is array:', Array.isArray(response.data));
        
        // Handle both possible response structures
        if (Array.isArray(response.data)) {
          // Direct array response
          console.log('Using direct array response, users count:', response.data.length);
          setUsers(response.data);
          setTotalPages(1); // Default to 1 page if no pagination info
        } else if (response.data.users) {
          // Nested structure with users and pagination
          console.log('Using nested response, users count:', response.data.users.length);
          setUsers(response.data.users);
          setTotalPages(response.data.pagination?.totalPages || 1);
        } else {
          console.log('No valid data structure found');
          setUsers([]);
          setTotalPages(1);
        }
      } else {
        console.log('API call failed or no data:', response);
        toast.error('Failed to load users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'free':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"><User className="w-3 h-3 mr-1" />Free</Badge>;
      case 'pro':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"><Zap className="w-3 h-3 mr-1" />Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"><Crown className="w-3 h-3 mr-1" />Enterprise</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">{subscription}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <XCircle className="w-3 h-3 mr-1" />Suspended
      </Badge>
    );
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser) return;

    try {
      const response = await AdminAPI.updateUserSubscription(selectedUser._id, updateData);
      
      if (response.success) {
        toast.success('User subscription updated successfully');
        setShowUpdateModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update subscription');
      }
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await AdminAPI.suspendUser(selectedUser._id, suspendData);
      
      if (response.success) {
        toast.success('User suspended successfully');
        setShowSuspendModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to suspend user');
      }
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await AdminAPI.activateUser(userId);
      
      if (response.success) {
        toast.success('User activated successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to activate user');
      }
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive);
    const matchesSubscription = subscriptionFilter === 'all' || user.subscription === subscriptionFilter;
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  // Debug logging
  console.log('Users state:', users);
  console.log('Users length:', users?.length);
  console.log('Filtered users:', filteredUsers);
  console.log('Filtered users length:', filteredUsers.length);

  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="User Management"
        description="Manage users and their subscriptions"
        actions={
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        }
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="animate-pulse">
            {/* Filters Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-4"></div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-full sm:w-48 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-full sm:w-48 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            {/* User Cards Skeleton */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      description="Manage users and their subscriptions"
      actions={
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={loading}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
          <span className="sm:hidden">↻</span>
        </Button>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 h-10 sm:h-11 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="w-full sm:w-48">
                <label htmlFor="subscription-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan
                </label>
                <select
                  id="subscription-filter"
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="w-full px-3 py-2 h-10 sm:h-11 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* User List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white dark:bg-gray-800 rounded-lg border-0 shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {user.username}
                            </h3>
                            {user.isAdmin && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                                <Shield className="w-3 h-3 mr-1" />Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getSubscriptionBadge(user.subscription)}
                            {getStatusBadge(user.isActive)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-3">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Joined: {formatDate(user.createdAt)}
                          </p>
                          {user.lastLoginAt && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Last login: {formatDate(user.lastLoginAt)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setUpdateData({
                                tier: user.subscription.toLowerCase() as any,
                                duration: 1,
                                amount: 0,
                                paymentMethod: 'CASH'
                              });
                              setShowUpdateModal(true);
                            }}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setSuspendData({ reason: '' });
                                setShowSuspendModal(true);
                              }}
                              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Suspend</span>
                              <span className="sm:hidden">Suspend</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateUser(user._id)}
                              className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Activate</span>
                              <span className="sm:hidden">Activate</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">←</span>
                  </Button>
                  <span className="px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">→</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Subscription Modal */}
        {showUpdateModal && selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-blue-200/50 dark:border-blue-700/50 shadow-2xl">
              <CardHeader className="border-b border-blue-200/50 dark:border-blue-700/50">
                <CardTitle className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-100">Update Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div>
                  <label htmlFor="subscription-tier" className="block text-sm font-medium mb-2">Subscription Tier</label>
                  <select
                    id="subscription-tier"
                    value={updateData.tier}
                    onChange={(e) => setUpdateData({ ...updateData, tier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (months)</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={updateData.duration}
                    onChange={(e) => setUpdateData({ ...updateData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <Input
                    type="number"
                    min="0"
                    value={updateData.amount}
                    onChange={(e) => setUpdateData({ ...updateData, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="payment-method" className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    id="payment-method"
                    value={updateData.paymentMethod}
                    onChange={(e) => setUpdateData({ ...updateData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHECK">Check</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleUpdateSubscription}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 sm:h-11"
                  >
                    Update Subscription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 h-10 sm:h-11"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suspend User Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-red-200/50 dark:border-red-700/50 shadow-2xl">
              <CardHeader className="border-b border-red-200/50 dark:border-red-700/50">
                <CardTitle className="text-lg sm:text-xl font-semibold text-red-900 dark:text-red-100">Suspend User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for suspension</label>
                  <Input
                    value={suspendData.reason}
                    onChange={(e) => setSuspendData({ ...suspendData, reason: e.target.value })}
                    placeholder="Enter reason for suspension..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleSuspendUser}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10 sm:h-11"
                    disabled={!suspendData.reason.trim()}
                  >
                    Suspend User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuspendModal(false)}
                    className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900/20 h-10 sm:h-11"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
