import httpClient from './httpClient';

/**
 * Category Service - handles category-related API calls
 */
const categoryService = {
  /**
   * Get all categories
   * @param {string} type - Optional filter by type (income/expense)
   * @returns {Promise<Array>}
   */
  getAll: async (type = null) => {
    try {
      const endpoint = type ? `/categories?type=${type}` : '/categories';
      return await httpClient.backend.get(endpoint);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get income categories
   * @returns {Promise<Array>}
   */
  getIncomeCategories: async () => {
    return categoryService.getAll('income');
  },

  /**
   * Get expense categories
   * @returns {Promise<Array>}
   */
  getExpenseCategories: async () => {
    return categoryService.getAll('expense');
  },

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      return await httpClient.backend.get(`/categories/${id}`);
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>}
   */
  create: async (categoryData) => {
    try {
      return await httpClient.backend.post('/categories', categoryData);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update a category
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>}
   */
  update: async (id, categoryData) => {
    try {
      return await httpClient.backend.put(`/categories/${id}`, categoryData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

export default categoryService;

