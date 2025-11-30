import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil } from '../../utils/formatters';

const BudgetProgress = ({ budgets, onAddBudget, onViewBudget }) => {
  const { preferences } = useUserPreferences();

  // Format currency
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'primary';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Budget Progress
          </Typography>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={onAddBudget}
          >
            Add Budget
          </Button>
        </Box>

        {budgets.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No budgets found. Create your first budget to track your spending.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {budgets.map((budget, index) => {
              const percentage = budget.getPercentageSpent();
              const progressColor = getProgressColor(percentage);

              return (
                <React.Fragment key={budget.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    alignItems="flex-start"
                    button
                    onClick={() => onViewBudget && onViewBudget(budget)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography component="span" variant="body1">
                            {budget.name}
                          </Typography>
                          <Typography component="span" variant="body1">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box component="div" sx={{ mt: 1 }}>
                          <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {budget.category}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color={percentage >= 100 ? 'error.main' : 'text.secondary'}
                            >
                              {percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, percentage)}
                            color={progressColor}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {formatCurrency(budget.getRemainingAmount())} remaining
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
