import { ApiDocsContent, ApiDocsSidebar } from '@/components/api-docs';
import { generatePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { ApiDocsClient } from './ApiDocsClient';

export const metadata: Metadata = generatePageMetadata('apiDocs');

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
