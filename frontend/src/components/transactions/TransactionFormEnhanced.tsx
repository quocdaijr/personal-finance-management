import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Close,
  Add,
  AttachMoney,
  Category,
  CalendarToday,
  AccountBalance,
  SwapHoriz,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useTheme } from '../../contexts/ThemeContext';
import { Transaction, TransactionFormData, Account } from '../../types/transaction';

interface TransactionFormEnhancedProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => Promise<void>;
  transaction?: Transaction | null;
  isEditing?: boolean;
  accounts: Account[];
  categories: string[];
}

const TransactionFormEnhanced: React.FC<TransactionFormEnhancedProps> = ({
  open,
  onClose,
  onSave,
  transaction = null,
  isEditing = false,
  accounts,
  categories,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState<TransactionFormData>({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: new Date(),
    accountId: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isEditing && transaction) {
      setFormData({
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        date: new Date(transaction.date),
        accountId: transaction.accountId.toString(),
        tags: transaction.tags || [],
      });
    } else {
      // Set default account if available
      const defaultAccount = accounts.find(a => a.isDefault) || accounts[0];
      setFormData({
        amount: '',
        description: '',
        category: '',
        type: 'expense',
        date: new Date(),
        accountId: defaultAccount?.id.toString() || '',
        tags: [],
      });
    }
  }, [isEditing, transaction, accounts, open]);

  // Clear form when dialog closes
  useEffect(() => {
    if (!open) {
      setErrors({});
      setTagInput('');
      setLoading(false);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAccount = () => {
    return accounts.find(account => account.id.toString() === formData.accountId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.card.background,
          border: `1px solid ${theme.card.border}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.text.primary,
            fontWeight: 600,
          }}
        >
          {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.text.secondary,
            '&:hover': {
              backgroundColor: theme.background.secondary,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            {/* Transaction Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  label="Transaction Type"
                  startAdornment={
                    <InputAdornment position="start">
                      <SwapHoriz sx={{ color: theme.text.secondary }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: theme.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Enter transaction description..."
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={categories}
                value={formData.category}
                onChange={(_, newValue) => handleChange('category', newValue || '')}
                onInputChange={(_, newInputValue) => handleChange('category', newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    error={!!errors.category}
                    helperText={errors.category}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category sx={{ color: theme.text.secondary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Account */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.accountId}>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountId}
                  onChange={(e) => handleChange('accountId', e.target.value)}
                  label="Account"
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountBalance sx={{ color: theme.text.secondary }} />
                    </InputAdornment>
                  }
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id.toString()}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{account.name}</span>
                        <Typography variant="caption" color="text.secondary">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(account.balance)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.accountId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.accountId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(date) => handleChange('date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Tags */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddTag} size="small">
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Press Enter to add tag"
              />
            </Grid>

            {/* Display Tags */}
            {formData.tags.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, color: theme.text.secondary }}>
                  Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                      sx={{
                        backgroundColor: theme.background.secondary,
                        color: theme.text.primary,
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Account Balance Info */}
            {getSelectedAccount() && (
              <Grid item xs={12}>
                <Alert
                  severity="info"
                  sx={{
                    backgroundColor: theme.background.secondary,
                    color: theme.text.primary,
                    '& .MuiAlert-icon': {
                      color: '#2196F3',
                    },
                  }}
                >
                  Current balance in {getSelectedAccount()?.name}: {' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(getSelectedAccount()?.balance || 0)}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: theme.border.primary,
              color: theme.text.secondary,
              '&:hover': {
                borderColor: theme.text.secondary,
                backgroundColor: theme.background.secondary,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              fontWeight: 600,
              minWidth: 120,
            }}
          >
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionFormEnhanced;
