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
  Box,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { SwapHoriz as TransferIcon } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import accountService from '../../services/accountService';
import transactionService from '../../services/transactionService';

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

const TransferDialog: React.FC<TransferDialogProps> = ({ open, onClose, onSuccess }) => {
  const { theme } = useTheme();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      loadAccounts();
      setError(null);
    }
  }, [open]);

  const loadAccounts = async () => {
    try {
      const data = await accountService.getAll();
      setAccounts(data || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load accounts');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fromAccountId || !formData.toAccountId) {
      setError('Please select both accounts');
      return;
    }
    if (formData.fromAccountId === formData.toAccountId) {
      setError('Cannot transfer to the same account');
      return;
    }
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const fromAccount = accounts.find((a) => a.id.toString() === formData.fromAccountId);
    if (fromAccount && amount > fromAccount.balance) {
      setError('Insufficient balance in source account');
      return;
    }

    setLoading(true);
    try {
      await transactionService.transfer({
        from_account_id: parseInt(formData.fromAccountId),
        to_account_id: parseInt(formData.toAccountId),
        amount,
        description: formData.description || 'Transfer',
        date: new Date(formData.date).toISOString(),
        tags: [],
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setError(null);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TransferIcon sx={{ mr: 1, color: 'primary.main' }} />
          Transfer Money
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* From Account */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>From Account</InputLabel>
            <Select value={formData.fromAccountId} label="From Account" onChange={handleChange('fromAccountId') as any}>
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id.toString()}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{acc.name}</span>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(acc.balance)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* To Account */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>To Account</InputLabel>
            <Select value={formData.toAccountId} label="To Account" onChange={handleChange('toAccountId') as any}>
              {accounts
                .filter((acc) => acc.id.toString() !== formData.fromAccountId)
                .map((acc) => (
                  <MenuItem key={acc.id} value={acc.id.toString()}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{acc.name}</span>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(acc.balance)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Amount */}
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={handleChange('amount')}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description (optional)"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="e.g., Move to savings"
            sx={{ mb: 2 }}
          />

          {/* Date */}
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.fromAccountId || !formData.toAccountId || !formData.amount}
          startIcon={loading ? <CircularProgress size={20} /> : <TransferIcon />}
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;

