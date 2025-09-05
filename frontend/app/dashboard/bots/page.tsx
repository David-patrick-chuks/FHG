'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BotsAPI } from '@/lib/api';
import { Bot } from '@/types';
import { Bot as BotIcon, ChevronLeft, ChevronRight, Edit, Grid3X3, List, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function BotsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const fetchInProgress = useRef(false);

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
        search: debouncedSearchQuery
      });

      if (response.success && response.data) {
        setBots(response.data.data || []);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      } else {
        setError(response.error || 'Failed to fetch bots');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch bots');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentPage, pageSize, debouncedSearchQuery]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

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
        await fetchBots(); // Refresh the list
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
    try {
      const response = await BotsAPI.updateBot(bot._id, {
        isActive: !bot.isActive
      });

      if (response.success) {
        await fetchBots(); // Refresh the list
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
        <Button 
          onClick={() => router.push('/dashboard/bots/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bot
        </Button>
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
                        router.push('/dashboard/bots/create');
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
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
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
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
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
                    onClick={() => router.push('/dashboard/bots/create')}
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
                  <Card key={bot._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://robohash.org/${bot._id}?set=set1&size=48x48`} />
                            <AvatarFallback>{getBotAvatar(bot)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {bot.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBotStatusColor(bot.isActive)}`}>
                                {bot.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {bot.description || 'No description provided'}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                              <span>Daily Limit: {bot.dailyEmailLimit}</span>
                              <span>Sent Today: {bot.emailsSentToday}</span>
                              <span>From: {bot.smtpConfig?.fromEmail || bot.email}</span>
                              <span>Created: {new Date(bot.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBotStatus(bot)}
                          >
                            {bot.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBot(bot)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bots.map((bot) => (
                  <Card key={bot._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://robohash.org/${bot._id}?set=set1&size=40x40`} />
                            <AvatarFallback>{getBotAvatar(bot)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{bot.name}</CardTitle>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBotStatusColor(bot.isActive)}`}>
                              {bot.isActive ? 'Active' : 'Inactive'}
                            </span>
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
                        >
                          {bot.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBot(bot)}
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
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} bots
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
      </div>
    </DashboardLayout>
  );
}