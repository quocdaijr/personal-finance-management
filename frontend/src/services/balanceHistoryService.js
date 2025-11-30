import httpClient from './httpClient';

/**
 * Balance History Service - handles balance history API calls
 */
const balanceHistoryService = {
  /**
   * Get overall balance trend
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>}
   */
  getOverallTrend: async (days = 30) => {
    try {
      return await httpClient.backend.get(`/balance-history/trend?days=${days}`);
    } catch (error) {
      console.error('Error fetching balance trend:', error);
      throw error;
    }
  },

  /**
   * Get balance history for an account
   * @param {number} accountId - Account ID
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>}
   */
  getAccountHistory: async (accountId, limit = 100) => {
    try {
      return await httpClient.backend.get(`/balance-history/account/${accountId}?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching account history:', error);
      throw error;
    }
  },

  /**
   * Get daily balances for an account
   * @param {number} accountId - Account ID
   * @param {number} days - Number of days
   * @returns {Promise<Array>}
   */
  getDailyBalances: async (accountId, days = 30) => {
    try {
      return await httpClient.backend.get(`/balance-history/account/${accountId}/daily?days=${days}`);
    } catch (error) {
      console.error('Error fetching daily balances:', error);
      throw error;
    }
  },
};

export default balanceHistoryService;

