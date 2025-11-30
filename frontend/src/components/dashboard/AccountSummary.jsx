import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil } from '../../utils/formatters';

const AccountSummary = ({ accounts, onAddAccount, onViewAccount }) => {
  const { preferences } = useUserPreferences();
  // Get account type label
  const getAccountTypeLabel = (type) => {
    const types = {
      checking: 'Checking',
      savings: 'Savings',
      credit: 'Credit Card',
      investment: 'Investment',
      cash: 'Cash',
      other: 'Other'
    };
    
    return types[type] || 'Account';
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Accounts
          </Typography>
          <Button 
            startIcon={<AddIcon />} 
            size="small" 
            onClick={onAddAccount}
          >
            Add Account
          </Button>
        </Box>
        
        {accounts.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No accounts found. Add your first account to get started.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {accounts.map((account, index) => (
              <React.Fragment key={account.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem 
                  alignItems="flex-start" 
                  button 
                  onClick={() => onViewAccount && onViewAccount(account)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography component="span" variant="body1">
                          {account.name}
                          {account.isDefault && (
                            <Chip 
                              label="Default" 
                              size="small" 
                              color="primary"
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Typography>
                        <Typography 
                          component="span" 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: account.balance >= 0 ? 'success.main' : 'error.main' 
                          }}
                        >
                          {formatCurrency(account.balance, account.currency)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography component="span" variant="body2" color="text.secondary">
                        {getAccountTypeLabel(account.type)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
