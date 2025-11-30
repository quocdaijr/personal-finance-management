// Type declarations for JavaScript services

declare module '../services/authService' {
  const authService: {
    forgotPassword: (email: string) => Promise<any>;
    resetPassword: (token: string, password: string) => Promise<any>;
    verifyEmail: (token: string) => Promise<any>;
    resendVerification: (email: string) => Promise<any>;
  };
  export default authService;
}

declare module '../services/accountService' {
  const accountService: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getSummary: () => Promise<any>;
  };
  export default accountService;
}

declare module '../services/transactionService' {
  const transactionService: {
    getAll: (params?: any) => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getSummary: (period?: string) => Promise<any>;
    transfer: (data: any) => Promise<any>;
  };
  export default transactionService;
}

declare module '../services/goalService' {
  const goalService: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getSummary: () => Promise<any>;
    contribute: (id: number, amount: number) => Promise<any>;
  };
  export default goalService;
}

declare module '../services/recurringTransactionService' {
  const recurringTransactionService: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  export default recurringTransactionService;
}

declare module '../services/analyticsService' {
  const analyticsService: {
    getFinancialOverview: () => Promise<any>;
    getSpendingTrends: (period: string) => Promise<any>;
    getInsights: () => Promise<any>;
  };
  export default analyticsService;
}

declare module '../services/exportService' {
  const exportService: {
    exportTransactionsCSV: () => Promise<void>;
    exportTransactionsJSON: () => Promise<void>;
    exportAccountsCSV: () => Promise<void>;
  };
  export default exportService;
}

declare module '../services/categoryService' {
  const categoryService: {
    getAll: (type?: string) => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  export default categoryService;
}

declare module '../services/notificationService' {
  const notificationService: {
    getAll: (limit?: number) => Promise<any[]>;
    getUnread: () => Promise<any[]>;
    getSummary: () => Promise<any>;
    markAsRead: (id: number) => Promise<any>;
    markAllAsRead: () => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  export default notificationService;
}

declare module '../services/searchService' {
  const searchService: {
    search: (query: string, limit?: number) => Promise<any>;
  };
  export default searchService;
}

declare module '../services/importService' {
  const importService: {
    importTransactionsCSV: (file: File) => Promise<any>;
    downloadTemplate: () => Promise<void>;
  };
  export default importService;
}

declare module '../models/Transaction' {
  export interface Transaction {
    id: number;
    amount: number;
    description: string;
    category: string;
    type: string;
    date: string;
    account_id: number;
    tags?: string;
  }
}

