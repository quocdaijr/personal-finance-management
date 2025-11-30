// Type declarations for JavaScript components and pages

declare module '../pages/Home' {
  const Home: React.FC;
  export default Home;
}

declare module '../pages/NotFound' {
  const NotFound: React.FC;
  export default NotFound;
}

declare module '../pages/Transactions' {
  const Transactions: React.FC;
  export default Transactions;
}

declare module '../pages/Accounts' {
  const Accounts: React.FC;
  export default Accounts;
}

declare module '../pages/Budgets' {
  const Budgets: React.FC;
  export default Budgets;
}

declare module '../pages/Wallets' {
  const Wallets: React.FC;
  export default Wallets;
}

declare module '../pages/GeneralSettings' {
  const GeneralSettings: React.FC;
  export default GeneralSettings;
}

declare module '../pages/AccountSettings' {
  const AccountSettings: React.FC;
  export default AccountSettings;
}

declare module '../pages/Help' {
  const Help: React.FC;
  export default Help;
}

declare module '../components/dashboard/AccountSummary.jsx' {
  const AccountSummary: React.FC<any>;
  export default AccountSummary;
}

declare module '../components/dashboard/BudgetProgress.jsx' {
  const BudgetProgress: React.FC<any>;
  export default BudgetProgress;
}

declare module '../components/dashboard/TransactionForm.jsx' {
  const TransactionForm: React.FC<any>;
  export default TransactionForm;
}

declare module '../components/dashboard/TransactionList.jsx' {
  const TransactionList: React.FC<any>;
  export default TransactionList;
}

declare module '../components/dashboard/TransactionList' {
  const TransactionList: React.FC<any>;
  export default TransactionList;
}

declare module '../../services/accountService' {
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

declare module '../../services/transactionService' {
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

declare module '../../services/notificationService' {
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

declare module '../../services/searchService' {
  const searchService: {
    search: (query: string, limit?: number) => Promise<any>;
  };
  export default searchService;
}

declare module '../../services/importService' {
  const importService: {
    importTransactionsCSV: (file: File) => Promise<any>;
    downloadTemplate: () => Promise<void>;
  };
  export default importService;
}

