import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Button,
  Card,
  Chip,
} from '@mui/material';
import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  TrendingUp,
  ShoppingCart,
  LocalGasStation,
  Restaurant,
  Home,
  ExpandMore,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil } from '../../utils/formatters';

interface TransactionData {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  currency?: string;
  date: string;
  time: string;
  category: string;
  icon?: React.ReactNode;
  avatar?: string;
  merchant?: string;
}

interface RecentTransactionsProps {
  transactions?: TransactionData[];
  onViewAll?: () => void;
  onTransactionClick?: (transaction: TransactionData) => void;
  onMoreClick?: () => void;
  maxItems?: number;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions = [],
  onViewAll,
  onTransactionClick,
  onMoreClick,
  maxItems = 5,
}) => {
  const { theme, isDarkMode } = useTheme();
  const { preferences } = useUserPreferences();
  // Default transactions data matching Figma design
  const defaultTransactions: TransactionData[] = [
    {
      id: '1',
      type: 'income',
      description: 'Salary Payment',
      amount: 5200.00,
      currency: 'USD',
      date: 'Today',
      time: '09:30 AM',
      category: 'Salary',
      merchant: 'Tech Corp Inc.',
      icon: <TrendingUp />,
    },
    {
      id: '2',
      type: 'expense',
      description: 'Grocery Shopping',
      amount: 127.50,
      currency: 'USD',
      date: 'Yesterday',
      time: '02:15 PM',
      category: 'Food',
      merchant: 'Whole Foods Market',
      icon: <ShoppingCart />,
    },
    {
      id: '3',
      type: 'expense',
      description: 'Gas Station',
      amount: 65.20,
      currency: 'USD',
      date: 'Yesterday',
      time: '08:45 AM',
      category: 'Transportation',
      merchant: 'Shell Gas Station',
      icon: <LocalGasStation />,
    },
    {
      id: '4',
      type: 'expense',
      description: 'Restaurant',
      amount: 89.75,
      currency: 'USD',
      date: '2 days ago',
      time: '07:30 PM',
      category: 'Food',
      merchant: 'The Italian Place',
      icon: <Restaurant />,
    },
    {
      id: '5',
      type: 'expense',
      description: 'Rent Payment',
      amount: 1200.00,
      currency: 'USD',
      date: '3 days ago',
      time: '10:00 AM',
      category: 'Housing',
      merchant: 'Property Management',
      icon: <Home />,
    },
  ];

  const displayTransactions = transactions.length > 0 ? transactions : defaultTransactions;
  const limitedTransactions = displayTransactions.slice(0, maxItems);

  // Format currency
  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  // Get transaction icon color
  const getIconColor = (type: 'income' | 'expense') => {
    return type === 'income' ? '#4CAF50' : '#E53935';
  };

  // Get transaction icon background
  const getIconBackground = (type: 'income' | 'expense') => {
    return type === 'income' ? alpha('#4CAF50', 0.1) : alpha('#E53935', 0.1);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Salary': '#4CAF50',
      'Food': '#FF9800',
      'Transportation': '#2196F3',
      'Housing': '#9C27B0',
      'Entertainment': '#E91E63',
      'Shopping': '#FF5722',
      'Healthcare': '#00BCD4',
      'Utilities': '#795548',
    };
    return colors[category] || '#78778B';
  };

  return (
    <Card
      sx={{
        background: theme.card.background,
        border: `1px solid ${theme.card.border}`,
        borderRadius: 2.5,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          pb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.text.primary,
            fontWeight: 600,
            fontSize: '1.125rem',
          }}
        >
          Recent Transactions
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* View All Button */}
          <Button
            variant="text"
            size="small"
            endIcon={<ExpandMore />}
            onClick={onViewAll}
            sx={{
              color: '#C8EE44',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: alpha('#C8EE44', 0.1),
              },
            }}
          >
            View All
          </Button>
        </Box>
      </Box>

      {/* Transaction Index Headers */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1,
          backgroundColor: alpha(theme.background.secondary, 0.5),
          borderTop: `1px solid ${alpha(theme.text.primary, 0.05)}`,
          borderBottom: `1px solid ${alpha(theme.text.primary, 0.05)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Description
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Amount
        </Typography>
      </Box>

      {/* Transactions List */}
      <Box>
        {limitedTransactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <Box
              onClick={() => onTransactionClick?.(transaction)}
              sx={{
                p: 3,
                cursor: onTransactionClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.background.secondary, 0.3),
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left Section - Icon and Details */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Transaction Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: getIconBackground(transaction.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpward sx={{ color: getIconColor(transaction.type), fontSize: 24 }} />
                    ) : (
                      <ArrowDownward sx={{ color: getIconColor(transaction.type), fontSize: 24 }} />
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.text.primary,
                        fontWeight: 500,
                        fontSize: '1rem',
                        mb: 0.5,
                      }}
                    >
                      {transaction.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.text.secondary,
                          fontSize: '0.875rem',
                        }}
                      >
                        {transaction.merchant} • {transaction.date} at {transaction.time}
                      </Typography>
                      <Chip
                        label={transaction.category}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: alpha(getCategoryColor(transaction.category), 0.1),
                          color: getCategoryColor(transaction.category),
                          border: `1px solid ${alpha(getCategoryColor(transaction.category), 0.2)}`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Right Section - Amount and Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: getIconColor(transaction.type),
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount, transaction.currency)}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreClick?.();
                    }}
                    sx={{
                      color: alpha('#1B212D', 0.6),
                      '&:hover': {
                        backgroundColor: alpha('#1B212D', 0.05),
                        color: alpha('#1B212D', 0.8),
                      },
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Divider between items */}
            {index < limitedTransactions.length - 1 && (
              <Divider
                sx={{
                  borderColor: alpha('#1B212D', 0.05),
                  mx: 3,
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Empty State */}
        {limitedTransactions.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha('#1B212D', 0.6),
                mb: 2,
              }}
            >
              No recent transactions found
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{
                color: '#C8EE44',
                borderColor: alpha('#C8EE44', 0.3),
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#C8EE44',
                  backgroundColor: alpha('#C8EE44', 0.1),
                },
              }}
            >
              Add Transaction
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer Summary */}
      {limitedTransactions.length > 0 && (
        <Box
          sx={{
            p: 3,
            pt: 2,
            borderTop: `1px solid ${alpha('#1B212D', 0.05)}`,
            backgroundColor: alpha('#F8F8F8', 0.3),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha('#1B212D', 0.6),
                fontSize: '0.875rem',
              }}
            >
              Showing {limitedTransactions.length} of {displayTransactions.length} transactions
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: alpha('#1B212D', 0.6),
                fontSize: '0.875rem',
              }}
            >
              Total: {formatCurrency(
                limitedTransactions.reduce((sum, transaction) => {
                  return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
                }, 0)
              )}
            </Typography>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default RecentTransactions;
