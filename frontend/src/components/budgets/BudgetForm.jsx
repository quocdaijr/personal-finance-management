import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import transactionService from '../../services/transactionService';
import budgetService from '../../services/budgetService';

const BudgetForm = ({ open, onClose, onSave, budget = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    spent: '0',
    category: '',
    period: 'monthly',
    startDate: new Date()
  });
  
  const [categories, setCategories] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedPeriods] = await Promise.all([
          transactionService.getCategories(),
          budgetService.getBudgetPeriods()
        ]);
        
        setCategories(fetchedCategories);
        setPeriods(fetchedPeriods);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Populate form when editing
  useEffect(() => {
    if (isEditing && budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount,
        spent: budget.spent,
        category: budget.category,
        period: budget.period,
        startDate: new Date(budget.startDate)
      });
    }
  }, [isEditing, budget]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      startDate: date
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Budget amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Budget amount must be a positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.period) {
      newErrors.period = 'Period is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for saving
    const budgetData = {
      ...formData,
      amount: parseFloat(formData.amount),
      spent: parseFloat(formData.spent)
    };
    
    onSave(budgetData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Budget Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="amount"
                label="Budget Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            {isEditing && (
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="spent"
                  label="Amount Spent"
                  name="spent"
                  type="number"
                  value={formData.spent}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!errors.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!errors.period}>
                <InputLabel id="period-label">Budget Period</InputLabel>
                <Select
                  labelId="period-label"
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  label="Budget Period"
                >
                  {periods.map(period => (
                    <MenuItem key={period.id} value={period.id}>
                      {period.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.period && <FormHelperText>{errors.period}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      margin="normal" 
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetForm;
