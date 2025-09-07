'use client';

import { useEffect } from 'react';
import { getCookiePreferences, applyCookiePreferences } from '@/lib/cookies';

export function CookieInitializer() {
  useEffect(() => {
    // Apply cookie preferences on app load
    const preferences = getCookiePreferences();
    applyCookiePreferences(preferences);
  }, []);

  return null; // This component doesn't render anything
}
