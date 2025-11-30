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
   * Get transaction trends analytics (income vs expenses over time)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Transaction trends data including income and expenses
   */
  getTransactionTrends: async (period = 'month') => {
    try {
      // FastAPI endpoint for transaction trends
      return await httpClient.analytics.get(`/analytics/transactions/trends?period=${period}`);
    } catch (error) {
      console.error(`Error fetching transaction trends for ${period}:`, error);
      throw error;
    }
  },

  /**
   * Get spending trends analytics (alias for getTransactionTrends for backward compatibility)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Spending trends data
   */
  getSpendingTrends: async (period = 'month') => {
    try {
      // Use transaction trends endpoint and transform data for spending trends
      const data = await httpClient.analytics.get(`/analytics/transactions/trends?period=${period}`);
      // Transform to spending trends format
      return {
        data: (data.trends || []).map(t => ({
          period: t.period,
          income: t.income,
          expense: t.expenses
        })),
        total_income: data.total_income,
        total_expenses: data.total_expenses,
        average_monthly_income: data.average_monthly_income,
        average_monthly_expenses: data.average_monthly_expenses
      };
    } catch (error) {
      console.error(`Error fetching spending trends for ${period}:`, error);
      throw error;
    }
  },

  /**
   * Get income vs expenses analytics (uses transaction trends endpoint)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Income vs expenses data
   */
  getIncomeVsExpenses: async (period = 'month') => {
    try {
      // Use transaction trends endpoint which includes income and expenses
      const data = await httpClient.analytics.get(`/analytics/transactions/trends?period=${period}`);
      return {
        trends: data.trends || [],
        totalIncome: data.total_income,
        totalExpenses: data.total_expenses,
        netBalance: data.total_income - data.total_expenses
      };
    } catch (error) {
      console.error(`Error fetching income vs expenses for ${period}:`, error);
      throw error;
    }
  },

  /**
   * Get category breakdown analytics (uses overview endpoint)
   * @param {string} type - Transaction type (income, expense, all)
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} - Category breakdown data
   */
  getCategoryBreakdown: async (type = 'expense', period = 'month') => {
    try {
      // Use overview endpoint which includes spending by category
      const data = await httpClient.analytics.get('/analytics/overview');
      return {
        categories: data.spending_by_category || [],
        total: data.expenses_30d || 0
      };
    } catch (error) {
      console.error(`Error fetching category breakdown for ${type} in ${period}:`, error);
      throw error;
    }
  },

  /**
   * Get budget performance analytics (uses insights endpoint)
   * @returns {Promise<Object>} - Budget performance data from insights
   */
  getBudgetPerformance: async () => {
    try {
      // Use insights endpoint which includes budget-related insights
      const data = await httpClient.analytics.get('/analytics/insights');
      const budgetInsights = (data.insights || []).filter(i =>
        i.category === 'budget' || i.type === 'budget_alert' || i.type === 'budget_warning'
      );
      return {
        insights: budgetInsights,
        generatedAt: data.generated_at
      };
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
