'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  LoadingState, 
  ErrorState, 
  EmptyState, 
  FiltersSection, 
  EmailRecordsTable, 
  Pagination 
} from '@/components/dashboard/audience';
import { useEmailRecords } from '@/hooks/useEmailRecords';
import { useEmailExport } from '@/hooks/useEmailExport';
import { Download } from 'lucide-react';
import { useState } from 'react';

export default function AudiencePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    emailRecords,
    loading,
    error,
    totalPages,
    totalItems,
    campaigns,
    refetch
  } = useEmailRecords({
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    campaignFilter
  });

  const { exportToCSV } = useEmailExport();

  const handleExport = () => {
    exportToCSV(emailRecords);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <DashboardLayout
      title="Audience"
      description="Track email delivery and engagement across all your campaigns"
      actions={
        <Button 
          onClick={handleExport}
          variant="outline"
          disabled={totalItems === 0 || loading}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters - Only show when there are email records */}
        {!loading && totalItems > 0 && (
          <FiltersSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}

        {/* Email Records Table */}
        {emailRecords.length === 0 ? (
          <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
        ) : (
          <>
            <EmailRecordsTable emailRecords={emailRecords} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
