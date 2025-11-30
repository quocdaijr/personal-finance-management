import Transaction from '../models/Transaction';
import httpClient from './httpClient';

/**
 * Transaction Service
 * Handles transaction-related operations through the Golang Gin backend API
 */
const transactionService = {
  /**
   * Get all transactions
   * @returns {Promise<Array>} - List of transactions
   */
  getAll: async () => {
    try {
      // Gin backend endpoint for transactions
      const data = await httpClient.backend.get('/transactions');
      return data.map(transaction => Transaction.fromJSON(transaction));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} - Transaction data
   */
  getById: async (id) => {
    try {
      // Gin backend endpoint for single transaction
      const data = await httpClient.backend.get(`/transactions/${id}`);
      return Transaction.fromJSON(data);
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  create: async (transactionData) => {
    try {
      const data = await httpClient.backend.post('/transactions', transactionData);
      return Transaction.fromJSON(data);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },
  
  /**
   * Update transaction
   * @param {string} id - Transaction ID
   * @param {Object} transactionData - Updated transaction data
   * @returns {Promise<Object>} - Updated transaction
   */
  update: async (id, transactionData) => {
    try {
      const data = await httpClient.backend.put(`/transactions/${id}`, transactionData);
      return Transaction.fromJSON(data);
    } catch (error) {
      console.error(`Error updating transaction ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} - Response data
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/transactions/${id}`);
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get transaction categories
   * @returns {Promise<Array>} - List of categories
   */
  getCategories: async () => {
    try {
      return await httpClient.backend.get('/transactions/categories');
    } catch (error) {
      console.error('Error fetching transaction categories:', error);
      throw error;
    }
  },
  
  /**
   * Get transaction summary
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Summary data
   */
  getSummary: async (period = 'month') => {
    try {
      // Gin backend endpoint for transaction summary
      return await httpClient.backend.get(`/transactions/summary?period=${period}`);
    } catch (error) {
      console.error(`Error fetching transaction summary for ${period}:`, error);
      throw error;
    }
  },

  /**
   * Transfer money between accounts
   * @param {Object} transferData - Transfer details
   * @param {number} transferData.amount - Amount to transfer
   * @param {string} transferData.description - Transfer description
   * @param {number} transferData.from_account_id - Source account ID
   * @param {number} transferData.to_account_id - Destination account ID
   * @param {string} transferData.date - Transfer date
   * @param {Array} transferData.tags - Optional tags
   * @returns {Promise<Object>} - Transfer response with both transactions
   */
  transfer: async (transferData) => {
    try {
      return await httpClient.backend.post('/transactions/transfer', transferData);
    } catch (error) {
      console.error('Error transferring money:', error);
      throw error;
    }
  },

  /**
   * Export transactions to CSV
   * @param {Object} filters - Optional filters for export
   * @returns {Promise<Blob>} - CSV file as blob
   */
  exportToCSV: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/transactions/export${queryParams ? `?${queryParams}` : ''}`;
      return await httpClient.backend.get(url, { responseType: 'blob' });
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
};

export default transactionService;
