import Transaction from '../models/Transaction';
import httpClient from './httpClient';

/**
 * Transaction Service
 * Handles transaction-related operations through the Golang Gin backend API
 */
const transactionService = {
  /**
   * Get all transactions with pagination and filtering
   * @param {Object} filters - Optional filters
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.page_size - Page size (default: 20, max: 100)
   * @param {string} filters.start_date - Start date (YYYY-MM-DD)
   * @param {string} filters.end_date - End date (YYYY-MM-DD)
   * @param {number} filters.min_amount - Minimum amount
   * @param {number} filters.max_amount - Maximum amount
   * @param {Array<string>} filters.categories - Array of categories
   * @param {string} filters.category - Single category
   * @param {string} filters.type - Transaction type (income, expense, transfer)
   * @param {number} filters.account_id - Account ID
   * @param {string} filters.search - Search query
   * @param {Array<string>} filters.tags - Array of tags
   * @param {string} filters.sort_by - Sort field (date, amount, category, type, created_at)
   * @param {string} filters.sort_order - Sort order (asc, desc)
   * @returns {Promise<Object>} - Paginated response { data, pagination }
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      // Pagination parameters
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);

      // Date filters
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      // Amount filters
      if (filters.min_amount !== undefined) params.append('min_amount', filters.min_amount);
      if (filters.max_amount !== undefined) params.append('max_amount', filters.max_amount);

      // Category filters (support both single and multiple)
      if (filters.categories?.length) {
        filters.categories.forEach(cat => params.append('categories', cat));
      } else if (filters.category) {
        params.append('category', filters.category);
      }

      // Type filter
      if (filters.type) params.append('type', filters.type);

      // Account filter
      if (filters.account_id) params.append('account_id', filters.account_id);

      // Search query
      if (filters.search) params.append('search', filters.search);

      // Tags filter
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }

      // Sorting
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      // Gin backend endpoint for transactions with pagination
      const response = await httpClient.backend.get(`/transactions?${params.toString()}`);

      // Handle both paginated and non-paginated responses for backward compatibility
      if (response.data && Array.isArray(response.data)) {
        return {
          data: response.data.map(transaction => Transaction.fromJSON(transaction)),
          total: response.total || response.data.length,
          page: response.page || 1,
          page_size: response.page_size || response.data.length,
          total_pages: response.total_pages || 1
        };
      }

      // Legacy format: direct array response
      if (Array.isArray(response)) {
        return {
          data: response.map(transaction => Transaction.fromJSON(transaction)),
          total: response.length,
          page: 1,
          page_size: response.length,
          total_pages: 1
        };
      }

      throw new Error('Unexpected response format');
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
