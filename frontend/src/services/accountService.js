import Account from '../models/Account';
import httpClient from './httpClient';

/**
 * Account Service
 * Handles account-related operations through the Golang Gin backend API
 */
const accountService = {
  /**
   * Get all accounts
   * @returns {Promise<Array>} - List of accounts
   */
  getAll: async () => {
    try {
      // Gin backend endpoint for accounts
      const data = await httpClient.backend.get('/accounts');
      return data.map(account => Account.fromJSON(account));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },
  
  /**
   * Get account by ID
   * @param {string} id - Account ID
   * @returns {Promise<Object>} - Account data
   */
  getById: async (id) => {
    try {
      // Gin backend endpoint for single account
      const data = await httpClient.backend.get(`/accounts/${id}`);
      return Account.fromJSON(data);
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create new account
   * @param {Object} accountData - Account data
   * @returns {Promise<Object>} - Created account
   */
  create: async (accountData) => {
    try {
      const data = await httpClient.backend.post('/accounts', accountData);
      return Account.fromJSON(data);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },
  
  /**
   * Update account
   * @param {string} id - Account ID
   * @param {Object} accountData - Updated account data
   * @returns {Promise<Object>} - Updated account
   */
  update: async (id, accountData) => {
    try {
      const data = await httpClient.backend.put(`/accounts/${id}`, accountData);
      return Account.fromJSON(data);
    } catch (error) {
      console.error(`Error updating account ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete account
   * @param {string} id - Account ID
   * @returns {Promise<Object>} - Response data
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/accounts/${id}`);
    } catch (error) {
      console.error(`Error deleting account ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get account types
   * @returns {Promise<Array>} - List of account types
   */
  getAccountTypes: async () => {
    try {
      return await httpClient.backend.get('/accounts/types');
    } catch (error) {
      console.error('Error fetching account types:', error);
      throw error;
    }
  },
  
  /**
   * Get account summary
   * @returns {Promise<Object>} - Summary data
   */
  getSummary: async () => {
    try {
      // Gin backend endpoint for account summary
      return await httpClient.backend.get('/accounts/summary');
    } catch (error) {
      console.error('Error fetching account summary:', error);
      throw error;
    }
  }
};

export default accountService;
