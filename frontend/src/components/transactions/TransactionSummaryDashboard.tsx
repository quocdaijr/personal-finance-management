import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  SwapHoriz,
  Category,
  CalendarToday,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil } from '../../utils/formatters';
import { TransactionSummaryDashboardProps, TimePeriod } from '../../types/transaction';

const TransactionSummaryDashboard: React.FC<TransactionSummaryDashboardProps> = ({
  summary,
  period,
  onPeriodChange,
  loading = false,
}) => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();

  const timePeriods: TimePeriod[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getSummaryCards = () => [
    {
      title: 'Total Balance',
      value: formatCurrency(summary.balance),
      subtitle: `${summary.count} transactions`,
      icon: <AccountBalanceWallet />,
      color: summary.balance >= 0 ? '#4CAF50' : '#E53935',
      trend: summary.balance >= 0 ? 'up' : 'down',
    },
    {
      title: 'Total Income',
      value: formatCurrency(summary.income),
      subtitle: `${summary.incomeTransactions} transactions`,
      icon: <TrendingUp />,
      color: '#4CAF50',
      trend: 'up',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.expenses),
      subtitle: `${summary.expenseTransactions} transactions`,
      icon: <TrendingDown />,
      color: '#E53935',
      trend: 'down',
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(summary.avgTransaction),
      subtitle: 'Per transaction',
      icon: <SwapHoriz />,
      color: theme.text.primary,
      trend: 'neutral',
    },
  ];

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              background: theme.card.background,
              border: `1px solid ${theme.card.border}`,
              borderRadius: 2.5,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: 1 }} />
        </Box>
        <LoadingSkeleton />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with period selector */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.text.primary,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CalendarToday fontSize="small" />
          Transaction Summary
        </Typography>

        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{
            '& .MuiButton-root': {
              borderColor: theme.border.primary,
              color: theme.text.secondary,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#C8EE44',
                backgroundColor: 'rgba(200, 238, 68, 0.1)',
              },
              '&.Mui-selected': {
                backgroundColor: '#C8EE44',
                color: '#1B212D',
                borderColor: '#C8EE44',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#B8DE34',
                  borderColor: '#B8DE34',
                },
              },
            },
          }}
        >
          {timePeriods.map((timePeriod) => (
            <Button
              key={timePeriod.value}
              onClick={() => onPeriodChange(timePeriod.value)}
              className={period === timePeriod.value ? 'Mui-selected' : ''}
            >
              {timePeriod.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3}>
        {getSummaryCards().map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: theme.card.background,
                border: `1px solid ${theme.card.border}`,
                borderRadius: 2.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.card.hoverShadow,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Icon and trend */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: `${card.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  
                  {card.trend !== 'neutral' && (
                    <Chip
                      size="small"
                      label={card.trend === 'up' ? 'Income' : 'Expense'}
                      sx={{
                        backgroundColor: card.trend === 'up' ? '#E8F5E8' : '#FFEBEE',
                        color: card.trend === 'up' ? '#2E7D32' : '#C62828',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                      }}
                    />
                  )}
                </Box>

                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.text.secondary,
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>

                {/* Value */}
                <Typography
                  variant="h5"
                  sx={{
                    color: theme.text.primary,
                    fontWeight: 700,
                    mb: 1,
                    fontSize: '1.5rem',
                  }}
                >
                  {card.value}
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.text.secondary,
                    fontSize: '0.75rem',
                  }}
                >
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional insights */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: theme.background.secondary,
          borderRadius: 2,
          border: `1px solid ${theme.border.primary}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.text.secondary,
            textAlign: 'center',
          }}
        >
          Showing data for the selected {period} period • 
          {summary.balance >= 0 ? ' Positive cash flow' : ' Negative cash flow'} • 
          {summary.incomeTransactions > summary.expenseTransactions 
            ? ' More income transactions' 
            : ' More expense transactions'}
        </Typography>
      </Box>
    </Box>
  );
};

export default TransactionSummaryDashboard;
