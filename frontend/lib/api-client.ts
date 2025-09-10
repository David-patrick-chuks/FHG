import { ApiError, ApiResponse } from '@/types';
import { config } from './config';

// Global logout function that will be set by AuthContext
let globalLogout: (() => void) | null = null;
let globalSetLoggingOut: ((isLoggingOut: boolean) => void) | null = null;

export const setGlobalLogout = (logoutFn: () => void) => {
  globalLogout = logoutFn;
};

export const setGlobalSetLoggingOut = (setLoggingOutFn: (isLoggingOut: boolean) => void) => {
  globalSetLoggingOut = setLoggingOutFn;
};

// Dynamic import for toast to avoid SSR issues
const showToast = async (message: string, type: 'error' | 'warning' = 'error') => {
  try {
    const { toast } = await import('sonner');
    toast[type](message);
  } catch (error) {
    console.warn('Could not show toast:', error);
  }
};

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    // No need to get token - cookies are sent automatically

    // Create a unique key for this request to prevent duplicates
    const requestKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}:${isRetry}`;
    
    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // No need to add authorization header - cookies are sent automatically

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          credentials: 'include', // Include cookies in requests
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response body first to get error messages
        let responseData;
        try {
          responseData = await response.json();
        } catch {
          // If response is not JSON, create a basic error
          if (!response.ok) {
            throw this.createApiError(response);
          }
          return {} as ApiResponse<T>;
        }

        // If response is not successful, throw error with message from response body
        if (!response.ok) {
          const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`;
          
          // Check for token expiration (try to refresh first)
          if (response.status === 401 && !isRetry &&
              (responseData.message?.toLowerCase().includes('token expired') ||
               responseData.error?.toLowerCase().includes('token expired'))) {
            
            // Try to refresh token before giving up
            try {
              const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (refreshResponse.ok) {
                // Token refreshed successfully, retry original request
                return this.request(endpoint, options, true);
              }
            } catch (refreshError) {
              console.warn('Token refresh failed:', refreshError);
            }
          }
          
          // Check for authentication-related errors that should trigger logout
          const isAuthError = response.status === 401 || 
              (responseData.message && (
                responseData.message.toLowerCase().includes('invalid token') ||
                responseData.message.toLowerCase().includes('unauthorized') ||
                responseData.message.toLowerCase().includes('authentication failed')
              )) ||
              (responseData.error && (
                responseData.error.toLowerCase().includes('invalid token') ||
                responseData.error.toLowerCase().includes('unauthorized') ||
                responseData.error.toLowerCase().includes('authentication failed')
              ));

          if (isAuthError) {
            console.warn('Authentication error detected, triggering logout');
            
            // Show toast notification
            showToast('Your session has expired. Please sign in again.', 'warning');
            
            // Show logout overlay and trigger global logout if available
            if (globalSetLoggingOut && globalLogout) {
              // Show overlay immediately
              globalSetLoggingOut(true);
              
              // Use setTimeout to avoid blocking the current request
              setTimeout(() => {
                globalLogout!();
              }, 0);
            }
          }
          
          throw new Error(errorMessage);
        }

        // Return the response data regardless of success field
        // Let the calling code handle business logic success/failure
        return responseData;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }
        throw new Error('An unexpected error occurred');
      } finally {
        // Remove the request from pending requests when it completes
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    this.pendingRequests.set(requestKey, requestPromise);
    
    return requestPromise;
  }

  private createApiError(response: Response): ApiError {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      code: response.statusText,
    };
  }

  // No need for getAuthToken - cookies are handled automatically

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(this.createApiError(new Response(xhr.responseText, { status: xhr.status })));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', `${this.baseUrl}${endpoint}`);
      xhr.withCredentials = true; // Include cookies in XMLHttpRequest
      
      xhr.send(formData);
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing purposes
export { ApiClient };

