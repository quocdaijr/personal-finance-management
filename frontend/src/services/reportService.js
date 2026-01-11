import httpClient from './httpClient';

/**
 * Report Service
 * Handles custom report creation, generation, and management
 */
const reportService = {
  /**
   * Get all reports
   * @returns {Promise<Array>} - List of reports
   */
  getReports: async () => {
    try {
      return await httpClient.backend.get('/reports');
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  },

  /**
   * Create custom report
   * @param {Object} reportData - Report data {name, description, reportType, config}
   * @returns {Promise<Object>} - Created report
   */
  createReport: async (reportData) => {
    try {
      return await httpClient.backend.post('/reports', reportData);
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  },

  /**
   * Get report by ID
   * @param {number} reportId - Report ID
   * @returns {Promise<Object>} - Report details
   */
  getReport: async (reportId) => {
    try {
      return await httpClient.backend.get(`/reports/${reportId}`);
    } catch (error) {
      console.error('Get report error:', error);
      throw error;
    }
  },

  /**
   * Update report
   * @param {number} reportId - Report ID
   * @param {Object} reportData - Report data to update
   * @returns {Promise<Object>} - Updated report
   */
  updateReport: async (reportId, reportData) => {
    try {
      return await httpClient.backend.put(`/reports/${reportId}`, reportData);
    } catch (error) {
      console.error('Update report error:', error);
      throw error;
    }
  },

  /**
   * Delete report
   * @param {number} reportId - Report ID
   * @returns {Promise<Object>} - Success message
   */
  deleteReport: async (reportId) => {
    try {
      return await httpClient.backend.delete(`/reports/${reportId}`);
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  },

  /**
   * Generate report
   * @param {number} reportId - Report ID
   * @param {Object} params - Generation parameters {startDate, endDate, format}
   * @returns {Promise<Object>} - Generated report data
   */
  generateReport: async (reportId, params = {}) => {
    try {
      return await httpClient.backend.post(`/reports/${reportId}/generate`, params);
    } catch (error) {
      console.error('Generate report error:', error);
      throw error;
    }
  },

  /**
   * Download report (when implemented)
   * @param {number} reportId - Report ID
   * @param {string} format - Export format (pdf, excel, csv)
   * @returns {Promise<Blob>} - File blob for download
   */
  downloadReport: async (reportId, format = 'pdf') => {
    try {
      // Note: This endpoint is currently not implemented (returns 501)
      // When implemented, this will download the generated report
      const response = await fetch(
        `${httpClient.backend.baseUrl}/reports/${reportId}/download?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 501) {
          throw new Error('Report download feature is not yet implemented');
        }
        throw new Error('Download failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download report error:', error);
      throw error;
    }
  }
};

export default reportService;
