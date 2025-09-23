'use client';

import { BotCard, BotDialogs, BotFilters, BotPagination } from '@/components/bots';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlanLimitModal } from '@/components/modals/PlanLimitModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBots } from '@/hooks/useBots';
import { BotsAPI } from '@/lib/api';
import { Bot } from '@/types';
import { Bot as BotIcon, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function BotsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Use the custom hook for bot management
  const {
    bots,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    showInactiveBots,
    botActiveCampaigns,
    fetchBots,
    handleToggleBotStatus,
    handleToggleInactiveBots,
    handlePageChange,
    handleSearchChange
  } = useBots();

  // Local state for dialogs and forms
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [deletingBot, setDeletingBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateBotMessage, setShowCreateBotMessage] = useState(false);
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Set user plan from auth context
  useEffect(() => {
    if (user?.subscription) {
      setUserPlan(user.subscription as 'free' | 'basic' | 'premium');
    }
  }, [user?.subscription]);

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

    setIsSaving(true);
    try {
      const response = await BotsAPI.updateBot(editingBot._id, formData);

      if (response.success) {
        await fetchBots(); // Refresh the bots list
        setIsEditDialogOpen(false);
        setEditingBot(null);
        setFormData({ name: '', description: '' });
        toast.success('Bot updated successfully');
      } else {
        toast.error(response.error || 'Failed to update bot');
      }
    } catch (error) {
      toast.error('Failed to update bot');
      console.error('Error updating bot:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBot) return;

    setIsDeleting(true);
    try {
      const response = await BotsAPI.deleteBot(deletingBot._id);

      if (response.success) {
        await fetchBots(); // Refresh the list
        setIsDeleteDialogOpen(false);
        setDeletingBot(null);
        toast.success('Bot deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete bot');
      }
    } catch (error) {
      toast.error('Failed to delete bot');
      console.error('Error deleting bot:', error);
    } finally {
      setIsDeleting(false);
    }
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
          {/* Loading skeleton */}
          <Card className="animate-pulse">
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
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
          <BotFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showInactiveBots={showInactiveBots}
            onToggleInactiveBots={handleToggleInactiveBots}
            totalItems={totalItems}
          />
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
            <div className={viewMode === 'list' ? 'space-y-4' : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
              {bots.map((bot) => (
                <BotCard
                  key={bot._id}
                  bot={bot}
                  viewMode={viewMode}
                  hasActiveCampaigns={botActiveCampaigns[bot._id] || false}
                  onToggleStatus={handleToggleBotStatus}
                  onEdit={handleEditBot}
                  onDelete={handleDeleteBot}
                />
              ))}
            </div>

            {/* Pagination */}
            <BotPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={12}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Dialogs */}
        <BotDialogs
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          editingBot={editingBot}
          deletingBot={deletingBot}
          formData={formData}
          onFormDataChange={setFormData}
          onCloseEdit={() => setIsEditDialogOpen(false)}
          onCloseDelete={() => setIsDeleteDialogOpen(false)}
          onSaveEdit={handleSaveEdit}
          onConfirmDelete={handleConfirmDelete}
          isSaving={isSaving}
          isDeleting={isDeleting}
        />

        {/* Plan Limit Modal */}
        <PlanLimitModal
          isOpen={showPlanLimitModal}
          onClose={() => setShowPlanLimitModal(false)}
          currentPlan={userPlan}
          limitType="bots"
          currentCount={bots.length}
          maxLimit={getMaxBots(userPlan)}
        />
      </div>
    </DashboardLayout>
  );
}