'use client';

import { LogoutOverlay } from '@/components/ui/LogoutOverlay';
import { apiClient, setGlobalLogout, setGlobalSetLoggingOut } from '@/lib/api-client';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials & { rememberMe?: boolean }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      // Check if user is authenticated by calling the profile endpoint
      // Cookies are sent automatically
      const response = await apiClient.get<User>('/auth/profile');
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // For profile check, 401 errors are expected for unauthenticated users
      // Don't log this as an error, just set unauthenticated state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials & { rememberMe?: boolean }) => {
    try {
      setIsLoading(true);
      
      const { rememberMe, ...loginData } = credentials;
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        ...loginData,
        rememberMe: rememberMe || false
      });
      
      if (response.success && response.data) {
        const { user: userData } = response.data;
        
        // Store remember me preference in localStorage for frontend use
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remember_me');
        }
        
        // No need to store tokens - they're in HTTP-only cookies
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (response.success && response.data) {
        const { user: userData } = response.data;
        
        // No need to store tokens - they're in HTTP-only cookies
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Show logout overlay
      setIsLoggingOut(true);
      
      // Call logout endpoint to clear cookies on server
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignore logout API errors - user will still be logged out locally
        console.log('Logout API call failed (this is normal if backend is down):', error);
      }
      
      // Add a small delay to show the overlay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear remember me flag
      localStorage.removeItem('remember_me');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login page
      router.push('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure user is logged out locally
      localStorage.removeItem('remember_me');
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login page even on error
      router.push('/login');
    } finally {
      // Hide logout overlay
      setIsLoggingOut(false);
    }
  }, [router]);

  // Register logout function with API client for automatic logout on invalid token
  useEffect(() => {
    setGlobalLogout(logout);
    setGlobalSetLoggingOut(setIsLoggingOut);
  }, [logout]);

  // Update user function
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  }, []);

  

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutOverlay isVisible={isLoggingOut} />
    </AuthContext.Provider>
  );
};
