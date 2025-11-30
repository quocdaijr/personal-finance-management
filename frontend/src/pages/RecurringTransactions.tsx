import React, { useState, useEffect } from 'react';
import {
  Box,
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
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Repeat as RepeatIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Schedule as ScheduleIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from '@mui/icons-material';

import { PageLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import recurringTransactionService from '../services/recurringTransactionService';
import RecurringTransactionForm from '../components/recurring/RecurringTransactionForm';
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil } from '../utils/formatters';

interface RecurringTransaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  type: string;
  accountId: number;
  accountName: string;
  tags: string[];
  frequency: string;
  interval: number;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  lastRunDate: string | null;
  isActive: boolean;
  totalRuns: number;
  maxRuns: number | null;
}

const RecurringTransactions: React.FC = () => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();

  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RecurringTransaction | null>(null);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringTransactionService.getAll();
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching recurring transactions:', err);
      setError('Failed to load recurring transactions.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString, preferences.dateFormat);
  };

  const getFrequencyLabel = (freq: string, interval: number) => {
    const labels: Record<string, string> = {
      daily: interval === 1 ? 'Daily' : `Every ${interval} days`,
      weekly: interval === 1 ? 'Weekly' : `Every ${interval} weeks`,
      monthly: interval === 1 ? 'Monthly' : `Every ${interval} months`,
      yearly: interval === 1 ? 'Yearly' : `Every ${interval} years`,
    };
    return labels[freq] || freq;
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item: RecurringTransaction) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await recurringTransactionService.delete(itemToDelete.id);
      setTransactions((prev) => prev.filter((t) => t.id !== itemToDelete.id));
      setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await recurringTransactionService.toggleActive(item.id, !item.isActive);
      setTransactions((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isActive: !t.isActive } : t))
      );
      setSnackbar({
        open: true,
        message: item.isActive ? 'Paused' : 'Activated',
        severity: 'success',
      });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
    }
  };

  const handleRunNow = async (item: RecurringTransaction) => {
    try {
      await recurringTransactionService.runNow(item.id);
      setSnackbar({ open: true, message: 'Transaction created', severity: 'success' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Failed to run', severity: 'error' });
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await recurringTransactionService.update(editingItem.id, data);
        setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' });
      } else {
        await recurringTransactionService.create(data);
        setSnackbar({ open: true, message: 'Created successfully', severity: 'success' });
      }
      setFormOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save', severity: 'error' });
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'active') return t.isActive;
    if (filter === 'paused') return !t.isActive;
    if (filter === 'income') return t.type === 'income';
    if (filter === 'expense') return t.type === 'expense';
    return true;
  });

  // Summary stats
  const activeCount = transactions.filter((t) => t.isActive).length;
  const totalMonthlyIncome = transactions
    .filter((t) => t.isActive && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyExpense = transactions
    .filter((t) => t.isActive && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <PageLayout maxWidth="xl" showSearch={false} customTitle="Recurring Transactions">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="xl" showSearch={false} customTitle="Recurring Transactions">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchData}>Retry</Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl" showSearch={false} customTitle="Recurring Transactions">
      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ borderRadius: 2, px: 3, py: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Add Recurring
        </Button>
      </Box>

      {/* Summary */}
      <Paper sx={{ p: 3, mb: 4, background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Active Recurring</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{activeCount}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Est. Monthly Income</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {formatCurrency(totalMonthlyIncome)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Est. Monthly Expense</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              {formatCurrency(totalMonthlyExpense)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter" onChange={(e) => setFilter(e.target.value)} size="small">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="income">Income Only</MenuItem>
            <MenuItem value="expense">Expense Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <RepeatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {transactions.length === 0 ? 'No recurring transactions' : 'No matches'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {transactions.length === 0 ? 'Set up automated transactions.' : 'Try a different filter.'}
          </Typography>
          {transactions.length === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Recurring
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTransactions.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: item.isActive ? 1 : 0.7 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: item.type === 'income' ? '#4CAF50' : '#E53935',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        {item.type === 'income' ? <IncomeIcon sx={{ color: 'white' }} /> : <ExpenseIcon sx={{ color: 'white' }} />}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{item.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={item.isActive ? 'Active' : 'Paused'}
                      color={item.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 700, color: item.type === 'income' ? 'success.main' : 'error.main', mb: 2 }}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RepeatIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {getFrequencyLabel(item.frequency, item.interval)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Next: {formatDate(item.nextRunDate)}
                    </Typography>
                  </Box>

                  {item.totalRuns > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Run {item.totalRuns} time{item.totalRuns > 1 ? 's' : ''}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title={item.isActive ? 'Pause' : 'Activate'}>
                      <Switch checked={item.isActive} onChange={() => handleToggleActive(item)} size="small" />
                    </Tooltip>
                    {item.isActive && (
                      <Tooltip title="Run Now">
                        <IconButton size="small" color="primary" onClick={() => handleRunNow(item)}>
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(item)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item)}><DeleteIcon /></IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Form Dialog */}
      <RecurringTransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        item={editingItem}
        isEditing={!!editingItem}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Recurring Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.description}"? This won't affect past transactions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default RecurringTransactions;

