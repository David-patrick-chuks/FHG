/**
 * Cookie utility functions for managing cookies in the browser
 */

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsent {
  accepted: boolean;
  timestamp: number;
  preferences: CookiePreferences;
}

const COOKIE_CONSENT_KEY = 'mailquill_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'mailquill_cookie_preferences';

// Default cookie preferences
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Always required
  functional: false,
  analytics: false,
  marketing: false,
};

/**
 * Get cookie consent status
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

/**
 * Set cookie consent
 */
export function setCookieConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  const consent: CookieConsent = {
    accepted: true,
    timestamp: Date.now(),
    preferences: {
      ...preferences,
      essential: true, // Always true
    },
  };
  
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    
    // Apply cookie preferences
    applyCookiePreferences(preferences);
  } catch (error) {
    console.error('Error setting cookie consent:', error);
  }
}

/**
 * Get current cookie preferences
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update cookie preferences
 */
export function updateCookiePreferences(preferences: Partial<CookiePreferences>): void {
  const current = getCookiePreferences();
  const updated = { ...current, ...preferences };
  
  setCookieConsent(updated);
}

/**
 * Apply cookie preferences by enabling/disabling tracking
 */
export function applyCookiePreferences(preferences: CookiePreferences): void {
  // Analytics cookies
  if (preferences.analytics) {
    enableAnalytics();
  } else {
    disableAnalytics();
  }
  
  // Marketing cookies
  if (preferences.marketing) {
    enableMarketing();
  } else {
    disableMarketing();
  }
  
  // Functional cookies are always enabled if user has consented
  if (preferences.functional) {
    enableFunctional();
  }
}

/**
 * Enable analytics tracking
 */
function enableAnalytics(): void {
  // Enable Google Analytics or other analytics tools
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
  
  // Vercel Analytics is now controlled via beforeSend function
  // No need for localStorage flags
}

/**
 * Disable analytics tracking
 */
function disableAnalytics(): void {
  // Disable Google Analytics or other analytics tools
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'denied',
    });
  }
  
  // Vercel Analytics is now controlled via beforeSend function
  // No need for localStorage flags
}

/**
 * Enable marketing tracking
 */
function enableMarketing(): void {
  // Enable marketing cookies
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }
}

/**
 * Disable marketing tracking
 */
function disableMarketing(): void {
  // Disable marketing cookies
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

/**
 * Enable functional cookies
 */
function enableFunctional(): void {
  // Enable functional features like theme preferences, etc.
  console.log('Functional cookies enabled');
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  const consent = getCookieConsent();
  return consent?.accepted === true;
}

/**
 * Clear all cookie consent data
 */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    
    // Reset to default preferences
    applyCookiePreferences(DEFAULT_PREFERENCES);
  } catch (error) {
    console.error('Error clearing cookie consent:', error);
  }
}

/**
 * Get cookie banner visibility status
 */
export function shouldShowCookieBanner(): boolean {
  return !hasConsent();
}

/**
 * Check if analytics is enabled based on user consent
 */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const preferences = getCookiePreferences();
  return preferences.analytics === true;
}

/**
 * Check if marketing is enabled based on user consent
 */
export function isMarketingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const preferences = getCookiePreferences();
  return preferences.marketing === true;
}

/**
 * Check if a route should be tracked by analytics
 */
export function shouldTrackRoute(url: string): boolean {
  const sensitiveRoutes = [
    '/dashboard/profile',
    '/dashboard/settings',
    '/reset-password',
    '/login',
    '/signup',
    '/dashboard/bots/create',
    '/dashboard/campaigns/create',
    '/dashboard/email-extractor',
    '/app-password-guide',
    '/help-center',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies'
  ];
  
  return !sensitiveRoutes.some(route => url.includes(route));
}

/**
 * Clean sensitive data from URL
 */
export function cleanUrlForAnalytics(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove common sensitive query parameters
    const sensitiveParams = [
      'token', 'auth', 'key', 'secret', 'password', 'pass',
      'session', 'sid', 'id', 'user_id', 'uid', 'email',
      'phone', 'ssn', 'credit_card', 'payment', 'order_id'
    ];
    
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.delete(param);
      }
    });
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    return url;
  }
}

/**
 * Set a cookie with proper settings
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof document === 'undefined') return;
  
  const {
    expires,
    maxAge,
    path = '/',
    domain,
    secure = true,
    sameSite = 'lax',
  } = options;
  
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }
  
  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }
  
  cookieString += `; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  if (secure) {
    cookieString += '; secure';
  }
  
  cookieString += `; samesite=${sameSite}`;
  
  document.cookie = cookieString;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  setCookie(name, '', {
    expires: new Date(0),
    path,
  });
}
