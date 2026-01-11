import httpClient from './httpClient';

/**
 * Sharing Service
 * Handles account sharing, invitations, and member management
 */
const sharingService = {
  /**
   * Invite user to account
   * @param {number} accountId - Account ID
   * @param {Object} invitationData - Invitation data {email, role}
   * @returns {Promise<Object>} - Created invitation
   */
  inviteUser: async (accountId, invitationData) => {
    try {
      return await httpClient.backend.post(`/accounts/${accountId}/invitations`, invitationData);
    } catch (error) {
      console.error('Invite user error:', error);
      throw error;
    }
  },

  /**
   * Get account members
   * @param {number} accountId - Account ID
   * @returns {Promise<Array>} - List of members
   */
  getAccountMembers: async (accountId) => {
    try {
      return await httpClient.backend.get(`/accounts/${accountId}/members`);
    } catch (error) {
      console.error('Get account members error:', error);
      throw error;
    }
  },

  /**
   * Update member role
   * @param {number} accountId - Account ID
   * @param {number} memberId - Member ID
   * @param {Object} roleData - Role data {role}
   * @returns {Promise<Object>} - Success message
   */
  updateMemberRole: async (accountId, memberId, roleData) => {
    try {
      return await httpClient.backend.put(
        `/accounts/${accountId}/members/${memberId}/role`,
        roleData
      );
    } catch (error) {
      console.error('Update member role error:', error);
      throw error;
    }
  },

  /**
   * Remove member from account
   * @param {number} accountId - Account ID
   * @param {number} memberId - Member ID
   * @returns {Promise<Object>} - Success message
   */
  removeMember: async (accountId, memberId) => {
    try {
      return await httpClient.backend.delete(`/accounts/${accountId}/members/${memberId}`);
    } catch (error) {
      console.error('Remove member error:', error);
      throw error;
    }
  },

  /**
   * Get pending invitations for current user
   * @returns {Promise<Array>} - List of pending invitations
   */
  getInvitations: async () => {
    try {
      return await httpClient.backend.get('/invitations');
    } catch (error) {
      console.error('Get invitations error:', error);
      throw error;
    }
  },

  /**
   * Accept invitation
   * @param {number} invitationId - Invitation ID
   * @returns {Promise<Object>} - Success message with member info
   */
  acceptInvitation: async (invitationId) => {
    try {
      return await httpClient.backend.post(`/invitations/${invitationId}/accept`);
    } catch (error) {
      console.error('Accept invitation error:', error);
      throw error;
    }
  },

  /**
   * Reject invitation
   * @param {number} invitationId - Invitation ID
   * @returns {Promise<Object>} - Success message
   */
  rejectInvitation: async (invitationId) => {
    try {
      return await httpClient.backend.post(`/invitations/${invitationId}/reject`);
    } catch (error) {
      console.error('Reject invitation error:', error);
      throw error;
    }
  },

  /**
   * Get account activity log
   * @param {number} accountId - Account ID
   * @param {Object} params - Query parameters {limit}
   * @returns {Promise<Array>} - List of activity log entries
   */
  getActivityLog: async (accountId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/accounts/${accountId}/activity${queryString ? `?${queryString}` : ''}`;
      return await httpClient.backend.get(endpoint);
    } catch (error) {
      console.error('Get activity log error:', error);
      throw error;
    }
  }
};

export default sharingService;
