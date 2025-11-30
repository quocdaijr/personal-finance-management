import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil } from '../../utils/formatters';

const AccountCard = ({ account, onEdit, onDelete, onSetDefault }) => {
  const { preferences } = useUserPreferences();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  // Handle menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle edit
  const handleEdit = () => {
    handleClose();
    onEdit(account);
  };
  
  // Handle delete
  const handleDelete = () => {
    handleClose();
    onDelete(account);
  };
  
  // Handle set as default
  const handleSetDefault = () => {
    handleClose();
    onSetDefault(account);
  };
  
  // Get account icon based on type
  const getAccountIcon = () => {
    switch (account.type) {
      case 'checking':
        return <AccountBalanceIcon fontSize="large" />;
      case 'savings':
        return <SavingsIcon fontSize="large" />;
      case 'credit':
        return <CreditCardIcon fontSize="large" />;
      case 'investment':
        return <ShowChartIcon fontSize="large" />;
      case 'cash':
        return <PaymentsIcon fontSize="large" />;
      default:
        return <AccountBalanceIcon fontSize="large" />;
    }
  };
  
  // Get account type label
  const getAccountTypeLabel = () => {
    const types = {
      checking: 'Checking Account',
      savings: 'Savings Account',
      credit: 'Credit Card',
      investment: 'Investment Account',
      cash: 'Cash',
      other: 'Other'
    };
    
    return types[account.type] || 'Account';
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        {/* Account icon */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 2 
        }}>
          <Box sx={{ 
            backgroundColor: 'primary.light', 
            color: 'primary.main',
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getAccountIcon()}
          </Box>
          
          <Box>
            {account.isDefault && (
              <Chip 
                icon={<StarIcon />} 
                label="Default" 
                size="small" 
                color="primary"
                sx={{ mb: 1 }}
              />
            )}
            
            <IconButton
              aria-label="account-menu"
              aria-controls="account-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'account-menu-button',
              }}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              
              {!account.isDefault && (
                <MenuItem onClick={handleSetDefault}>
                  <ListItemIcon>
                    <StarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Set as Default</ListItemText>
                </MenuItem>
              )}
              
              {!account.isDefault && (
                <MenuItem onClick={handleDelete}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        
        {/* Account details */}
        <Typography variant="h6" component="div" gutterBottom>
          {account.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getAccountTypeLabel()}
        </Typography>
        
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            mt: 2,
            color: account.balance >= 0 ? 'success.main' : 'error.main' 
          }}
        >
          {formatCurrency(account.balance, account.currency)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
