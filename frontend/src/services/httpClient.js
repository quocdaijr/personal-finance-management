/**
 * HTTP Client
 * Simple wrapper for making HTTP requests to backend services
 */

// API URLs - hardcoded for now
// In a production environment, these would be injected during build time
const BACKEND_URL = 'http://localhost:8080/api';
const ANALYTICS_URL = 'http://localhost:8000/api';

/**
 * Get authentication headers
 * @param {boolean} isAnalytics - Whether the request is for analytics API
 * @returns {Object} - Headers object with authentication
 */
const getAuthHeaders = (isAnalytics = false) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Get the appropriate token
  const token = isAnalytics
    ? localStorage.getItem('analytics_token')
    : localStorage.getItem('auth_token');

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
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('analytics_token');
      window.location.href = '/login';
    }

    // Try to parse error message
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    // Handle both direct data and data wrapped in a data field (common in Gin)
    return data.data !== undefined ? data.data : data;
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
        body: JSON.stringify(data)
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
        body: JSON.stringify(data)
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
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    }
  }
};

export default httpClient;
