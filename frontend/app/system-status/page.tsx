import { generatePageMetadata, viewport } from '@/lib/seo';
import type { Metadata } from 'next';
import { SystemStatusClient } from './SystemStatusClient';

export const metadata: Metadata = generatePageMetadata('systemStatus');
export { viewport };

export default function SystemStatusPage() {
  return <SystemStatusClient />;
}
