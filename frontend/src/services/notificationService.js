import httpClient from './httpClient';

/**
 * Notification Service - handles all notification-related API calls
 */
const notificationService = {
  /**
   * Get all notifications
   * @param {number} limit - Maximum number of notifications
   * @returns {Promise<Array>}
   */
  getAll: async (limit = 50) => {
    try {
      return await httpClient.backend.get(`/notifications?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications
   * @returns {Promise<Array>}
   */
  getUnread: async () => {
    try {
      return await httpClient.backend.get('/notifications/unread');
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification summary
   * @returns {Promise<Object>}
   */
  getSummary: async () => {
    try {
      return await httpClient.backend.get('/notifications/summary');
    } catch (error) {
      console.error('Error fetching notification summary:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} id - Notification ID
   * @returns {Promise<Object>}
   */
  markAsRead: async (id) => {
    try {
      return await httpClient.backend.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>}
   */
  markAllAsRead: async () => {
    try {
      return await httpClient.backend.post('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {number} id - Notification ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      return await httpClient.backend.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export default notificationService;

