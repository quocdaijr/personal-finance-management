import httpClient from './httpClient';

/**
 * Authentication Service
 * Handles user authentication through the backend API
 */
const authService = {
  /**
   * Login user
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Auth data including tokens and user info
   */
  login: async (username, password) => {
    console.log(`Login attempt: ${username}`);

    try {
      // Make API request to Golang Gin backend
      const response = await httpClient.backend.post('/auth/login', {
        username,
        password
      });

      // Store access token (backend returns access_token)
      if (response.access_token || response.token) {
        localStorage.setItem('auth_token', response.access_token || response.token);

        // Store refresh token if provided
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }

        // Store user data
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Store analytics token if provided
        if (response.analytics_token) {
          localStorage.setItem('analytics_token', response.analytics_token);
        }
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user data
   */
  register: async (userData) => {
    console.log('Register attempt');

    try {
      // Make API request to Golang Gin backend
      return await httpClient.backend.post('/auth/register', userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Call logout endpoint if needed
      if (authService.isAuthenticated()) {
        await httpClient.backend.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data from local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('analytics_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get authentication token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Get analytics token
   * @returns {string|null}
   */
  getAnalyticsToken: () => {
    return localStorage.getItem('analytics_token');
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>}
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Gin backend refresh token endpoint
      const response = await httpClient.backend.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      // Store new access token (backend returns access_token)
      if (response.access_token || response.token) {
        localStorage.setItem('auth_token', response.access_token || response.token);

        // Update refresh token if provided
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }

        // Update analytics token if provided
        if (response.analytics_token) {
          localStorage.setItem('analytics_token', response.analytics_token);
        }
      }

      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth data on refresh failure
      authService.logout();
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} - Response message
   */
  forgotPassword: async (email) => {
    try {
      return await httpClient.backend.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Response message
   */
  resetPassword: async (token, newPassword) => {
    try {
      return await httpClient.backend.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  /**
   * Verify email address
   * @param {string} token - Verification token from email
   * @returns {Promise<Object>} - Response with user data
   */
  verifyEmail: async (token) => {
    try {
      return await httpClient.backend.post('/auth/verify-email', { token });
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Response message
   */
  resendVerification: async (email) => {
    try {
      return await httpClient.backend.post('/auth/resend-verification', { email });
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }
};

export default authService;
