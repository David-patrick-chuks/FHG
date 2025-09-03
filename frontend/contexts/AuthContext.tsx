'use client';

import { apiClient } from '@/lib/api-client';
import { config } from '@/lib/config';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
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
      const token = localStorage.getItem(config.auth.jwtStorageKey);
      
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
        // Token is invalid, clear it
        localStorage.removeItem(config.auth.jwtStorageKey);
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
      
      localStorage.removeItem(config.auth.jwtStorageKey);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Store token
        localStorage.setItem(config.auth.jwtStorageKey, token);
        
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
  const logout = useCallback(() => {
    try {
      // Clear tokens
      localStorage.removeItem(config.auth.jwtStorageKey);
      localStorage.removeItem('refresh_token');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Optional: Call logout endpoint to invalidate token on server
      apiClient.post('/auth/logout').catch(console.error);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  

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
