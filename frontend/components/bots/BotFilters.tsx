'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Grid3X3, List, Search } from 'lucide-react';

interface BotFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showInactiveBots: boolean;
  onToggleInactiveBots: () => void;
  totalItems: number;
}

export function BotFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showInactiveBots,
  onToggleInactiveBots,
  totalItems
}: BotFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search bots..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
                  onClick={() => onViewModeChange('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
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
                onClick={onToggleInactiveBots}
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
  );
}
