import httpClient from './httpClient';

/**
 * Export Service - handles data export operations
 */
const exportService = {
  /**
   * Export transactions to CSV
   * @param {Object} options - Export options
   * @param {string} options.startDate - Start date (YYYY-MM-DD)
   * @param {string} options.endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Blob>}
   */
  exportTransactionsCSV: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);

      const queryString = params.toString();
      const url = `/export/transactions/csv${queryString ? `?${queryString}` : ''}`;

      const response = await httpClient.backend.get(url, {
        responseType: 'blob',
      });

      // Trigger download
      const blob = new Blob([response], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response;
    } catch (error) {
      console.error('Error exporting transactions CSV:', error);
      throw error;
    }
  },

  /**
   * Export transactions to JSON
   * @param {Object} options - Export options
   * @returns {Promise<Blob>}
   */
  exportTransactionsJSON: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);

      const queryString = params.toString();
      const url = `/export/transactions/json${queryString ? `?${queryString}` : ''}`;

      const response = await httpClient.backend.get(url, {
        responseType: 'blob',
      });

      // Trigger download
      const blob = new Blob([response], { type: 'application/json' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response;
    } catch (error) {
      console.error('Error exporting transactions JSON:', error);
      throw error;
    }
  },

  /**
   * Export accounts to CSV
   * @returns {Promise<Blob>}
   */
  exportAccountsCSV: async () => {
    try {
      const response = await httpClient.backend.get('/export/accounts/csv', {
        responseType: 'blob',
      });

      // Trigger download
      const blob = new Blob([response], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `accounts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response;
    } catch (error) {
      console.error('Error exporting accounts CSV:', error);
      throw error;
    }
  },
};

export default exportService;

