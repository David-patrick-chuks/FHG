'use client';

import { apiClient } from '@/lib/api-client';
import { config } from '@/lib/config';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      // Check both localStorage (remember me) and sessionStorage (session only)
      const token = localStorage.getItem(config.auth.jwtStorageKey) || 
                   sessionStorage.getItem(config.auth.jwtStorageKey);
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token by making a request to get user profile
      const response = await apiClient.get<User>('/auth/profile');
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, clear it from both storages
        localStorage.removeItem(config.auth.jwtStorageKey);
        sessionStorage.removeItem(config.auth.jwtStorageKey);
        localStorage.removeItem('remember_me');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Provide more specific error handling
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          console.log('Token validation failed, clearing stored token');
        } else if (error.message.includes('User not found')) {
          console.log('User account not found, clearing stored token');
        } else {
          console.log('Unexpected auth error:', error.message);
        }
      }
      
      // Clear tokens from both storages
      localStorage.removeItem(config.auth.jwtStorageKey);
      sessionStorage.removeItem(config.auth.jwtStorageKey);
      localStorage.removeItem('remember_me');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        const { user: userData, token } = response.data;
        
        // Store token with appropriate expiration
        if (rememberMe) {
          // Store in localStorage for persistent session (30 days)
          localStorage.setItem(config.auth.jwtStorageKey, token);
          localStorage.setItem('remember_me', 'true');
        } else {
          // Store in sessionStorage for session-only (browser close = logout)
          sessionStorage.setItem(config.auth.jwtStorageKey, token);
          localStorage.removeItem('remember_me');
        }
        
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
        const { user: userData, token } = response.data;
        
        // Store token
        localStorage.setItem(config.auth.jwtStorageKey, token);
        
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
      // Get the current token before clearing it (check both storages)
      const token = localStorage.getItem(config.auth.jwtStorageKey) || 
                   sessionStorage.getItem(config.auth.jwtStorageKey);
      
      // Try to call logout endpoint with the token FIRST (before clearing)
      if (token) {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          // Ignore logout API errors - user will still be logged out locally
          console.log('Logout API call failed (this is normal if backend is down):', error);
        }
      }
      
      // Now clear tokens and update state from both storages
      localStorage.removeItem(config.auth.jwtStorageKey);
      sessionStorage.removeItem(config.auth.jwtStorageKey);
      localStorage.removeItem('remember_me');
      localStorage.removeItem('refresh_token');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login page
      router.push('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure user is logged out locally
      localStorage.removeItem(config.auth.jwtStorageKey);
      sessionStorage.removeItem(config.auth.jwtStorageKey);
      localStorage.removeItem('remember_me');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login page even on error
      router.push('/login');
    }
  }, [router]);

  

  // Update user function
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  }, []);

  

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
