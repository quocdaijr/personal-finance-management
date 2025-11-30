import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Define types
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  requires2FA: boolean;
  tempUsername: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  verify2FA: (username: string, token: string) => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL from centralized config
const API_URL = `${API_CONFIG.BASE_URL}/api`;

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    // Initialize from localStorage synchronously to prevent flash
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (token && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return {
          isAuthenticated: true,
          user,
          token,
          refreshToken,
          loading: false,
          error: null,
          requires2FA: false,
          tempUsername: null,
        };
      } catch {
        // Invalid user data, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }

    return {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
      requires2FA: false,
      tempUsername: null,
    };
  });

  // Use ref to track if we're currently refreshing to prevent loops
  const isRefreshing = useRef(false);

  // Login function
  const login = async (username: string, password: string) => {
    setState({ ...state, loading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      const { access_token, refresh_token, analytics_token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store analytics token for analytics API calls
      if (analytics_token) {
        localStorage.setItem('analytics_token', analytics_token);
      }

      // Set up axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setState({
        ...state,
        isAuthenticated: true,
        token: access_token,
        refreshToken: refresh_token,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      // Check if it's a 2FA requirement
      if (error.response && error.response.data && error.response.data.error === '2FA is enabled, please provide a token') {
        setState({
          ...state,
          loading: false,
          requires2FA: true,
          tempUsername: username,
          error: null,
        });
      } else {
        setState({
          ...state,
          loading: false,
          error: error.response?.data?.error || 'Login failed',
        });
      }
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      await axios.post(`${API_URL}/auth/register`, userData);
      
      setState({
        ...state,
        loading: false,
      });
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.response?.data?.error || 'Registration failed',
      });
    }
  };

  // Verify 2FA function
  const verify2FA = async (username: string, token: string) => {
    setState({ ...state, loading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/auth/verify-2fa`, {
        username,
        token,
      });

      const { access_token, refresh_token, analytics_token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store analytics token for analytics API calls
      if (analytics_token) {
        localStorage.setItem('analytics_token', analytics_token);
      }

      // Set up axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setState({
        ...state,
        isAuthenticated: true,
        token: access_token,
        refreshToken: refresh_token,
        user,
        loading: false,
        error: null,
        requires2FA: false,
        tempUsername: null,
      });
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.response?.data?.error || 'Verification failed',
      });
    }
  };

  // Refresh token function
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken || isRefreshing.current) return false;

    isRefreshing.current = true;

    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refresh_token: currentRefreshToken,
      });

      const { access_token, refresh_token, analytics_token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store analytics token for analytics API calls
      if (analytics_token) {
        localStorage.setItem('analytics_token', analytics_token);
      }

      // Set up axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setState(prevState => ({
        ...prevState,
        token: access_token,
        refreshToken: refresh_token,
        user,
      }));

      isRefreshing.current = false;
      return true;
    } catch (error) {
      isRefreshing.current = false;
      // Don't logout on refresh failure - just return false
      // The calling code can decide what to do
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('analytics_token');

    // Remove axios default headers
    delete axios.defaults.headers.common['Authorization'];

    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
      requires2FA: false,
      tempUsername: null,
    });
  }, []);

  // Clear error function - wrapped in useCallback to prevent infinite re-renders
  const clearError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Set up axios interceptor for token refresh - only once
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip refresh for auth endpoints to prevent loops
        if (originalRequest.url?.includes('/auth/')) {
          return Promise.reject(error);
        }

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshed = await refreshAuth();
          if (refreshed) {
            // Update the authorization header with new token
            const newToken = localStorage.getItem('token');
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            // Refresh failed, logout the user
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshAuth, logout]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        verify2FA,
        refreshAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
