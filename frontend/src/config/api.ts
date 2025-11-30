// API configuration for the finance management application
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  ANALYTICS_URL: import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh-token',
    PROFILE: '/api/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    SETUP_2FA: '/api/auth/setup-2fa',
    VERIFY_2FA: '/api/auth/verify-2fa',
    DISABLE_2FA: '/api/auth/disable-2fa',
    // Password reset
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    // Email verification
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
  },
  
  // Accounts
  ACCOUNTS: {
    LIST: '/api/accounts',
    CREATE: '/api/accounts',
    DETAIL: (id: string) => `/api/accounts/${id}`,
    UPDATE: (id: string) => `/api/accounts/${id}`,
    DELETE: (id: string) => `/api/accounts/${id}`,
    SUMMARY: '/api/accounts/summary',
    TYPES: '/api/accounts/types',
  },
  
  // Transactions
  TRANSACTIONS: {
    LIST: '/api/transactions',
    CREATE: '/api/transactions',
    DETAIL: (id: string) => `/api/transactions/${id}`,
    UPDATE: (id: string) => `/api/transactions/${id}`,
    DELETE: (id: string) => `/api/transactions/${id}`,
    SUMMARY: '/api/transactions/summary',
    CATEGORIES: '/api/transactions/categories',
    TRANSFER: '/api/transactions/transfer',
    EXPORT: '/api/transactions/export',
  },
  
  // Budgets
  BUDGETS: {
    LIST: '/api/budgets',
    CREATE: '/api/budgets',
    DETAIL: (id: string) => `/api/budgets/${id}`,
    UPDATE: (id: string) => `/api/budgets/${id}`,
    DELETE: (id: string) => `/api/budgets/${id}`,
    SUMMARY: '/api/budgets/summary',
    PERIODS: '/api/budgets/periods',
  },

  // Goals
  GOALS: {
    LIST: '/api/goals',
    CREATE: '/api/goals',
    DETAIL: (id: string) => `/api/goals/${id}`,
    UPDATE: (id: string) => `/api/goals/${id}`,
    DELETE: (id: string) => `/api/goals/${id}`,
    SUMMARY: '/api/goals/summary',
    CATEGORIES: '/api/goals/categories',
    CONTRIBUTE: (id: string) => `/api/goals/${id}/contribute`,
  },

  // Recurring Transactions
  RECURRING: {
    LIST: '/api/recurring-transactions',
    CREATE: '/api/recurring-transactions',
    DETAIL: (id: string) => `/api/recurring-transactions/${id}`,
    UPDATE: (id: string) => `/api/recurring-transactions/${id}`,
    DELETE: (id: string) => `/api/recurring-transactions/${id}`,
    TOGGLE: (id: string) => `/api/recurring-transactions/${id}/toggle`,
    RUN_NOW: (id: string) => `/api/recurring-transactions/${id}/run`,
  },

  // Export
  EXPORT: {
    TRANSACTIONS_CSV: '/api/export/transactions/csv',
    TRANSACTIONS_JSON: '/api/export/transactions/json',
    ACCOUNTS_CSV: '/api/export/accounts/csv',
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    TRENDS: '/api/analytics/transactions/trends',
    INSIGHTS: '/api/analytics/insights',
  },

  // Health checks
  HEALTH: {
    BACKEND: '/health',
    ANALYTICS: '/health',
  },
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;
