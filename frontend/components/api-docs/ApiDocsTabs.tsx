'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiDocsAuthentication } from './ApiDocsAuthentication';
import { ApiDocsEndpoints } from './ApiDocsEndpoints';
import { ApiDocsExamples } from './ApiDocsExamples';
import { ApiDocsOverview } from './ApiDocsOverview';
import { ApiDocsRateLimits } from './ApiDocsRateLimits';

interface ApiDocsTabsProps {
  searchQuery: string;
}

export function ApiDocsTabs({ searchQuery }: ApiDocsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="authentication">Authentication</TabsTrigger>
        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        <TabsTrigger value="examples">Examples</TabsTrigger>
        <TabsTrigger value="limits">Rate Limits</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ApiDocsOverview searchQuery={searchQuery} />
      </TabsContent>

      <TabsContent value="authentication">
        <ApiDocsAuthentication searchQuery={searchQuery} />
      </TabsContent>

      <TabsContent value="endpoints">
        <ApiDocsEndpoints searchQuery={searchQuery} />
      </TabsContent>

      <TabsContent value="examples">
        <ApiDocsExamples searchQuery={searchQuery} />
      </TabsContent>

      <TabsContent value="limits">
        <ApiDocsRateLimits searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  );
}
