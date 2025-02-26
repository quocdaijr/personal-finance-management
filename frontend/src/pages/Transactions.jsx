import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
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
  IconButton
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layout';

// Import components
import TransactionList from '../components/dashboard/TransactionList';
import TransactionForm from '../components/dashboard/TransactionForm';

// Import services
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';

const Transactions = () => {
  const { theme } = useTheme();

  // State for data
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    account: '',
    type: '',
    dateFrom: null,
    dateTo: null
  });

  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchTransactionsData();
  }, []);
  
  // Fetch transactions data
  const fetchTransactionsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data in parallel
      const [
        fetchedTransactions, 
        fetchedAccounts, 
        fetchedCategories
      ] = await Promise.all([
        transactionService.getAll(),
        accountService.getAll(),
        transactionService.getCategories()
      ]);
      
      // Sort transactions by date (newest first)
      const sortedTransactions = fetchedTransactions.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Update state with fetched data
      setTransactions(sortedTransactions);
      setAccounts(fetchedAccounts);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching transactions data:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date filter changes
  const handleDateChange = (name, date) => {
    setFilters(prev => ({
      ...prev,
      [name]: date
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
      dateTo: null
    });
  };
  
  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }
    
    // Account filter
    if (filters.account && transaction.accountId !== filters.account) {
      return false;
    }
    
    // Type filter
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }
    
    // Date from filter
    if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) {
      return false;
    }
    
    // Date to filter
    if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) {
      return false;
    }
    
    return true;
  });
  
  // Handle transaction form open
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionFormOpen(true);
  };
  
  // Handle transaction edit
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormOpen(true);
  };
  
  // Handle transaction delete
  const handleDeleteTransaction = async (transaction) => {
    try {
      await transactionService.delete(transaction.id);
      
      // Update transactions list
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete transaction',
        severity: 'error'
      });
    }
  };
  
  // Handle transaction save
  const handleSaveTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        // Update existing transaction
        await transactionService.update(editingTransaction.id, transactionData);
        
        // Update transactions list
        setTransactions(prev => prev.map(t => 
          t.id === editingTransaction.id 
            ? { ...t, ...transactionData, updatedAt: new Date().toISOString() }
            : t
        ));
        
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success'
        });
      } else {
        // Create new transaction
        const newTransaction = await transactionService.create(transactionData);
        
        // Add to transactions list
        setTransactions(prev => [newTransaction, ...prev]);
        
        setSnackbar({
          open: true,
          message: 'Transaction added successfully',
          severity: 'success'
        });
      }
      
      // Close form
      setTransactionFormOpen(false);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save transaction',
        severity: 'error'
      });
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Calculate summary of filtered transactions
  const calculateSummary = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    return {
      count: filteredTransactions.length,
      income,
      expenses,
      balance: income - expenses
    };
  };
  
  const summary = calculateSummary();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={fetchTransactionsData}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={false}
    >

        {/* Add Transaction Button */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 3
        }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTransaction}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Transaction
          </Button>
        </Box>
        
        {/* Search and filters */}
        <Paper sx={{
          p: 3,
          mb: 4,
          background: theme.background.paper,
          border: `1px solid ${theme.border.primary}`,
          borderRadius: 3
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="search"
                label="Search transactions"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={toggleFilters}
                sx={{ mr: 1 }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              {Object.values(filters).some(v => v !== '' && v !== null) && (
                <Button 
                  variant="text" 
                  onClick={handleClearFilters}
                >
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
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      id="category"
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="account-filter-label">Account</InputLabel>
                    <Select
                      labelId="account-filter-label"
                      id="account"
                      name="account"
                      value={filters.account}
                      onChange={handleFilterChange}
                      label="Account"
                    >
                      <MenuItem value="">All Accounts</MenuItem>
                      {accounts.map(account => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="type-filter-label">Type</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      id="type"
                      name="type"
                      value={filters.type}
                      onChange={handleFilterChange}
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
                      onChange={(date) => handleDateChange('dateFrom', date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="To Date"
                      value={filters.dateTo}
                      onChange={(date) => handleDateChange('dateTo', date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        {/* Transactions summary */}
        <Paper sx={{
          p: 3,
          mb: 4,
          background: theme.background.paper,
          border: `1px solid ${theme.border.primary}`,
          borderRadius: 3
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Transactions
              </Typography>
              <Typography variant="h6">
                {summary.count}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Income
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(summary.income)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(summary.expenses)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Balance
              </Typography>
              <Typography 
                variant="h6" 
                color={summary.balance >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(summary.balance)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Active filters */}
        {Object.values(filters).some(v => v !== '' && v !== null) && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            
            {filters.search && (
              <Chip 
                label={`Search: ${filters.search}`} 
                size="small" 
                onDelete={() => setFilters(prev => ({ ...prev, search: '' }))}
              />
            )}
            
            {filters.category && (
              <Chip 
                label={`Category: ${filters.category}`} 
                size="small" 
                onDelete={() => setFilters(prev => ({ ...prev, category: '' }))}
              />
            )}
            
            {filters.account && (
              <Chip 
                label={`Account: ${accounts.find(a => a.id === filters.account)?.name || filters.account}`} 
                size="small" 
                onDelete={() => setFilters(prev => ({ ...prev, account: '' }))}
              />
            )}
            
            {filters.type && (
              <Chip 
                label={`Type: ${filters.type === 'income' ? 'Income' : 'Expense'}`} 
                size="small" 
                onDelete={() => setFilters(prev => ({ ...prev, type: '' }))}
              />
            )}
            
            {filters.dateFrom && (
              <Chip 
                label={`From: ${new Date(filters.dateFrom).toLocaleDateString()}`} 
                size="small" 
                onDelete={() => setFilters(prev => ({ ...prev, dateFrom: null }))}
              />
            )}
            
            {filters.dateTo && (
              <Chip 
                label={`To: ${new Date(filters.dateTo).toLocaleDateString()}`} 
                size="small" 
                onDelete={() => setFilters(prev => ({ ...prev, dateTo: null }))}
              />
            )}
          </Box>
        )}
        
        {/* Transactions list */}
        {filteredTransactions.length === 0 ? (
          <Paper sx={{
            p: 4,
            textAlign: 'center',
            background: theme.background.paper,
            border: `1px solid ${theme.border.primary}`,
            borderRadius: 3
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(filters).some(v => v !== '' && v !== null)
                ? 'Try adjusting your filters or clear them to see all transactions.'
                : 'Add your first transaction to get started.'}
            </Typography>
            {Object.values(filters).some(v => v !== '' && v !== null) ? (
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }} 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            ) : (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                sx={{ mt: 2 }} 
                onClick={handleAddTransaction}
              >
                Add Transaction
              </Button>
            )}
          </Paper>
        ) : (
          <TransactionList 
            transactions={filteredTransactions} 
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            title={`${filteredTransactions.length} Transaction${filteredTransactions.length !== 1 ? 's' : ''}`}
          />
        )}

        {/* Transaction form dialog */}
        <TransactionForm
          open={transactionFormOpen}
          onClose={() => setTransactionFormOpen(false)}
          onSave={handleSaveTransaction}
          transaction={editingTransaction}
          isEditing={!!editingTransaction}
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

export default Transactions;
