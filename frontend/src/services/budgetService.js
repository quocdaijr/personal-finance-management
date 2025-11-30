import Budget from '../models/Budget';
import httpClient from './httpClient';

/**
 * Budget Service
 * Handles budget-related operations through the Golang Gin backend API
 */
const budgetService = {
  /**
   * Get all budgets
   * @returns {Promise<Array>} - List of budgets
   */
  getAll: async () => {
    try {
      // Gin backend endpoint for budgets
      const data = await httpClient.backend.get('/budgets');
      return data.map(budget => Budget.fromJSON(budget));
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },
  
  /**
   * Get budget by ID
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} - Budget data
   */
  getById: async (id) => {
    try {
      // Gin backend endpoint for single budget
      const data = await httpClient.backend.get(`/budgets/${id}`);
      return Budget.fromJSON(data);
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create new budget
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} - Created budget
   */
  create: async (budgetData) => {
    try {
      const data = await httpClient.backend.post('/budgets', budgetData);
      return Budget.fromJSON(data);
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },
  
  /**
   * Update budget
   * @param {string} id - Budget ID
   * @param {Object} budgetData - Updated budget data
   * @returns {Promise<Object>} - Updated budget
   */
  update: async (id, budgetData) => {
    try {
      const data = await httpClient.backend.put(`/budgets/${id}`, budgetData);
      return Budget.fromJSON(data);
    } catch (error) {
      console.error(`Error updating budget ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete budget
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} - Response data
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/budgets/${id}`);
    } catch (error) {
      console.error(`Error deleting budget ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get budget periods
   * @returns {Promise<Array>} - List of budget periods
   */
  getBudgetPeriods: async () => {
    try {
      return await httpClient.backend.get('/budgets/periods');
    } catch (error) {
      console.error('Error fetching budget periods:', error);
      throw error;
    }
  },
  
  /**
   * Get budget summary
   * @returns {Promise<Object>} - Summary data
   */
  getSummary: async () => {
    try {
      // Gin backend endpoint for budget summary
      // httpClient automatically transforms snake_case to camelCase
      const data = await httpClient.backend.get('/budgets/summary');
      return data;
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      throw error;
    }
  }
};

export default budgetService;
