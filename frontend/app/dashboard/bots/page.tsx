'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlanLimitModal } from '@/components/modals/PlanLimitModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { BotsAPI } from '@/lib/api';
import { Bot } from '@/types';
import { Bot as BotIcon, ChevronLeft, ChevronRight, Edit, Grid3X3, List, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function BotsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [deletingBot, setDeletingBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [showCreateBotMessage, setShowCreateBotMessage] = useState(false);
  const [showInactiveBots, setShowInactiveBots] = useState(false);
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const [botActiveCampaigns, setBotActiveCampaigns] = useState<Record<string, boolean>>({});
  const fetchInProgress = useRef(false);

  // Helper function to get max bots for a plan
  const getMaxBots = (plan: string) => {
    switch (plan) {
      case 'free': return 2;
      case 'basic': return 10;
      case 'premium': return 50;
      default: return 2;
    }
  };

  // Check if user can create more bots
  const canCreateMoreBots = () => {
    const maxBots = getMaxBots(userPlan);
    return bots.length < maxBots;
  };

  // Handle create bot button click
  const handleCreateBotClick = () => {
    if (canCreateMoreBots()) {
      router.push('/dashboard/bots/create');
    } else {
      setShowPlanLimitModal(true);
    }
  };

  // Handle inactive bots toggle
  const handleToggleInactiveBots = () => {
    setShowInactiveBots(!showInactiveBots);
    setCurrentPage(1); // Reset to first page when toggling
  };

  // Check active campaigns for bots
  const checkBotActiveCampaigns = async (botId: string) => {
    try {
      // Ensure botId is a string
      const stringBotId = String(botId);
      const response = await BotsAPI.checkActiveCampaigns(stringBotId);
      if (response.success && response.data) {
        setBotActiveCampaigns(prev => ({
          ...prev,
          [stringBotId]: response.data?.hasActiveCampaigns || false
        }));
      }
    } catch (error) {
      console.error('Failed to check active campaigns:', error);
    }
  };

  // Check active campaigns for all bots
  const checkAllBotsActiveCampaigns = async () => {
    if (bots.length > 0) {
      await Promise.all(bots.map(bot => checkBotActiveCampaigns(String(bot._id))));
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch bots data
  const fetchBots = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchInProgress.current) {
      return;
    }
    
    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      setError(null);
      
      const response = await BotsAPI.getBots({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery,
        includeInactive: showInactiveBots
      });

      if (response.success && response.data) {
        setBots(response.data.data || []);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
        
        // Set user plan from auth context
        setUserPlan((user?.subscription as 'free' | 'basic' | 'premium') || 'free');
      } else {
        setError(response.error || 'Failed to fetch bots');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch bots');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentPage, pageSize, debouncedSearchQuery, showInactiveBots, user?.subscription]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  // Check active campaigns when bots are loaded
  useEffect(() => {
    if (bots.length > 0) {
      checkAllBotsActiveCampaigns();
    }
  }, [bots]);

  // Check for redirect message from campaign creation
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'create-bot-first') {
      setShowCreateBotMessage(true);
      // Clear the URL parameter
      router.replace('/dashboard/bots');
    }
  }, [searchParams, router]);

  const handleEditBot = (bot: Bot) => {
    // Check if bot has active campaigns
    if (botActiveCampaigns[bot._id]) {
      toast.error('Cannot edit bot while it has active campaigns. Please pause or complete the campaigns first.');
      return;
    }
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteBot = (bot: Bot) => {
    setDeletingBot(bot);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBot) return;

    try {
      const response = await BotsAPI.updateBot(editingBot._id, {
        name: formData.name,
        description: formData.description
      });

      if (response.success) {
        // Update the bot in the local state instead of refetching
        setBots(prevBots => 
          prevBots.map(bot => 
            bot._id === editingBot._id 
              ? { ...bot, name: formData.name, description: formData.description }
              : bot
          )
        );
        setIsEditDialogOpen(false);
        setEditingBot(null);
        setFormData({ name: '', description: '' });
      } else {
        console.error('Failed to update bot:', response.error);
      }
    } catch (error) {
      console.error('Error updating bot:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBot) return;

    try {
      const response = await BotsAPI.deleteBot(deletingBot._id);

      if (response.success) {
        await fetchBots(); // Refresh the list
    setIsDeleteDialogOpen(false);
    setDeletingBot(null);
      } else {
        console.error('Failed to delete bot:', response.error);
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
    }
  };

  const handleToggleBotStatus = async (bot: Bot) => {
    // Check if bot has active campaigns and user is trying to deactivate
    if (bot.isActive && botActiveCampaigns[bot._id]) {
      toast.error('Cannot deactivate bot while it has active campaigns. Please pause or complete the campaigns first.');
      return;
    }

    try {
      const response = await BotsAPI.updateBot(bot._id, {
        isActive: !bot.isActive
      });

      if (response.success) {
        // Update the bot in the local state instead of refetching
        setBots(prevBots => 
          prevBots.map(b => 
            b._id === bot._id 
              ? { ...b, isActive: !b.isActive }
              : b
          )
        );
      } else {
        console.error('Failed to toggle bot status:', response.error);
      }
    } catch (error) {
      console.error('Error toggling bot status:', error);
    }
  };

  const getBotAvatar = (bot: Bot) => {
    // Generate a consistent avatar based on bot name
    const initials = bot.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return initials;
  };

  const getBotStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Bots"
        description="Manage your AI-powered email bots and their configurations"
        actions={
          <Button 
            onClick={handleCreateBotClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bot
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Filters and Search Skeleton */}
          <Card className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="w-full sm:w-48">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="w-full sm:w-32">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow animate-pulse">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  onClick={() => fetchBots()} 
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
      title="Bots"
      description="Manage your AI-powered email bots and their configurations"
        actions={
          bots.length > 0 ? (
            <Button 
              onClick={handleCreateBotClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Bot
            </Button>
          ) : undefined
        }
    >
      <div className="space-y-6">

        {/* Message for users redirected from campaign creation */}
        {showCreateBotMessage && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BotIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Bot Required for Campaigns
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">
                    You need to create at least one AI bot before you can create email campaigns. 
                    Bots are responsible for sending and managing your email communications.
                  </p>
                  <div className="mt-3">
                    <Button
                      onClick={() => {
                        setShowCreateBotMessage(false);
                        handleCreateBotClick();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Bot
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateBotMessage(false)}
                      className="ml-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search - Only show when there are bots */}
        {bots.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                {/* Search bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bots..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                    className="pl-10"
                  />
                </div>
                
                {/* Controls row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  {/* View mode and filter buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="px-3"
                      >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">Grid</span>
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="px-3"
                      >
                        <List className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">List</span>
                      </Button>
                    </div>
                    
                    {/* Toggle for inactive bots */}
                    <Button
                      variant={showInactiveBots ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleToggleInactiveBots}
                      className="text-xs sm:text-sm"
                    >
                      {showInactiveBots ? 'Hide Inactive' : 'Show Inactive'}
                    </Button>
                  </div>
                  
                  {/* Results count */}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {totalItems} bot{totalItems !== 1 ? 's' : ''} found
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inactive bots explanation */}
        {showInactiveBots && bots.some(bot => !bot.isActive) && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 dark:text-amber-400 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Inactive Bots
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Some bots are inactive due to subscription limits. Upgrade your plan to reactivate them automatically.
                  </p>
                </div>
                      </div>
                    </CardContent>
                  </Card>
            )}

        {/* Bots List */}
        {bots.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BotIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No bots found
              </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery 
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by creating your first AI-powered email bot.'
                }
              </p>
              {!searchQuery && (
                  <Button 
                    onClick={handleCreateBotClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                Create Your First Bot
              </Button>
              )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-4">
            {bots.map((bot) => (
                  <Card key={bot._id} className={`hover:shadow-md transition-shadow ${!bot.isActive ? 'opacity-60 border-dashed border-2 border-gray-300 dark:border-gray-600' : ''}`}>
                    <CardContent className="pt-6">
                      {/* Mobile-first responsive layout */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Bot info section */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage className='bg-white'  src={`https://robohash.org/${bot._id}?set=set1&size=48x48`} />
                            <AvatarFallback>{getBotAvatar(bot)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {bot.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getBotStatusColor(bot.isActive)}`}>
                                  {bot.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {botActiveCampaigns[bot._id] && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    Running Campaign
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base">
                              {bot.description || 'No description provided'}
                            </p>
                            {/* Bot stats - responsive grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="font-medium sm:font-normal">Daily Limit:</span>
                                <span className="font-semibold sm:font-normal">{bot.dailyEmailLimit}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="font-medium sm:font-normal">Sent Today:</span>
                                <span className="font-semibold sm:font-normal">{bot.emailsSentToday}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="font-medium sm:font-normal">From:</span>
                                <span className="font-semibold sm:font-normal truncate">{bot.smtpConfig?.fromEmail || bot.email}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="font-medium sm:font-normal">Created:</span>
                                <span className="font-semibold sm:font-normal">{new Date(bot.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons - responsive layout */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBotStatus(bot)}
                            className="w-full sm:w-auto"
                            disabled={bot.isActive && botActiveCampaigns[bot._id]}
                            title={bot.isActive && botActiveCampaigns[bot._id] ? "Cannot deactivate bot with active campaigns" : bot.isActive ? "Deactivate bot" : "Activate bot"}
                          >
                            {bot.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBot(bot)}
                              className="flex-1 sm:flex-none"
                              disabled={botActiveCampaigns[bot._id]}
                              title={botActiveCampaigns[bot._id] ? "Cannot edit bot with active campaigns" : "Edit bot"}
                            >
                              <Edit className="w-4 h-4 sm:mr-1" />
                              <span className="sm:inline hidden">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBot(bot)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bots.map((bot) => (
                  <Card key={bot._id} className={`hover:shadow-md transition-shadow ${!bot.isActive ? 'opacity-60 border-dashed border-2 border-gray-300 dark:border-gray-600' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://robohash.org/${bot._id}?set=set1&size=40x40`} />
                            <AvatarFallback>{getBotAvatar(bot)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{bot.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBotStatusColor(bot.isActive)}`}>
                                {bot.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {botActiveCampaigns[bot._id] && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  Running Campaign
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {bot.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Daily Limit:</span>
                          <span className="font-medium">{bot.dailyEmailLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Sent Today:</span>
                          <span className="font-medium">{bot.emailsSentToday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">From Email:</span>
                          <span className="font-medium text-xs truncate max-w-24">{bot.smtpConfig?.fromEmail || bot.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <span className="font-medium">{new Date(bot.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleBotStatus(bot)}
                          disabled={bot.isActive && botActiveCampaigns[bot._id]}
                          title={bot.isActive && botActiveCampaigns[bot._id] ? "Cannot deactivate bot with active campaigns" : bot.isActive ? "Deactivate bot" : "Activate bot"}
                        >
                          {bot.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          onClick={() => handleEditBot(bot)}
                          disabled={botActiveCampaigns[bot._id]}
                          title={botActiveCampaigns[bot._id] ? "Cannot edit bot with active campaigns" : "Edit bot"}
                          >
                          <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                          onClick={() => handleDeleteBot(bot)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                          <Trash2 className="w-4 h-4" />
                      </Button>
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} bots
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">Previous</span>
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
                              className="w-8 h-8 p-0 text-xs sm:text-sm"
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
                        className="px-3"
                      >
                        <span className="mr-1 hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

      {/* Edit Bot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
                Update the bot's name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter bot name"
              />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
              <Textarea
                  id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter bot description"
                rows={3}
              />
            </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingBot(null);
                  setFormData({ name: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
          </div>
        </DialogContent>
      </Dialog>

        {/* Delete Bot Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bot</DialogTitle>
            <DialogDescription>
                Are you sure you want to delete "{deletingBot?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingBot(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Bot
              </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Limit Modal */}
      <PlanLimitModal
        isOpen={showPlanLimitModal}
        onClose={() => setShowPlanLimitModal(false)}
        currentPlan={userPlan}
        currentBots={bots.length}
        maxBots={getMaxBots(userPlan)}
      />
      </div>
    </DashboardLayout>
  );
}