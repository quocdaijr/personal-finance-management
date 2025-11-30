import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface ContributeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => void;
  goal: any;
}

const ContributeDialog: React.FC<ContributeDialogProps> = ({ open, onClose, onSubmit, goal }) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'add' | 'subtract'>('add');

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    const finalAmount = type === 'add' ? value : -value;
    onSubmit(finalAmount, description);
    setAmount('');
    setDescription('');
    setType('add');
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setType('add');
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (!goal) return null;

  const previewAmount = parseFloat(amount) || 0;
  const newAmount = type === 'add' 
    ? goal.current_amount + previewAmount 
    : Math.max(0, goal.current_amount - previewAmount);
  const newProgress = (newAmount / goal.target_amount) * 100;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: goal.color || '#C8EE44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              fontSize: '1.2rem',
            }}
          >
            {goal.icon || '🎯'}
          </Box>
          <Box>
            <Typography variant="h6">{goal.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Add or withdraw from this goal
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Current Progress */}
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: theme.background.secondary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Current Progress</Typography>
              <Typography variant="body2" fontWeight={600}>{goal.progress_percent.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(goal.progress_percent, 100)}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{formatCurrency(goal.current_amount)}</Typography>
              <Typography variant="body2" color="text.secondary">of {formatCurrency(goal.target_amount)}</Typography>
            </Box>
          </Box>

          {/* Add/Subtract Toggle */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(_, value) => value && setType(value)}
              aria-label="contribution type"
            >
              <ToggleButton value="add" color="success">
                <AddIcon sx={{ mr: 1 }} /> Add
              </ToggleButton>
              <ToggleButton value="subtract" color="error">
                <RemoveIcon sx={{ mr: 1 }} /> Withdraw
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Amount Input */}
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />

          {/* Description Input */}
          <TextField
            fullWidth
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Monthly savings"
            sx={{ mb: 3 }}
          />

          {/* Preview */}
          {previewAmount > 0 && (
            <Box sx={{ p: 2, borderRadius: 2, background: theme.background.secondary }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                After {type === 'add' ? 'adding' : 'withdrawing'}:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" fontWeight={600}>New Balance</Typography>
                <Typography variant="body1" fontWeight={600} color={type === 'add' ? 'success.main' : 'warning.main'}>
                  {formatCurrency(newAmount)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(newProgress, 100)}
                color={newProgress >= 100 ? 'success' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {newProgress.toFixed(1)}% of goal
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={type === 'add' ? 'success' : 'warning'}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {type === 'add' ? 'Add Funds' : 'Withdraw Funds'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContributeDialog;

