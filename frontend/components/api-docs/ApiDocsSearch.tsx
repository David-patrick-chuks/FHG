'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ApiDocsSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ApiDocsSearch({ searchQuery, setSearchQuery }: ApiDocsSearchProps) {
  return (
    <div className="mb-8">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search API documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>
    </div>
  );
}
