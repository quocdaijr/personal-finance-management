import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { TrendingUp as IncomeIcon, TrendingDown as ExpenseIcon } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { getCurrencySymbol } from '../../utils/formatters';
import accountService from '../../services/accountService';

interface RecurringTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item?: any;
  isEditing?: boolean;
}

const CATEGORIES = [
  'Salary', 'Rent', 'Utilities', 'Insurance', 'Subscription', 'Loan Payment',
  'Investment', 'Groceries', 'Transportation', 'Entertainment', 'Other',
];

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  open, onClose, onSave, item, isEditing,
}) => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();
  const [accounts, setAccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'Other',
    accountId: '',
    frequency: 'monthly',
    interval: '1',
    dayOfMonth: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxRuns: '',
  });

  useEffect(() => {
    if (open) {
      loadAccounts();
    }
  }, [open]);

  useEffect(() => {
    if (item && isEditing) {
      setFormData({
        type: item.type || 'expense',
        amount: item.amount?.toString() || '',
        description: item.description || '',
        category: item.category || 'Other',
        accountId: item.accountId?.toString() || '',
        frequency: item.frequency || 'monthly',
        interval: item.interval?.toString() || '1',
        dayOfMonth: item.dayOfMonth?.toString() || '1',
        startDate: item.startDate ? item.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: item.endDate ? item.endDate.split('T')[0] : '',
        maxRuns: item.maxRuns?.toString() || '',
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: 'Other',
        accountId: accounts[0]?.id?.toString() || '',
        frequency: 'monthly',
        interval: '1',
        dayOfMonth: '1',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        maxRuns: '',
      });
    }
  }, [item, isEditing, open, accounts]);

  const loadAccounts = async () => {
    try {
      const data = await accountService.getAll();
      setAccounts(data || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  };

  const handleChange = (field: string) => (e: any) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTypeChange = (_: any, value: string | null) => {
    if (value) setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = () => {
    const data = {
      type: formData.type,
      amount: parseFloat(formData.amount) || 0,
      description: formData.description,
      category: formData.category,
      accountId: parseInt(formData.accountId) || 0,
      frequency: formData.frequency,
      interval: parseInt(formData.interval) || 1,
      dayOfMonth: formData.frequency === 'monthly' ? parseInt(formData.dayOfMonth) || 1 : null,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      maxRuns: formData.maxRuns ? parseInt(formData.maxRuns) : null,
    };
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Type Toggle */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <ToggleButtonGroup value={formData.type} exclusive onChange={handleTypeChange}>
                  <ToggleButton value="income" color="success">
                    <IncomeIcon sx={{ mr: 1 }} /> Income
                  </ToggleButton>
                  <ToggleButton value="expense" color="error">
                    <ExpenseIcon sx={{ mr: 1 }} /> Expense
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Description" value={formData.description} onChange={handleChange('description')} required />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth label="Amount" type="number" value={formData.amount} onChange={handleChange('amount')} required
                InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(preferences.currency)}</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select value={formData.accountId} label="Account" onChange={handleChange('accountId')}>
                  {accounts.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id.toString()}>{acc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={handleChange('category')}>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select value={formData.frequency} label="Frequency" onChange={handleChange('frequency')}>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Interval" type="number" value={formData.interval} onChange={handleChange('interval')} helperText="e.g., 2 = every 2 months" />
            </Grid>

            {formData.frequency === 'monthly' && (
              <Grid item xs={6}>
                <TextField fullWidth label="Day of Month" type="number" value={formData.dayOfMonth} onChange={handleChange('dayOfMonth')} inputProps={{ min: 1, max: 31 }} />
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField fullWidth label="Start Date" type="date" value={formData.startDate} onChange={handleChange('startDate')} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="End Date (Optional)" type="date" value={formData.endDate} onChange={handleChange('endDate')} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Max Runs (Optional)" type="number" value={formData.maxRuns} onChange={handleChange('maxRuns')} helperText="Leave empty for unlimited" />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.description || !formData.amount || !formData.accountId}>
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringTransactionForm;

