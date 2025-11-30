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
  SwapHoriz,
  Upload,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { PageLayout } from '../components/layout';

// Import enhanced components
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionSummaryDashboard from '../components/transactions/TransactionSummaryDashboard';
import TransactionFormEnhanced from '../components/transactions/TransactionFormEnhanced';
import TransferDialog from '../components/transactions/TransferDialog';
import ImportDialog from '../components/transactions/ImportDialog';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import TransactionList from '../components/dashboard/TransactionList';

// Import services for API calls
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';

// Import utilities
import { formatDate as formatDateUtil } from '../utils/formatters';

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
  const { preferences } = useUserPreferences();

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
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
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
      // Fetch accounts and categories from real API
      const [accountsData, categoriesData] = await Promise.all([
        accountService.getAll(),
        transactionService.getCategories(),
      ]);

      // Map accounts to the expected format
      const mappedAccounts: Account[] = accountsData.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        isDefault: acc.isDefault || false,
      }));

      setAccounts(mappedAccounts);
      setCategories(categoriesData || []);

      // Also fetch transactions on initial load
      await fetchFilteredTransactions();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered transactions from real API
  const fetchFilteredTransactions = useCallback(async () => {
    try {
      // Fetch all transactions from API
      const allTransactions = await transactionService.getAll();

      // Apply filters client-side (backend can handle this too with query params)
      let filteredTransactions = allTransactions.filter((transaction: any) => {
        if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.category && transaction.category !== filters.category) {
          return false;
        }
        if (filters.account && transaction.accountId?.toString() !== filters.account) {
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
      filteredTransactions.sort((a: any, b: any) => {
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
      // Prepare data for API
      // Backend expects RFC3339 format (ISO 8601 with time)
      // TransactionFormData.date is always a Date object from the form
      const formattedDate = transactionData.date instanceof Date
        ? transactionData.date.toISOString()
        : new Date().toISOString();

      const apiData = {
        amount: parseFloat(transactionData.amount),
        description: transactionData.description,
        category: transactionData.category,
        type: transactionData.type,
        date: formattedDate,
        account_id: parseInt(transactionData.accountId, 10),
        tags: transactionData.tags || [],
      };

      if (editingTransaction) {
        // Update existing transaction
        await transactionService.update(String(editingTransaction.id), apiData);
      } else {
        // Create new transaction
        await transactionService.create(apiData);
      }

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
      // Delete transaction via API
      await transactionService.delete(String(transactionToDelete.id));

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

        {/* Import Button */}
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => setImportDialogOpen(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            mr: 2,
          }}
        >
          Import
        </Button>

        {/* Transfer Button */}
        <Button
          variant="outlined"
          startIcon={<SwapHoriz />}
          onClick={() => setTransferDialogOpen(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            mr: 2,
          }}
        >
          Transfer
        </Button>

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
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="To Date"
                    value={filters.dateTo}
                    onChange={(date) => handleFilterChange('dateTo', date)}
                    slotProps={{ textField: { fullWidth: true } }}
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
              label={`From: ${formatDateUtil(filters.dateFrom, preferences.dateFormat)}`}
              size="small"
              onDelete={() => handleFilterChange('dateFrom', null)}
            />
          )}

          {filters.dateTo && (
            <Chip
              label={`To: ${formatDateUtil(filters.dateTo, preferences.dateFormat)}`}
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

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: 'Transfer completed successfully',
            severity: 'success',
          });
          fetchTransactionsData();
        }}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: 'Transactions imported successfully',
            severity: 'success',
          });
          fetchTransactionsData();
        }}
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
