import httpClient from './httpClient';

/**
 * Import Service - handles data import operations
 */
const importService = {
  /**
   * Import transactions from CSV file
   * @param {File} file - CSV file to import
   * @returns {Promise<Object>} - Import result
   */
  importTransactionsCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await httpClient.backend.post('/import/transactions/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw error;
    }
  },

  /**
   * Download import template
   * @returns {Promise<void>}
   */
  downloadTemplate: async () => {
    try {
      const response = await httpClient.backend.get('/import/template', {
        responseType: 'blob',
      });

      // Trigger download
      const blob = new Blob([response], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'import_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response;
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  },
};

export default importService;

