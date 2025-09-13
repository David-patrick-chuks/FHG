// Cookie and Consent Types

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentData {
  hasConsent: boolean;
  timestamp: number | null;
  preferences: CookiePreferences;
}
