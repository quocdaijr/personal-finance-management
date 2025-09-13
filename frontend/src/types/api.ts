// API response types matching the backend models

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  analytics_token: string;
  expires_in: number;
  token_type: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Account types
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountRequest {
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_default?: boolean;
}

export interface AccountSummary {
  total_accounts: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
}

// Transaction types
export interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  account_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TransactionRequest {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  account_id: number;
  tags: string[];
}

export interface TransactionSummary {
  income: number;
  expenses: number;
  balance: number;
  count: number;
  by_category: CategorySummary[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
}

// Budget types
export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetRequest {
  name: string;
  amount: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
}

export interface BudgetSummary {
  total_budgeted: number;
  total_spent: number;
  remaining: number;
  utilization_percentage: number;
  by_category: BudgetCategorySummary[];
}

export interface BudgetCategorySummary {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  utilization_percentage: number;
}

// Analytics types
export interface FinancialOverview {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  income_30d: number;
  expenses_30d: number;
  balance_30d: number;
  spending_by_category: SpendingByCategory[];
  total_accounts: number;
}

export interface SpendingByCategory {
  category: string;
  amount: number;
}

export interface TransactionTrends {
  trends: TrendData[];
  total_income: number;
  total_expenses: number;
  average_monthly_income: number;
  average_monthly_expenses: number;
}

export interface TrendData {
  period: string;
  income: number;
  expenses: number;
  net: number;
}

export interface FinancialInsights {
  insights: Insight[];
  generated_at: string;
}

export interface Insight {
  type: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

// Common types
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form types
export interface FormErrors {
  [key: string]: string | string[];
}
