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
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import accountService from '../../services/accountService';

const AccountForm = ({ open, onClose, onSave, account = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'USD',
    isDefault: false
  });
  
  const [accountTypes, setAccountTypes] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Load account types on component mount
  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        const types = await accountService.getAccountTypes();
        setAccountTypes(types);
      } catch (error) {
        console.error('Error fetching account types:', error);
      }
    };
    
    fetchAccountTypes();
  }, []);
  
  // Populate form when editing
  useEffect(() => {
    if (isEditing && account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        isDefault: account.isDefault
      });
    }
  }, [isEditing, account]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'isDefault' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }
    
    if (formData.balance === '') {
      newErrors.balance = 'Balance is required';
    } else if (isNaN(formData.balance)) {
      newErrors.balance = 'Balance must be a number';
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
    const accountData = {
      ...formData,
      balance: parseFloat(formData.balance)
    };
    
    onSave(accountData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Account' : 'Add New Account'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Account Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!errors.type}>
                <InputLabel id="account-type-label">Account Type</InputLabel>
                <Select
                  labelId="account-type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Account Type"
                >
                  {accountTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="balance"
                label="Current Balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleChange}
                error={!!errors.balance}
                helperText={errors.balance}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                  <MenuItem value="CAD">CAD ($)</MenuItem>
                  <MenuItem value="AUD">AUD ($)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={handleChange}
                    name="isDefault"
                  />
                }
                label="Set as default account"
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountForm;
