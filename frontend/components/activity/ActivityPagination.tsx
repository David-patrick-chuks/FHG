import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ActivityPagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  pageSize, 
  onPageChange 
}: ActivityPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const renderPageNumbers = (isMobile: boolean = false) => {
    // Show fewer pages on mobile
    const maxVisiblePages = isMobile ? 3 : 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);
    
    return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => {
      const pageNum = adjustedStartPage + i;
      return (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(pageNum)}
          className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} p-0 text-xs sm:text-sm`}
        >
          {pageNum}
        </Button>
      );
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {/* Info Text */}
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startItem} to {endItem} of {totalItems} activities
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 h-9 text-xs"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {renderPageNumbers(true)}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex-1 h-9 text-xs"
              >
                Next
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startItem} to {endItem} of {totalItems} activities
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {renderPageNumbers(false)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
