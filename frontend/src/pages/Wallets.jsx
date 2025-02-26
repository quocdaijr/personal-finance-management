import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Add,
  AccountBalanceWallet,
  CreditCard,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import accountService from '../services/accountService';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layout';

const Wallets = () => {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showBalances, setShowBalances] = useState(true);
  const [accountTypes, setAccountTypes] = useState([]);
  
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'USD',
    isDefault: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load accounts and account types on component mount
  useEffect(() => {
    loadAccounts();
    loadAccountTypes();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await accountService.getAll();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load accounts',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccountTypes = async () => {
    try {
      const types = await accountService.getAccountTypes();
      setAccountTypes(types);
    } catch (error) {
      console.error('Error loading account types:', error);
      // Use default types if API fails
      setAccountTypes([
        { id: 'checking', name: 'Checking Account' },
        { id: 'savings', name: 'Savings Account' },
        { id: 'credit', name: 'Credit Card' },
        { id: 'investment', name: 'Investment Account' },
      ]);
    }
  };

  // Handle account creation
  const handleCreateAccount = async () => {
    try {
      const accountData = {
        ...newAccount,
        balance: parseFloat(newAccount.balance) || 0,
      };
      
      await accountService.create(accountData);
      await loadAccounts();
      
      setShowAddDialog(false);
      setNewAccount({
        name: '',
        type: 'checking',
        balance: '',
        currency: 'USD',
        isDefault: false,
      });
      
      setSnackbar({
        open: true,
        message: 'Account created successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating account:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create account',
        severity: 'error'
      });
    }
  };

  // Handle account update
  const handleUpdateAccount = async () => {
    try {
      await accountService.update(selectedAccount.id, selectedAccount);
      await loadAccounts();
      
      setShowEditDialog(false);
      setSelectedAccount(null);
      
      setSnackbar({
        open: true,
        message: 'Account updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating account:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update account',
        severity: 'error'
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (accountId) => {
    try {
      await accountService.delete(accountId);
      await loadAccounts();
      
      setSnackbar({
        open: true,
        message: 'Account deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete account',
        severity: 'error'
      });
    }
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Get account type icon
  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking':
        return <AccountBalance />;
      case 'savings':
        return <AccountBalanceWallet />;
      case 'credit':
        return <CreditCard />;
      case 'investment':
        return <TrendingUp />;
      default:
        return <AccountBalanceWallet />;
    }
  };

  // Get account type color
  const getAccountColor = (type) => {
    switch (type) {
      case 'checking':
        return '#4CAF50';
      case 'savings':
        return '#2196F3';
      case 'credit':
        return '#FF9800';
      case 'investment':
        return '#9C27B0';
      default:
        return '#C8EE44';
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <PageLayout maxWidth="xl" showSearch={false}>
        <Box sx={{ mt: 4, mb: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: theme.text.primary, textAlign: 'center' }}>
            Loading your wallets...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={false}
    >
      {/* Action Buttons */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          alignItems: 'center',
          mb: 3
        }}>
          <IconButton
            onClick={() => setShowBalances(!showBalances)}
            sx={{
              color: theme.text.secondary,
              '&:hover': {
                backgroundColor: theme.background.secondary,
              }
            }}
          >
            {showBalances ? <Visibility /> : <VisibilityOff />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
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

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Balance
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {showBalances ? `$${totalBalance.toFixed(2)}` : '••••••'}
                    </Typography>
                  </Box>
                  <AccountBalanceWallet sx={{ color: '#C8EE44', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Accounts
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {accounts.length}
                    </Typography>
                  </Box>
                  <CreditCard sx={{ color: '#4CAF50', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active Cards
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {accounts.filter(acc => acc.type === 'credit').length}
                    </Typography>
                  </Box>
                  <CreditCard sx={{ color: '#FF9800', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Investments
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {accounts.filter(acc => acc.type === 'investment').length}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ color: '#9C27B0', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Accounts List */}
        <Typography variant="h6" sx={{ color: theme.text.primary, fontWeight: 600, mb: 3 }}>
          Your Accounts
        </Typography>
        
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card
                sx={{
                  position: 'relative',
                  background: `linear-gradient(135deg, ${getAccountColor(account.type)}20, ${getAccountColor(account.type)}10)`,
                  border: `1px solid ${alpha(getAccountColor(account.type), 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha(getAccountColor(account.type), 0.2),
                          color: getAccountColor(account.type),
                        }}
                      >
                        {getAccountIcon(account.type)}
                      </Box>
                      {account.isDefault && (
                        <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                      )}
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowEditDialog(true);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {account.name}
                  </Typography>
                  
                  <Chip
                    label={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getAccountColor(account.type), 0.2),
                      color: getAccountColor(account.type),
                      mb: 2,
                    }}
                  />
                  
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {showBalances ? account.formattedBalance() : '••••••'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {account.currency}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {accounts.length === 0 && (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <AccountBalanceWallet sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                No accounts found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by adding your first financial account
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddDialog(true)}
                sx={{
                  backgroundColor: '#C8EE44',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#B8DE34',
                  },
                }}
              >
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Account Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Account Name"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value }))}
                  label="Account Type"
                >
                  {accountTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Initial Balance"
                type="number"
                value={newAccount.balance}
                onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
              />
              
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={newAccount.currency}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, currency: e.target.value }))}
                  label="Currency"
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAccount} variant="contained">Create Account</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogContent>
            {selectedAccount && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Account Name"
                  value={selectedAccount.name}
                  onChange={(e) => setSelectedAccount(prev => ({ ...prev, name: e.target.value }))}
                />
                
                <TextField
                  fullWidth
                  label="Balance"
                  type="number"
                  value={selectedAccount.balance}
                  onChange={(e) => setSelectedAccount(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => {
                      handleDeleteAccount(selectedAccount.id);
                      setShowEditDialog(false);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={selectedAccount.isDefault ? <Star /> : <StarBorder />}
                    onClick={() => setSelectedAccount(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                  >
                    {selectedAccount.isDefault ? 'Remove Default' : 'Set as Default'}
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateAccount} variant="contained">Save Changes</Button>
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

export default Wallets;
