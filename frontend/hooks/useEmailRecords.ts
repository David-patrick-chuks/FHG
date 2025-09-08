import { useCallback, useEffect, useRef, useState } from 'react';
import { TrackingAPI } from '@/lib/api';
import { TrackingLog } from '@/types';

interface UseEmailRecordsProps {
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  statusFilter: string;
  campaignFilter: string;
}

export function useEmailRecords({
  currentPage,
  itemsPerPage,
  searchTerm,
  statusFilter,
  campaignFilter
}: UseEmailRecordsProps) {
  const [emailRecords, setEmailRecords] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [campaigns, setCampaigns] = useState<Array<{_id: string, name: string}>>([]);
  const fetchInProgress = useRef(false);

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

  return {
    emailRecords,
    loading,
    error,
    totalPages,
    totalItems,
    campaigns,
    refetch: fetchEmailRecords
  };
}
