import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

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

// API base URL
const API_URL = 'http://localhost:8080/api';

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: true,
    error: null,
    requires2FA: false,
    tempUsername: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    if (token && refreshToken && user) {
      // Set up axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setState({
        ...state,
        isAuthenticated: true,
        token,
        refreshToken,
        user: JSON.parse(user),
        loading: false,
      });
    } else {
      setState({
        ...state,
        loading: false,
      });
    }
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
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
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
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
  const refreshAuth = async (): Promise<boolean> => {
    if (!state.refreshToken) return false;
    
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refresh_token: state.refreshToken,
      });
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set up axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setState({
        ...state,
        token: access_token,
        refreshToken: refresh_token,
        user,
      });
      
      return true;
    } catch (error) {
      // If refresh fails, log the user out
      logout();
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
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
  };

  // Clear error function
  const clearError = () => {
    setState({ ...state, error: null });
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry && state.refreshToken) {
          originalRequest._retry = true;
          
          const refreshed = await refreshAuth();
          if (refreshed) {
            // Update the authorization header
            originalRequest.headers['Authorization'] = `Bearer ${state.token}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [state.refreshToken, state.token]);

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
