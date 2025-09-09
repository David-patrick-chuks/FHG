'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AdminAPI, AdminUser, UpdateSubscriptionRequest, SuspendUserRequest } from '@/lib/api/admin';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Crown,
  Zap,
  User,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Calendar,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
    tier: 'FREE',
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
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      toast.error('Failed to load users');
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
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Free</Badge>;
      case 'pro':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"><Zap className="w-3 h-3 mr-1" />Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"><Crown className="w-3 h-3 mr-1" />Enterprise</Badge>;
      default:
        return <Badge variant="secondary">{subscription}</Badge>;
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive);
    const matchesSubscription = subscriptionFilter === 'all' || user.subscription === subscriptionFilter;
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout
        title="User Management"
        description="Manage users and their subscriptions"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
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
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="w-48">
                <label htmlFor="subscription-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan
                </label>
                <select
                  id="subscription-filter"
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* User List */}
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getSubscriptionBadge(user.subscription)}
                          {getStatusBadge(user.isActive)}
                          {user.isAdmin && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                              <Shield className="w-3 h-3 mr-1" />Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Joined: {formatDate(user.createdAt)}
                      </p>
                      {user.lastLoginAt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last login: {formatDate(user.lastLoginAt)}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setUpdateData({
                              tier: user.subscription.toUpperCase() as any,
                              duration: 1,
                              amount: 0,
                              paymentMethod: 'CASH'
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
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
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateUser(user._id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Subscription Modal */}
        {showUpdateModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Update Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="subscription-tier" className="block text-sm font-medium mb-2">Subscription Tier</label>
                  <select
                    id="subscription-tier"
                    value={updateData.tier}
                    onChange={(e) => setUpdateData({ ...updateData, tier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateSubscription}
                    className="flex-1"
                  >
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Suspend User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for suspension</label>
                  <Input
                    value={suspendData.reason}
                    onChange={(e) => setSuspendData({ ...suspendData, reason: e.target.value })}
                    placeholder="Enter reason for suspension..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSuspendUser}
                    className="flex-1"
                    disabled={!suspendData.reason.trim()}
                  >
                    Suspend
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuspendModal(false)}
                    className="flex-1"
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
