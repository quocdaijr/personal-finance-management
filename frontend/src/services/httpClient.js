/**
 * HTTP Client
 * Simple wrapper for making HTTP requests to backend services
 */

import { API_CONFIG } from '../config/api';
import { keysToCamel, keysToSnake } from '../utils/caseTransform';

// API URLs from centralized config
const BACKEND_URL = `${API_CONFIG.BASE_URL}/api`;
const ANALYTICS_URL = `${API_CONFIG.ANALYTICS_URL}/api`;

/**
 * Get authentication headers
 * @param {boolean} isAnalytics - Whether the request is for analytics API
 * @returns {Object} - Headers object with authentication
 */
const getAuthHeaders = (isAnalytics = false) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Get the appropriate token - use 'token' to match AuthContext
  const token = isAnalytics
    ? localStorage.getItem('analytics_token')
    : localStorage.getItem('token');

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<any>} - Parsed response data
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to parse error message
    let errorMessage;
    let errorData;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }

    // Create an error object with response info for the axios interceptor to handle
    const error = new Error(errorMessage);
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    // Handle null responses (e.g., empty notification lists)
    if (data === null) {
      return [];
    }
    // Handle both direct data and data wrapped in a data field (common in Gin)
    const responseData = data.data !== undefined ? data.data : data;
    // Transform snake_case keys to camelCase for frontend
    return keysToCamel(responseData);
  }

  return response.text();
};

/**
 * HTTP client for making requests to backend services
 */
const httpClient = {
  // Backend API requests
  backend: {
    /**
     * Make GET request to backend API
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>} - Response data
     */
    get: async (endpoint) => {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    },

    /**
     * Make POST request to backend API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<any>} - Response data
     */
    post: async (endpoint, data) => {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(keysToSnake(data))
      });

      return handleResponse(response);
    },

    /**
     * Make PUT request to backend API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<any>} - Response data
     */
    put: async (endpoint, data) => {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(keysToSnake(data))
      });

      return handleResponse(response);
    },

    /**
     * Make PATCH request to backend API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<any>} - Response data
     */
    patch: async (endpoint, data = {}) => {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(keysToSnake(data))
      });

      return handleResponse(response);
    },

    /**
     * Make DELETE request to backend API
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>} - Response data
     */
    delete: async (endpoint) => {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      return handleResponse(response);
    }
  },

  // Analytics API requests
  analytics: {
    /**
     * Make GET request to analytics API
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>} - Response data
     */
    get: async (endpoint) => {
      const response = await fetch(`${ANALYTICS_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(true)
      });

      return handleResponse(response);
    },

    /**
     * Make POST request to analytics API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<any>} - Response data
     */
    post: async (endpoint, data) => {
      const response = await fetch(`${ANALYTICS_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(keysToSnake(data))
      });

      return handleResponse(response);
    }
  }
};

export default httpClient;
