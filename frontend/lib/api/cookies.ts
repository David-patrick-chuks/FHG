import { apiClient } from '../api-client';
import { CookiePreferences } from '../cookies';

export interface CookieConsentResponse {
  success: boolean;
  consent: {
    hasConsent: boolean;
    timestamp: number | null;
    preferences: CookiePreferences;
  };
}

export interface SetCookieConsentRequest {
  preferences: CookiePreferences;
}

export interface SetCookieConsentResponse {
  success: boolean;
  message: string;
  preferences: CookiePreferences;
}

export interface UpdatePreferenceRequest {
  type: 'analytics' | 'marketing';
  value: boolean;
}

export interface UpdatePreferenceResponse {
  success: boolean;
  message: string;
  preferences: CookiePreferences;
}

export class CookieAPI {
  /**
   * Get current cookie consent status
   */
  static async getCookieConsent(): Promise<CookieConsentResponse> {
    const response = await apiClient.get('/cookies/consent');
    return response.data;
  }

  /**
   * Set cookie consent preferences
   */
  static async setCookieConsent(preferences: CookiePreferences): Promise<SetCookieConsentResponse> {
    const response = await apiClient.post('/cookies/consent', {
      preferences,
    });
    return response.data;
  }

  /**
   * Clear all cookie consent data
   */
  static async clearCookieConsent(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/cookies/consent');
    return response.data;
  }

  /**
   * Update specific cookie preference
   */
  static async updatePreference(type: 'functional' | 'analytics' | 'marketing', value: boolean): Promise<UpdatePreferenceResponse> {
    const response = await apiClient.patch('/cookies/preference', {
      type,
      value,
    });
    return response.data;
  }
}
