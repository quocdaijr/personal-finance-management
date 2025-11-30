import httpClient from './httpClient';

/**
 * Recurring Transaction Service - handles all recurring transaction API calls
 */
const recurringTransactionService = {
  /**
   * Get all recurring transactions
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      return await httpClient.backend.get('/recurring-transactions');
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      throw error;
    }
  },

  /**
   * Get recurring transaction by ID
   * @param {string|number} id - Recurring transaction ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      return await httpClient.backend.get(`/recurring-transactions/${id}`);
    } catch (error) {
      console.error('Error fetching recurring transaction:', error);
      throw error;
    }
  },

  /**
   * Create a new recurring transaction
   * @param {Object} data - Recurring transaction data
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      return await httpClient.backend.post('/recurring-transactions', data);
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      throw error;
    }
  },

  /**
   * Update a recurring transaction
   * @param {string|number} id - Recurring transaction ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      return await httpClient.backend.put(`/recurring-transactions/${id}`, data);
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      throw error;
    }
  },

  /**
   * Delete a recurring transaction
   * @param {string|number} id - Recurring transaction ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/recurring-transactions/${id}`);
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      throw error;
    }
  },

  /**
   * Toggle recurring transaction active status
   * @param {string|number} id - Recurring transaction ID
   * @param {boolean} active - Whether to activate or deactivate
   * @returns {Promise<Object>}
   */
  toggleActive: async (id, active) => {
    try {
      return await httpClient.backend.patch(`/recurring-transactions/${id}/toggle`, {
        active,
      });
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
      throw error;
    }
  },

  /**
   * Run a recurring transaction immediately
   * @param {string|number} id - Recurring transaction ID
   * @returns {Promise<Object>}
   */
  runNow: async (id) => {
    try {
      return await httpClient.backend.post(`/recurring-transactions/${id}/run`);
    } catch (error) {
      console.error('Error running recurring transaction:', error);
      throw error;
    }
  },
};

export default recurringTransactionService;

