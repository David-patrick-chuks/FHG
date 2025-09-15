'use client';

import { CampaignEmptyState } from '@/components/campaigns/CampaignEmptyState';
import { CampaignFilters } from '@/components/campaigns/CampaignFilters';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { CampaignModals } from '@/components/campaigns/CampaignModals';
import { CampaignPagination } from '@/components/campaigns/CampaignPagination';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignLimitModal } from '@/components/modals/CampaignLimitModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BotsAPI, CampaignsAPI } from '@/lib/api';
import { Bot, Campaign } from '@/types';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [pausingCampaign, setPausingCampaign] = useState<Campaign | null>(null);
  const [stoppingCampaign, setStoppingCampaign] = useState<Campaign | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showCampaignLimitModal, setShowCampaignLimitModal] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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
  const fetchCampaignsInProgress = useRef(false);

  // Helper function to get max campaigns for a plan
  const getMaxCampaigns = (plan: string) => {
    switch (plan) {
      case 'free': return 2;
      case 'basic': return 10;
      case 'premium': return 50;
      default: return 2;
    }
  };

  // Check if user can create more campaigns
  const canCreateMoreCampaigns = () => {
    const maxCampaigns = getMaxCampaigns(userPlan);
    return campaigns.length < maxCampaigns;
  };

  // Handle create campaign button click
  const handleCreateCampaignClick = () => {
    if (canCreateMoreCampaigns()) {
      router.push('/dashboard/campaigns/create');
    } else {
      setShowCampaignLimitModal(true);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch campaigns data
  const fetchCampaigns = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchCampaignsInProgress.current) {
      return;
    }
    
    try {
      fetchCampaignsInProgress.current = true;
      setCampaignsLoading(true);
      setCampaignsError(null);
      
      const response = await CampaignsAPI.getCampaigns({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery
      });

      if (response.success && response.data) {
        setCampaigns(response.data.data || []);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCampaigns(response.data.pagination.total);
        
        // User plan is set in separate useEffect
      } else {
        setCampaignsError(response.error || 'Failed to fetch campaigns');
      }
    } catch (error) {
      setCampaignsError(error instanceof Error ? error.message : 'Failed to fetch campaigns');
    } finally {
      setCampaignsLoading(false);
      fetchCampaignsInProgress.current = false;
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery, user?.subscription]);

  // Fetch bots data
  const fetchBots = useCallback(async () => {
    try {
      setBotsLoading(true);
      const response = await BotsAPI.getBots();
      if (response.success && response.data) {
        setBots(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    } finally {
      setBotsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchBots();
  }, []);

  // Set user plan when user changes
  useEffect(() => {
    setUserPlan((user?.subscription as 'free' | 'basic' | 'premium') || 'free');
  }, [user?.subscription]);

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
      const response = await CampaignsAPI.pauseCampaign(campaign._id);
      
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
      const response = await CampaignsAPI.resumeCampaign(campaign._id);
      
      if (response.success) {
        await fetchCampaigns(); // Refresh the list
      } else {
        console.error('Failed to resume campaign:', response.error);
      }
    } catch (error) {
      console.error('Error resuming campaign:', error);
    }
  };

  const handleStopCampaign = async (campaign: Campaign) => {
    try {
      setIsStopping(true);
      const response = await CampaignsAPI.updateCampaign(campaign._id, {
        status: 'stopped'
      });
      
      if (response.success) {
        await fetchCampaigns(); // Refresh the list
        setIsStopDialogOpen(false);
        setStoppingCampaign(null);
      } else {
        console.error('Failed to stop campaign:', response.error);
      }
    } catch (error) {
      console.error('Error stopping campaign:', error);
    } finally {
      setIsStopping(false);
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
      case 'stopped':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'completed':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'stopped':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  // Modal handlers
  const handlePauseConfirm = () => {
    if (pausingCampaign) {
      handlePauseCampaign(pausingCampaign);
    }
  };

  const handleStopConfirm = () => {
    if (stoppingCampaign) {
      handleStopCampaign(stoppingCampaign);
    }
  };

  const handlePauseClick = (campaign: Campaign) => {
    setPausingCampaign(campaign);
    setIsPauseDialogOpen(true);
  };

  const handleStopClick = (campaign: Campaign) => {
    setStoppingCampaign(campaign);
    setIsStopDialogOpen(true);
  };

  if (campaignsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            
            {/* Filters skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-48">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-32">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Campaign cards skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  {/* Campaign header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  
                  {/* Campaign stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    </div>
                    <div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                  
                  {/* Bot info */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
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
    <DashboardLayout 
      title="Campaigns" 
      description="Manage your email campaigns and track their performance"
      actions={
        <Button 
          onClick={handleCreateCampaignClick}
          disabled={!botsLoading && bots.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={!botsLoading && bots.length === 0 ? "You need to create a bot first before creating campaigns" : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters and Search - Only show when there are campaigns */}
        {campaigns.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <CampaignFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        {filteredCampaigns.length === 0 ? (
          <CampaignEmptyState
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            botsLoading={botsLoading}
            botsLength={bots.length}
            onCreateCampaign={handleCreateCampaignClick}
            onCreateBot={() => router.push('/dashboard/bots/create')}
          />
        ) : (
          <>
            <CampaignList
              campaigns={filteredCampaigns}
              getBotName={getBotName}
              onPause={handlePauseClick}
              onResume={handleResumeCampaign}
              onStop={handleStopClick}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusColor={getStatusColor}
              viewMode={viewMode}
            />

            <CampaignPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCampaigns={totalCampaigns}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Modals */}
        <CampaignModals
          isPauseDialogOpen={isPauseDialogOpen}
          setIsPauseDialogOpen={setIsPauseDialogOpen}
          isStopDialogOpen={isStopDialogOpen}
          setIsStopDialogOpen={setIsStopDialogOpen}
          pausingCampaign={pausingCampaign}
          stoppingCampaign={stoppingCampaign}
          isPausing={isPausing}
          isStopping={isStopping}
          onPauseConfirm={handlePauseConfirm}
          onStopConfirm={handleStopConfirm}
        />

        {/* Campaign Limit Modal */}
        <CampaignLimitModal
          isOpen={showCampaignLimitModal}
          onClose={() => setShowCampaignLimitModal(false)}
          currentPlan={userPlan}
          currentCampaigns={campaigns.length}
          maxCampaigns={getMaxCampaigns(userPlan)}
        />
      </div>
    </DashboardLayout>
  );
}