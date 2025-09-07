'use client';

import { cleanUrlForAnalytics, getCookiePreferences, shouldTrackRoute } from '@/lib/cookies';
import { Analytics } from '@vercel/analytics/next';

export function ConditionalAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        // Check if analytics is enabled based on cookie consent
        // Use direct cookie check to avoid SSR issues
        if (typeof window === 'undefined') {
          return null; // Block on server-side
        }
        
        try {
          const preferences = getCookiePreferences();
          if (!preferences.analytics) {
            return null; // Block the event if user hasn't consented
          }
        } catch (error) {
          // If there's any error reading preferences, block tracking
          return null;
        }
        
        // Check if this route should be tracked
        if (!shouldTrackRoute(event.url)) {
          return null; // Block tracking for sensitive routes
        }
        
        // Clean sensitive data from URL
        const cleanedUrl = cleanUrlForAnalytics(event.url);
        
        return {
          ...event,
          url: cleanedUrl,
        };
      }}
    />
  );
}