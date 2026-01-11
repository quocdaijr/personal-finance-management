import httpClient from './httpClient';

/**
 * Tax Service
 * Handles tax categories and tax reporting features
 */
const taxService = {
  /**
   * Get all tax categories
   * @returns {Promise<Array>} - List of tax categories
   */
  getCategories: async () => {
    try {
      return await httpClient.backend.get('/tax/categories');
    } catch (error) {
      console.error('Get tax categories error:', error);
      throw error;
    }
  },

  /**
   * Create tax category
   * @param {Object} categoryData - Category data {name, taxType, description, deductible, rate}
   * @returns {Promise<Object>} - Created category
   */
  createCategory: async (categoryData) => {
    try {
      return await httpClient.backend.post('/tax/categories', categoryData);
    } catch (error) {
      console.error('Create tax category error:', error);
      throw error;
    }
  },

  /**
   * Get tax category by ID
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} - Tax category
   */
  getCategory: async (categoryId) => {
    try {
      return await httpClient.backend.get(`/tax/categories/${categoryId}`);
    } catch (error) {
      console.error('Get tax category error:', error);
      throw error;
    }
  },

  /**
   * Update tax category
   * @param {number} categoryId - Category ID
   * @param {Object} categoryData - Category data to update
   * @returns {Promise<Object>} - Updated category
   */
  updateCategory: async (categoryId, categoryData) => {
    try {
      return await httpClient.backend.put(`/tax/categories/${categoryId}`, categoryData);
    } catch (error) {
      console.error('Update tax category error:', error);
      throw error;
    }
  },

  /**
   * Delete tax category
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} - Success message
   */
  deleteCategory: async (categoryId) => {
    try {
      return await httpClient.backend.delete(`/tax/categories/${categoryId}`);
    } catch (error) {
      console.error('Delete tax category error:', error);
      throw error;
    }
  },

  /**
   * Get tax report
   * @param {Object} params - Query parameters {year, period}
   * @returns {Promise<Object>} - Tax report summary
   */
  getTaxReport: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/tax/report${queryString ? `?${queryString}` : ''}`;
      return await httpClient.backend.get(endpoint);
    } catch (error) {
      console.error('Get tax report error:', error);
      throw error;
    }
  },

  /**
   * Export tax data
   * @param {Object} params - Query parameters {year, format}
   * @returns {Promise<Blob>} - Exported file data
   */
  exportTaxData: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/tax/export${queryString ? `?${queryString}` : ''}`;
      
      // For file download, we need to handle differently
      const response = await fetch(`${httpClient.backend.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Export tax data error:', error);
      throw error;
    }
  }
};

export default taxService;
