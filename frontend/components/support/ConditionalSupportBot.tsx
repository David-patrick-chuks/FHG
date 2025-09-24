'use client';

import { SupportBotEnhanced } from './SupportBotEnhanced';
import { useUnprotectedPage } from '@/hooks/useUnprotectedPage';

export function ConditionalSupportBot() {
  const { shouldShowSupportBot } = useUnprotectedPage();

  // Only render the support bot on unprotected pages
  if (!shouldShowSupportBot) {
    return null;
  }

  return <SupportBotEnhanced />;
}
