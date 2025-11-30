import httpClient from './httpClient';

/**
 * Goal Service - handles all financial goal-related API calls
 */
const goalService = {
  /**
   * Get all goals
   * @param {string} filter - Optional filter ('active', 'completed', or undefined for all)
   * @returns {Promise<Array>}
   */
  getAll: async (filter = null) => {
    try {
      const params = filter ? `?filter=${filter}` : '';
      return await httpClient.backend.get(`/goals${params}`);
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  /**
   * Get goal by ID
   * @param {string|number} id - Goal ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      return await httpClient.backend.get(`/goals/${id}`);
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw error;
    }
  },

  /**
   * Create a new goal
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>}
   */
  create: async (goalData) => {
    try {
      return await httpClient.backend.post('/goals', goalData);
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  /**
   * Update a goal
   * @param {string|number} id - Goal ID
   * @param {Object} goalData - Updated goal data
   * @returns {Promise<Object>}
   */
  update: async (id, goalData) => {
    try {
      return await httpClient.backend.put(`/goals/${id}`, goalData);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  /**
   * Delete a goal
   * @param {string|number} id - Goal ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/goals/${id}`);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  /**
   * Get goals summary
   * @returns {Promise<Object>}
   */
  getSummary: async () => {
    try {
      return await httpClient.backend.get('/goals/summary');
    } catch (error) {
      console.error('Error fetching goals summary:', error);
      throw error;
    }
  },

  /**
   * Get goal categories
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    try {
      return await httpClient.backend.get('/goals/categories');
    } catch (error) {
      console.error('Error fetching goal categories:', error);
      throw error;
    }
  },

  /**
   * Add contribution to a goal
   * @param {string|number} id - Goal ID
   * @param {number} amount - Amount to contribute (positive to add, negative to subtract)
   * @param {string} description - Optional description
   * @returns {Promise<Object>}
   */
  contribute: async (id, amount, description = '') => {
    try {
      return await httpClient.backend.post(`/goals/${id}/contribute`, {
        amount,
        description,
      });
    } catch (error) {
      console.error('Error contributing to goal:', error);
      throw error;
    }
  },
};

export default goalService;

