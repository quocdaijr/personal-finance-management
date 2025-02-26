/**
 * Transaction-related TypeScript interfaces and types
 */

export interface Transaction {
  id: string | number;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  accountId: string | number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  search: string;
  category: string;
  account: string;
  type: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface TransactionSummary {
  count: number;
  income: number;
  expenses: number;
  balance: number;
  avgTransaction: number;
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: keyof Transaction;
  direction: 'asc' | 'desc';
}

export interface TransactionFormData {
  amount: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  accountId: string;
  tags: string[];
}

export interface Account {
  id: string | number;
  name: string;
  type: string;
  balance: number;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  loading?: boolean;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sort: SortState;
  onSortChange: (field: keyof Transaction) => void;
}

export interface TransactionSummaryDashboardProps {
  summary: TransactionSummary;
  period: 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  loading?: boolean;
}

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
}

export interface TransactionListViewProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  loading?: boolean;
  title?: string;
}

export interface ViewMode {
  type: 'list' | 'table';
  label: string;
  icon: React.ReactNode;
}

export interface TimePeriod {
  value: 'week' | 'month' | 'quarter' | 'year';
  label: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  avgDailySpending: number;
  avgDailyIncome: number;
  topCategory: {
    name: string;
    amount: number;
  };
  transactionTrend: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
}
