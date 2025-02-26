import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Add,
  Search,
  FilterList,
  ViewList,
  TableChart,
  Refresh,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layout';

// Import enhanced components
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionSummaryDashboard from '../components/transactions/TransactionSummaryDashboard';
import TransactionFormEnhanced from '../components/transactions/TransactionFormEnhanced';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import TransactionList from '../components/dashboard/TransactionList';

// Services would be imported here in a real implementation
// import transactionService from '../services/transactionService';
// import accountService from '../services/accountService';

// Import Transaction model for mock data
import TransactionModel from '../models/Transaction';

// Import types
import {
  Transaction,
  TransactionFilters,
  TransactionSummary,
  PaginationState,
  SortState,
  Account,
  ViewMode,
  TransactionFormData,
} from '../types/transaction';

const TransactionsEnhanced: React.FC = () => {
  const { theme } = useTheme();

  // State for data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // State for filters
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    category: '',
    account: '',
    type: '',
    dateFrom: null,
    dateTo: null,
  });

  // State for pagination and sorting
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  const [sort, setSort] = useState<SortState>({
    field: 'date',
    direction: 'desc',
  });

  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [summaryPeriod, setSummaryPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // State for forms and dialogs
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // View mode options
  const viewModes: ViewMode[] = [
    { type: 'table', label: 'Table', icon: <TableChart /> },
    { type: 'list', label: 'List', icon: <ViewList /> },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactionsData();
  }, []);

  // Fetch data when filters, pagination, or sort change (but only after initial load)
  useEffect(() => {
    if (!loading) {
      fetchFilteredTransactions();
    }
  }, [filters, pagination.page, pagination.pageSize, sort, loading]);

  // Fetch transactions data
  const fetchTransactionsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock data for testing - replace with actual service calls
      const mockAccounts: Account[] = [
        { id: 1, name: 'Checking Account', type: 'checking', balance: 5000, isDefault: true },
        { id: 2, name: 'Savings Account', type: 'savings', balance: 15000 },
        { id: 3, name: 'Credit Card', type: 'credit', balance: -1200 },
      ];

      const mockCategories = [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Travel',
        'Income',
        'Other'
      ];

      setAccounts(mockAccounts);
      setCategories(mockCategories);

      // Also fetch transactions on initial load
      await fetchFilteredTransactions();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered transactions
  const fetchFilteredTransactions = useCallback(async () => {
    try {
      // Mock transaction data for testing - using Transaction model
      const mockTransactionData = [
        {
          id: 1,
          amount: 85.50,
          description: 'Grocery Shopping',
          category: 'Food & Dining',
          type: 'expense',
          date: '2024-05-30',
          accountId: 1,
          tags: ['groceries', 'weekly'],
          createdAt: '2024-05-30T10:30:00Z',
          updatedAt: '2024-05-30T10:30:00Z'
        },
        {
          id: 2,
          amount: 2500.00,
          description: 'Salary Payment',
          category: 'Income',
          type: 'income',
          date: '2024-05-28',
          accountId: 1,
          tags: ['salary', 'monthly'],
          createdAt: '2024-05-28T09:00:00Z',
          updatedAt: '2024-05-28T09:00:00Z'
        },
        {
          id: 3,
          amount: 45.00,
          description: 'Gas Station',
          category: 'Transportation',
          type: 'expense',
          date: '2024-05-29',
          accountId: 1,
          tags: ['fuel'],
          createdAt: '2024-05-29T16:45:00Z',
          updatedAt: '2024-05-29T16:45:00Z'
        },
        {
          id: 4,
          amount: 120.00,
          description: 'Electric Bill',
          category: 'Bills & Utilities',
          type: 'expense',
          date: '2024-05-27',
          accountId: 1,
          tags: ['utilities', 'monthly'],
          createdAt: '2024-05-27T14:20:00Z',
          updatedAt: '2024-05-27T14:20:00Z'
        },
        {
          id: 5,
          amount: 25.99,
          description: 'Netflix Subscription',
          category: 'Entertainment',
          type: 'expense',
          date: '2024-05-26',
          accountId: 2,
          tags: ['subscription', 'streaming'],
          createdAt: '2024-05-26T12:00:00Z',
          updatedAt: '2024-05-26T12:00:00Z'
        }
      ];

      // Convert to Transaction model instances
      const mockTransactions = mockTransactionData.map(data => TransactionModel.fromJSON(data));

      // Apply filters
      let filteredTransactions = mockTransactions.filter((transaction: any) => {
        if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.category && transaction.category !== filters.category) {
          return false;
        }
        if (filters.account && transaction.accountId.toString() !== filters.account) {
          return false;
        }
        if (filters.type && transaction.type !== filters.type) {
          return false;
        }
        if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) {
          return false;
        }
        return true;
      });

      // Apply sorting
      filteredTransactions.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];

        if (sort.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: filteredTransactions.length,
      }));

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      setTransactions(paginatedTransactions);
    } catch (err) {
      console.error('Error fetching filtered transactions:', err);
      setError('Failed to load transactions. Please try again.');
    }
  }, [filters, pagination.page, pagination.pageSize, sort]);

  // Handle filter changes
  const handleFilterChange = (field: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      page: 1, // Reset to first page
    }));
  };

  // Handle sorting
  const handleSortChange = (field: keyof Transaction) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      account: '',
      type: '',
      dateFrom: null,
      dateTo: null,
    });
  };

  // Handle transaction form
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormOpen(true);
  };

  const handleSaveTransaction = async (transactionData: TransactionFormData) => {
    try {
      // Mock save operation - in real app, this would call the service
      console.log('Saving transaction:', transactionData);

      setSnackbar({
        open: true,
        message: editingTransaction ? 'Transaction updated successfully' : 'Transaction added successfully',
        severity: 'success',
      });

      // Refresh data
      await fetchFilteredTransactions();
      setTransactionFormOpen(false);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save transaction',
        severity: 'error',
      });
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      // Mock delete operation - in real app, this would call the service
      console.log('Deleting transaction:', transactionToDelete.id);

      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success',
      });

      // Refresh data
      await fetchFilteredTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete transaction',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  // Calculate summary
  const calculateSummary = (): TransactionSummary => {
    // This would typically come from the backend
    const income = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);

    const expenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);

    const incomeTransactions = transactions.filter((t: any) => t.type === 'income').length;
    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense').length;

    return {
      count: transactions.length,
      income,
      expenses,
      balance: income - expenses,
      avgTransaction: transactions.length > 0 ? (income + expenses) / transactions.length : 0,
      totalTransactions: transactions.length,
      incomeTransactions,
      expenseTransactions,
    };
  };

  const summary = calculateSummary();

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <PageLayout maxWidth="xl" showSearch={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading transactions...</Typography>
        </Box>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout maxWidth="xl" showSearch={false}>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={fetchTransactionsData}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl" showSearch={false}>
      {/* Transaction Summary Dashboard */}
      <TransactionSummaryDashboard
        summary={summary}
        period={summaryPeriod}
        onPeriodChange={setSummaryPeriod}
        loading={false}
      />

      {/* Action Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newViewMode) => newViewMode && setViewMode(newViewMode)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderColor: theme.border.primary,
              color: theme.text.secondary,
              '&.Mui-selected': {
                backgroundColor: '#C8EE44',
                color: '#1B212D',
                borderColor: '#C8EE44',
                '&:hover': {
                  backgroundColor: '#B8DE34',
                },
              },
            },
          }}
        >
          {viewModes.map((mode) => (
            <ToggleButton key={mode.type} value={mode.type}>
              {mode.icon}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {mode.label}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Add Transaction Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddTransaction}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: theme.background.paper,
          border: `1px solid ${theme.border.primary}`,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search transactions"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: theme.text.secondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {Object.values(filters).some(v => v !== '' && v !== null) && (
              <Button variant="text" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Account</InputLabel>
                  <Select
                    value={filters.account}
                    onChange={(e) => handleFilterChange('account', e.target.value)}
                    label="Account"
                  >
                    <MenuItem value="">All Accounts</MenuItem>
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="From Date"
                    value={filters.dateFrom}
                    onChange={(date) => handleFilterChange('dateFrom', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="To Date"
                    value={filters.dateTo}
                    onChange={(date) => handleFilterChange('dateTo', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Active Filters */}
      {Object.values(filters).some(v => v !== '' && v !== null) && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Active filters:
          </Typography>

          {filters.search && (
            <Chip
              label={`Search: ${filters.search}`}
              size="small"
              onDelete={() => handleFilterChange('search', '')}
            />
          )}

          {filters.category && (
            <Chip
              label={`Category: ${filters.category}`}
              size="small"
              onDelete={() => handleFilterChange('category', '')}
            />
          )}

          {filters.account && (
            <Chip
              label={`Account: ${accounts.find(a => a.id.toString() === filters.account)?.name || filters.account}`}
              size="small"
              onDelete={() => handleFilterChange('account', '')}
            />
          )}

          {filters.type && (
            <Chip
              label={`Type: ${filters.type === 'income' ? 'Income' : 'Expense'}`}
              size="small"
              onDelete={() => handleFilterChange('type', '')}
            />
          )}

          {filters.dateFrom && (
            <Chip
              label={`From: ${new Date(filters.dateFrom).toLocaleDateString()}`}
              size="small"
              onDelete={() => handleFilterChange('dateFrom', null)}
            />
          )}

          {filters.dateTo && (
            <Chip
              label={`To: ${new Date(filters.dateTo).toLocaleDateString()}`}
              size="small"
              onDelete={() => handleFilterChange('dateTo', null)}
            />
          )}
        </Box>
      )}

      {/* Transactions Display */}
      {viewMode === 'table' ? (
        <TransactionTable
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          loading={false}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sort={sort}
          onSortChange={handleSortChange}
        />
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          title={`${pagination.total} Transaction${pagination.total !== 1 ? 's' : ''}`}
        />
      )}

      {/* Transaction Form Dialog */}
      <TransactionFormEnhanced
        open={transactionFormOpen}
        onClose={() => setTransactionFormOpen(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        isEditing={!!editingTransaction}
        accounts={accounts}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Transaction"
        message={`Are you sure you want to delete the transaction "${transactionToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTransaction}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setTransactionToDelete(null);
        }}
        severity="error"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default TransactionsEnhanced;
