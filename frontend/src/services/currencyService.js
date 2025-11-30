import httpClient from './httpClient';

/**
 * Currency Service - handles currency-related API calls
 */
const currencyService = {
  /**
   * Get all supported currencies
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      return await httpClient.backend.get('/currencies');
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Return default currencies on error
      return [
        { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
        { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
        { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
        { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimals: 0 },
      ];
    }
  },

  /**
   * Get currency by code
   * @param {string} code - Currency code
   * @returns {Promise<Object>}
   */
  getByCode: async (code) => {
    try {
      return await httpClient.backend.get(`/currencies/${code}`);
    } catch (error) {
      console.error('Error fetching currency:', error);
      throw error;
    }
  },

  /**
   * Convert amount between currencies
   * @param {number} amount - Amount to convert
   * @param {string} from - Source currency code
   * @param {string} to - Target currency code
   * @returns {Promise<Object>}
   */
  convert: async (amount, from, to) => {
    try {
      return await httpClient.backend.get(`/currencies/convert?amount=${amount}&from=${from}&to=${to}`);
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  },

  /**
   * Format amount with currency symbol
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Currency code
   * @returns {string}
   */
  formatAmount: (amount, currencyCode = 'USD') => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      VND: '₫',
      INR: '₹',
      KRW: '₩',
    };

    const symbol = currencySymbols[currencyCode] || currencyCode + ' ';
    const decimals = ['JPY', 'KRW', 'VND', 'IDR'].includes(currencyCode) ? 0 : 2;

    return symbol + amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },
};

export default currencyService;

