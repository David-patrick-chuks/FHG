import { generatePageMetadata, viewport } from '@/lib/seo';
import type { Metadata } from 'next';
import { ApiDocsClient } from './ApiDocsClient';

export const metadata: Metadata = generatePageMetadata('apiDocs');
export { viewport };

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
