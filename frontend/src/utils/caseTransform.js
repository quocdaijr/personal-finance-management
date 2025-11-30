/**
 * Utility functions for transforming object keys between snake_case and camelCase
 */

/**
 * Convert a snake_case string to camelCase
 * @param {string} str - The snake_case string
 * @returns {string} - The camelCase string
 */
export const snakeToCamel = (str) => {
  if (typeof str !== 'string') return str;

  // Handle leading underscores (preserve them)
  const leadingUnderscores = str.match(/^_+/)?.[0] || '';
  const withoutLeading = str.slice(leadingUnderscores.length);

  // Convert snake_case to camelCase, handling consecutive underscores
  const camelCase = withoutLeading.replace(/_+([a-z0-9])/gi, (match, letter) => letter.toUpperCase());

  return leadingUnderscores + camelCase;
};

/**
 * Convert a camelCase string to snake_case
 * @param {string} str - The camelCase string
 * @returns {string} - The snake_case string
 */
export const camelToSnake = (str) => {
  if (typeof str !== 'string') return str;

  // Handle leading underscores (preserve them)
  const leadingUnderscores = str.match(/^_+/)?.[0] || '';
  const withoutLeading = str.slice(leadingUnderscores.length);

  // Convert camelCase to snake_case, handling numbers properly
  const snakeCase = withoutLeading.replace(/[A-Z0-9]+/g, (match, offset) => {
    // If it's at the start, don't add underscore
    if (offset === 0) return match.toLowerCase();
    return `_${match.toLowerCase()}`;
  });

  return leadingUnderscores + snakeCase;
};

/**
 * Recursively transform all keys in an object from snake_case to camelCase
 * @param {any} obj - The object to transform
 * @returns {any} - The transformed object
 */
export const keysToCamel = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects - return as-is
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = snakeToCamel(key);
      result[camelKey] = keysToCamel(obj[key]);
      return result;
    }, {});
  }

  return obj;
};

/**
 * Recursively transform all keys in an object from camelCase to snake_case
 * @param {any} obj - The object to transform
 * @returns {any} - The transformed object
 */
export const keysToSnake = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects - return as-is
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = keysToSnake(obj[key]);
      return result;
    }, {});
  }

  return obj;
};

