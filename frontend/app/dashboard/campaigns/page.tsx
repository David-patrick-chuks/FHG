'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignsAPI } from '@/lib/api';
import { Bot, Campaign } from '@/types';
import { ChevronLeft, ChevronRight, Grid3X3, List, Mail, Pause, Play, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CampaignsPage() {
  const router = useRouter();
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [pausingCampaign, setPausingCampaign] = useState<Campaign | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [botsLoading, setBotsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // Fetch campaigns data
  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      setCampaignsError(null);
      
      const response = await CampaignsAPI.getCampaigns({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        setCampaigns(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCampaigns(response.data.pagination.total);
      } else {
        setCampaignsError(response.error || 'Failed to fetch campaigns');
      }
    } catch (error) {
      setCampaignsError(error instanceof Error ? error.message : 'Failed to fetch campaigns');
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Fetch bots data
  const fetchBots = async () => {
    try {
      setBotsLoading(true);
      const response = await CampaignsAPI.getBots();
      if (response.success && response.data) {
        setBots(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    } finally {
      setBotsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    fetchBots();
  }, []);

  // Helper function to get bot name by ID
  const getBotName = (botId: string) => {
    const bot = bots.find(b => b._id === botId);
    return bot ? bot.name : 'Unknown Bot';
  };

  // Filter campaigns based on status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesStatus;
  });

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePauseCampaign = async (campaign: Campaign) => {
    try {
      setIsPausing(true);
      const response = await CampaignsAPI.updateCampaign(campaign._id, {
        status: 'paused'
      });
      
      if (response.success) {
        await fetchCampaigns(); // Refresh the list
        setIsPauseDialogOpen(false);
        setPausingCampaign(null);
      } else {
        console.error('Failed to pause campaign:', response.error);
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
    } finally {
      setIsPausing(false);
    }
  };

  const handleResumeCampaign = async (campaign: Campaign) => {
    try {
      const response = await CampaignsAPI.updateCampaign(campaign._id, {
        status: 'running'
      });
      
      if (response.success) {
        await fetchCampaigns(); // Refresh the list
      } else {
        console.error('Failed to resume campaign:', response.error);
      }
    } catch (error) {
      console.error('Error resuming campaign:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (campaignsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (campaignsError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">Error: {campaignsError}</p>
                <Button 
                  onClick={() => fetchCampaigns()} 
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your email campaigns and track their performance
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/campaigns/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first email campaign.'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button 
                    onClick={() => router.push('/dashboard/campaigns/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {campaign.name}
                            </h3>
                            <Badge 
                              variant={getStatusBadgeVariant(campaign.status)}
                              className={getStatusColor(campaign.status)}
                            >
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {campaign.description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <span>Bot: {getBotName(campaign.botId)}</span>
                            <span>Recipients: {campaign.emailList.length}</span>
                            <span>Sent: {campaign.sentEmails.length}</span>
                            <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {campaign.status === 'running' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPausingCampaign(campaign);
                                setIsPauseDialogOpen(true);
                              }}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResumeCampaign(campaign)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {campaign.name}
                            </h3>
                            <Badge 
                              variant={getStatusBadgeVariant(campaign.status)}
                              className={getStatusColor(campaign.status)}
                            >
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {campaign.description || 'No description provided'}
                        </p>
                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Bot:</span>
                            <span className="font-medium">{getBotName(campaign.botId)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recipients:</span>
                            <span className="font-medium">{campaign.emailList.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sent:</span>
                            <span className="font-medium">{campaign.sentEmails.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          {campaign.status === 'running' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setPausingCampaign(campaign);
                                setIsPauseDialogOpen(true);
                              }}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleResumeCampaign(campaign)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCampaigns)} of {totalCampaigns} campaigns
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

        {/* Pause Campaign Dialog */}
        <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pause Campaign</DialogTitle>
              <DialogDescription>
                Are you sure you want to pause "{pausingCampaign?.name}"? This will stop sending emails to remaining recipients.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPauseDialogOpen(false);
                  setPausingCampaign(null);
                }}
                disabled={isPausing}
              >
                Cancel
              </Button>
              <Button
                onClick={() => pausingCampaign && handlePauseCampaign(pausingCampaign)}
                disabled={isPausing}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isPausing ? 'Pausing...' : 'Pause Campaign'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}