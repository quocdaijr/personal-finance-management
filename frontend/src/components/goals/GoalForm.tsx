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
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { getCurrencySymbol } from '../../utils/formatters';

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  goal?: any;
  isEditing?: boolean;
}

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Vacation',
  'Car',
  'Home',
  'Education',
  'Retirement',
  'Wedding',
  'Investment',
  'Debt Payoff',
  'Technology',
  'Health',
  'Other',
];

const GOAL_ICONS = ['🎯', '🏖️', '🚗', '🏠', '📚', '💼', '💒', '📈', '💳', '💻', '🏥', '⭐'];

const GoalForm: React.FC<GoalFormProps> = ({ open, onClose, onSave, goal, isEditing }) => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    category: 'Other',
    icon: '🎯',
    color: '#C8EE44',
    target_date: '',
    priority: 0,
  });

  useEffect(() => {
    if (goal && isEditing) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        target_amount: goal.target_amount?.toString() || '',
        current_amount: goal.current_amount?.toString() || '',
        category: goal.category || 'Other',
        icon: goal.icon || '🎯',
        color: goal.color || '#C8EE44',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        priority: goal.priority || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        current_amount: '0',
        category: 'Other',
        icon: '🎯',
        color: '#C8EE44',
        target_date: '',
        priority: 0,
      });
    }
  }, [goal, isEditing, open]);

  const handleChange = (field: string) => (e: any) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      description: formData.description,
      target_amount: parseFloat(formData.target_amount) || 0,
      current_amount: parseFloat(formData.current_amount) || 0,
      category: formData.category,
      icon: formData.icon,
      color: formData.color,
      target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
      priority: formData.priority,
    };
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                value={formData.target_amount}
                onChange={handleChange('target_amount')}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(preferences.currency)}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Current Amount"
                type="number"
                value={formData.current_amount}
                onChange={handleChange('current_amount')}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={handleChange('category')}>
                  {GOAL_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={formData.priority} label="Priority" onChange={handleChange('priority')}>
                  <MenuItem value={0}>Low</MenuItem>
                  <MenuItem value={1}>Medium</MenuItem>
                  <MenuItem value={2}>High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Target Date"
                type="date"
                value={formData.target_date}
                onChange={handleChange('target_date')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select value={formData.icon} label="Icon" onChange={handleChange('icon')}>
                  {GOAL_ICONS.map((icon) => (
                    <MenuItem key={icon} value={icon}>{icon}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.target_amount}>
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalForm;

