'use client';

import { BotsAPI } from '@/lib/api';
import { Bot } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useBots() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showInactiveBots, setShowInactiveBots] = useState(false);
  const [botActiveCampaigns, setBotActiveCampaigns] = useState<Record<string, boolean>>({});
  const fetchInProgress = useRef(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check active campaigns for bots
  const checkBotActiveCampaigns = async (botId: string) => {
    try {
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

  // Fetch bots data
  const fetchBots = useCallback(async () => {
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
      } else {
        setError(response.error || 'Failed to fetch bots');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch bots');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentPage, pageSize, debouncedSearchQuery, showInactiveBots]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  // Check active campaigns when bots are loaded
  useEffect(() => {
    if (bots.length > 0) {
      checkAllBotsActiveCampaigns();
    }
  }, [bots]);

  const handleToggleBotStatus = async (bot: Bot) => {
    if (bot.isActive && botActiveCampaigns[bot._id]) {
      toast.error('Cannot deactivate bot while it has active campaigns. Please pause or complete the campaigns first.');
      return;
    }

    try {
      const response = await BotsAPI.updateBot(bot._id, {
        isActive: !bot.isActive
      });

      if (response.success) {
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

  const handleToggleInactiveBots = () => {
    setShowInactiveBots(!showInactiveBots);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return {
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
  };
}
