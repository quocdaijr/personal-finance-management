import httpClient from './httpClient';

/**
 * Analytics Service
 * Handles analytics-related operations through the Python Flask Analytics API
 */
const analyticsService = {
  /**
   * Get financial overview analytics
   * @returns {Promise<Object>} - Financial overview data
   */
  getFinancialOverview: async () => {
    try {
      // Flask API endpoint for financial overview
      return await httpClient.analytics.get('/analytics/overview');
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      throw error;
    }
  },
  
  /**
   * Get spending trends analytics
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Spending trends data
   */
  getSpendingTrends: async (period = 'month') => {
    try {
      // Flask API endpoint for spending trends
      return await httpClient.analytics.get(`/analytics/spending-trends?period=${period}`);
    } catch (error) {
      console.error(`Error fetching spending trends for ${period}:`, error);
      throw error;
    }
  },
  
  /**
   * Get income vs expenses analytics
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Income vs expenses data
   */
  getIncomeVsExpenses: async (period = 'month') => {
    try {
      // Flask API endpoint for income vs expenses
      return await httpClient.analytics.get(`/analytics/income-expenses?period=${period}`);
    } catch (error) {
      console.error(`Error fetching income vs expenses for ${period}:`, error);
      throw error;
    }
  },
  
  /**
   * Get category breakdown analytics
   * @param {string} type - Transaction type (income, expense, all)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Category breakdown data
   */
  getCategoryBreakdown: async (type = 'expense', period = 'month') => {
    try {
      // Flask API endpoint for category breakdown
      return await httpClient.analytics.get(`/analytics/category-breakdown?type=${type}&period=${period}`);
    } catch (error) {
      console.error(`Error fetching category breakdown for ${type} in ${period}:`, error);
      throw error;
    }
  },
  
  /**
   * Get budget performance analytics
   * @returns {Promise<Object>} - Budget performance data
   */
  getBudgetPerformance: async () => {
    try {
      // Flask API endpoint for budget performance
      return await httpClient.analytics.get('/analytics/budget-performance');
    } catch (error) {
      console.error('Error fetching budget performance:', error);
      throw error;
    }
  },
  
  /**
   * Get account balance history
   * @param {string} accountId - Account ID (optional)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Account balance history data
   */
  getAccountBalanceHistory: async (accountId = null, period = 'month') => {
    try {
      // Flask API endpoint for account balance history
      const endpoint = accountId 
        ? `/analytics/accounts/${accountId}/balance-history?period=${period}`
        : `/analytics/accounts/balance-history?period=${period}`;
        
      return await httpClient.analytics.get(endpoint);
    } catch (error) {
      console.error(`Error fetching account balance history for ${period}:`, error);
      throw error;
    }
  },
  
  /**
   * Get transaction analytics
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Transaction analytics data
   */
  getTransactionAnalytics: async (period = 'month') => {
    try {
      // Flask API endpoint for transaction analytics
      return await httpClient.analytics.get(`/analytics/transactions?period=${period}`);
    } catch (error) {
      console.error(`Error fetching transaction analytics for ${period}:`, error);
      throw error;
    }
  },
  
  /**
   * Get account analytics
   * @returns {Promise<Object>} - Account analytics data
   */
  getAccountAnalytics: async () => {
    try {
      // Flask API endpoint for account analytics
      return await httpClient.analytics.get('/analytics/accounts');
    } catch (error) {
      console.error('Error fetching account analytics:', error);
      throw error;
    }
  },
  
  /**
   * Get budget analytics
   * @returns {Promise<Object>} - Budget analytics data
   */
  getBudgetAnalytics: async () => {
    try {
      // Flask API endpoint for budget analytics
      return await httpClient.analytics.get('/analytics/budgets');
    } catch (error) {
      console.error('Error fetching budget analytics:', error);
      throw error;
    }
  },
  
  /**
   * Get financial insights and recommendations
   * @returns {Promise<Object>} - Insights and recommendations data
   */
  getInsights: async () => {
    try {
      // Flask API endpoint for financial insights
      return await httpClient.analytics.get('/analytics/insights');
    } catch (error) {
      console.error('Error fetching financial insights:', error);
      throw error;
    }
  }
};

export default analyticsService;
