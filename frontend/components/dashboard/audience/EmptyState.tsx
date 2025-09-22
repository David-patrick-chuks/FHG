import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
}

export function EmptyState({ searchTerm, statusFilter }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No email records found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Email records will appear here once you start sending campaigns.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
