import httpClient from './httpClient';

/**
 * Collaboration Service
 * Handles transaction comments and approval workflows
 */
const collaborationService = {
  /**
   * Add comment to transaction
   * @param {number} transactionId - Transaction ID
   * @param {Object} commentData - Comment data {content, mentions}
   * @returns {Promise<Object>} - Created comment
   */
  addComment: async (transactionId, commentData) => {
    try {
      return await httpClient.backend.post(`/transactions/${transactionId}/comments`, commentData);
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  /**
   * Get comments for transaction
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<Array>} - List of comments
   */
  getComments: async (transactionId) => {
    try {
      return await httpClient.backend.get(`/transactions/${transactionId}/comments`);
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  /**
   * Delete comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} - Success message
   */
  deleteComment: async (commentId) => {
    try {
      return await httpClient.backend.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },

  /**
   * Request approval for transaction
   * @param {number} transactionId - Transaction ID
   * @param {Object} approvalData - Approval data {thresholdAmount}
   * @returns {Promise<Object>} - Created approval workflow
   */
  requestApproval: async (transactionId, approvalData) => {
    try {
      return await httpClient.backend.post(`/transactions/${transactionId}/approval`, approvalData);
    } catch (error) {
      console.error('Request approval error:', error);
      throw error;
    }
  },

  /**
   * Approve transaction
   * @param {number} approvalId - Approval workflow ID
   * @returns {Promise<Object>} - Success message
   */
  approveTransaction: async (approvalId) => {
    try {
      return await httpClient.backend.post(`/approvals/${approvalId}/approve`);
    } catch (error) {
      console.error('Approve transaction error:', error);
      throw error;
    }
  },

  /**
   * Reject transaction
   * @param {number} approvalId - Approval workflow ID
   * @param {Object} rejectionData - Rejection data {reason}
   * @returns {Promise<Object>} - Success message
   */
  rejectTransaction: async (approvalId, rejectionData) => {
    try {
      return await httpClient.backend.post(`/approvals/${approvalId}/reject`, rejectionData);
    } catch (error) {
      console.error('Reject transaction error:', error);
      throw error;
    }
  }
};

export default collaborationService;
