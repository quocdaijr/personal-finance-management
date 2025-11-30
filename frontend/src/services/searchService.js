import httpClient from './httpClient';

/**
 * Search Service - handles global search API calls
 */
const searchService = {
  /**
   * Perform global search
   * @param {string} query - Search query
   * @param {number} limit - Maximum results
   * @returns {Promise<Object>}
   */
  search: async (query, limit = 20) => {
    try {
      if (!query || query.trim().length === 0) {
        return { query: '', total_results: 0, results: [] };
      }
      return await httpClient.backend.get(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  },
};

export default searchService;

