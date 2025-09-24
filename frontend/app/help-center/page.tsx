import { generatePageMetadata, viewport } from '@/lib/seo';
import type { Metadata } from 'next';
import { HelpCenterClient } from './HelpCenterClient';

export const metadata: Metadata = generatePageMetadata('help');
export { viewport };

export default function HelpCenterPage() {
  return <HelpCenterClient />;
}
