import httpClient from './httpClient';

/**
 * Household Service
 * Handles household management and family budgeting features
 */
const householdService = {
  /**
   * Create a new household
   * @param {Object} householdData - Household data {name}
   * @returns {Promise<Object>} - Created household
   */
  createHousehold: async (householdData) => {
    try {
      return await httpClient.backend.post('/households', householdData);
    } catch (error) {
      console.error('Create household error:', error);
      throw error;
    }
  },

  /**
   * Get all households for the current user
   * @returns {Promise<Array>} - List of households
   */
  getHouseholds: async () => {
    try {
      return await httpClient.backend.get('/households');
    } catch (error) {
      console.error('Get households error:', error);
      throw error;
    }
  },

  /**
   * Get household by ID
   * @param {number} householdId - Household ID
   * @returns {Promise<Object>} - Household details with members
   */
  getHousehold: async (householdId) => {
    try {
      return await httpClient.backend.get(`/households/${householdId}`);
    } catch (error) {
      console.error('Get household error:', error);
      throw error;
    }
  },

  /**
   * Add member to household
   * @param {number} householdId - Household ID
   * @param {Object} memberData - Member data {userId, relationship, isDependent, allowanceAmount, allowanceFrequency}
   * @returns {Promise<Object>} - Added member
   */
  addMember: async (householdId, memberData) => {
    try {
      return await httpClient.backend.post(`/households/${householdId}/members`, memberData);
    } catch (error) {
      console.error('Add household member error:', error);
      throw error;
    }
  },

  /**
   * Update member's allowance
   * @param {number} householdId - Household ID
   * @param {number} memberId - Member ID
   * @param {Object} allowanceData - Allowance data {allowanceAmount, allowanceFrequency}
   * @returns {Promise<Object>} - Updated member
   */
  updateAllowance: async (householdId, memberId, allowanceData) => {
    try {
      return await httpClient.backend.put(
        `/households/${householdId}/members/${memberId}/allowance`,
        allowanceData
      );
    } catch (error) {
      console.error('Update allowance error:', error);
      throw error;
    }
  },

  /**
   * Remove member from household
   * @param {number} householdId - Household ID
   * @param {number} memberId - Member ID
   * @returns {Promise<Object>} - Success message
   */
  removeMember: async (householdId, memberId) => {
    try {
      return await httpClient.backend.delete(`/households/${householdId}/members/${memberId}`);
    } catch (error) {
      console.error('Remove household member error:', error);
      throw error;
    }
  },

  /**
   * Get household budgets
   * @param {number} householdId - Household ID
   * @returns {Promise<Array>} - List of budgets
   */
  getHouseholdBudgets: async (householdId) => {
    try {
      return await httpClient.backend.get(`/households/${householdId}/budgets`);
    } catch (error) {
      console.error('Get household budgets error:', error);
      throw error;
    }
  },

  /**
   * Get household goals
   * @param {number} householdId - Household ID
   * @returns {Promise<Array>} - List of goals
   */
  getHouseholdGoals: async (householdId) => {
    try {
      return await httpClient.backend.get(`/households/${householdId}/goals`);
    } catch (error) {
      console.error('Get household goals error:', error);
      throw error;
    }
  }
};

export default householdService;
