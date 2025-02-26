import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Import components
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import { PageLayout } from '../components/layout';

// Import services
import accountService from '../services/accountService';

// Import contexts
import { useTheme } from '../contexts/ThemeContext';

const Accounts = () => {
  const { theme } = useTheme();

  // State for data
  const [accounts, setAccounts] = useState([]);
  const [accountSummary, setAccountSummary] = useState({
    totalAccounts: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  });
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAccountsData();
  }, []);
  
  // Fetch accounts data
  const fetchAccountsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data in parallel
      const [fetchedAccounts, summary] = await Promise.all([
        accountService.getAll(),
        accountService.getSummary()
      ]);
      
      // Update state with fetched data
      setAccounts(fetchedAccounts);
      setAccountSummary(summary);
    } catch (err) {
      console.error('Error fetching accounts data:', err);
      setError('Failed to load accounts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Handle account form open
  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountFormOpen(true);
  };
  
  // Handle account edit
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountFormOpen(true);
  };
  
  // Handle account delete dialog open
  const handleDeleteDialogOpen = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };
  
  // Handle account delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };
  
  // Handle account delete confirmation
  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    
    try {
      await accountService.delete(accountToDelete.id);
      
      // Update accounts list
      setAccounts(prev => prev.filter(a => a.id !== accountToDelete.id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Account deleted successfully',
        severity: 'success'
      });
      
      // Refresh accounts data to update summary
      fetchAccountsData();
    } catch (err) {
      console.error('Error deleting account:', err);
      
      // Show error message
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete account',
        severity: 'error'
      });
    } finally {
      handleDeleteDialogClose();
    }
  };
  
  // Handle set account as default
  const handleSetDefaultAccount = async (account) => {
    try {
      await accountService.update(account.id, { ...account, isDefault: true });
      
      // Update accounts list
      setAccounts(prev => prev.map(a => ({
        ...a,
        isDefault: a.id === account.id
      })));
      
      // Show success message
      setSnackbar({
        open: true,
        message: `${account.name} set as default account`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error setting default account:', err);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to set default account',
        severity: 'error'
      });
    }
  };
  
  // Handle account save
  const handleSaveAccount = async (accountData) => {
    try {
      if (editingAccount) {
        // Update existing account
        const updatedAccount = await accountService.update(editingAccount.id, accountData);
        
        // Update accounts list
        setAccounts(prev => prev.map(a => 
          a.id === editingAccount.id ? updatedAccount : a
        ));
        
        // If this account was set as default, update other accounts
        if (accountData.isDefault) {
          setAccounts(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === editingAccount.id
          })));
        }
        
        setSnackbar({
          open: true,
          message: 'Account updated successfully',
          severity: 'success'
        });
      } else {
        // Create new account
        const newAccount = await accountService.create(accountData);
        
        // Add to accounts list
        setAccounts(prev => [...prev, newAccount]);
        
        // If this account was set as default, update other accounts
        if (accountData.isDefault) {
          setAccounts(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === newAccount.id
          })));
        }
        
        setSnackbar({
          open: true,
          message: 'Account added successfully',
          severity: 'success'
        });
      }
      
      // Close form
      setAccountFormOpen(false);
      
      // Refresh accounts data to update summary
      fetchAccountsData();
    } catch (err) {
      console.error('Error saving account:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save account',
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
            onClick={fetchAccountsData}
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

        {/* Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Account
          </Button>
        </Box>
        
        {/* Financial summary */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Accounts
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {accountSummary.totalAccounts}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Assets
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {formatCurrency(accountSummary.totalAssets)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Liabilities
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {formatCurrency(accountSummary.totalLiabilities)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Net Worth
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: accountSummary.netWorth >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {formatCurrency(accountSummary.netWorth)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Accounts grid */}
        {accounts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No accounts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add your first account to get started tracking your finances.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ mt: 2 }} 
              onClick={handleAddAccount}
            >
              Add Account
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {accounts.map(account => (
              <Grid item xs={12} sm={6} md={4} key={account.id}>
                <AccountCard 
                  account={account}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteDialogOpen}
                  onSetDefault={handleSetDefaultAccount}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Account form dialog */}
      <AccountForm 
        open={accountFormOpen}
        onClose={() => setAccountFormOpen(false)}
        onSave={handleSaveAccount}
        account={editingAccount}
        isEditing={!!editingAccount}
      />
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the account "{accountToDelete?.name}"? 
            This action cannot be undone, and all transactions associated with this account will be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default Accounts;
