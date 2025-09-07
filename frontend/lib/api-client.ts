import { ApiError, ApiResponse } from '@/types';
import { config } from './config';

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
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    // Create a unique key for this request to prevent duplicates
    const requestKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`;
    
    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

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

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Check both localStorage (remember me) and sessionStorage (session only)
    return localStorage.getItem(config.auth.jwtStorageKey) || 
           sessionStorage.getItem(config.auth.jwtStorageKey);
  }

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
      
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing purposes
export { ApiClient };

