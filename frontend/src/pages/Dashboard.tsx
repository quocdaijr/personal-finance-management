import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Savings,
  Add,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layout';
import {
  SummaryCard,
  WalletSection,
  ScheduledTransfers,
  FinancialChart,
  RecentTransactions,
} from '../components/dashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Mock financial data - in real app this would come from API
  const financialData = {
    totalBalance: 25420.50,
    totalSpending: 3240.75,
    totalSaved: 8950.25,
    monthlyIncome: 12500.00,
  };

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={true}
      onSearchChange={(value) => console.log('Search:', value)}
    >
      {/* Main Dashboard Layout - Three Column Layout matching Figma exactly */}
        <Box sx={{
          display: { xs: 'block', xl: 'flex' },
          gap: { xl: 4 },
          mb: 4
        }}>
          {/* Left Column - Wallet & Scheduled Transfers */}
          <Box sx={{
            width: { xs: '100%', xl: 354 },
            flexShrink: 0,
            mb: { xs: 4, xl: 0 }
          }}>
            {/* Wallet Section */}
            <Box sx={{ mb: 4 }}>
              <WalletSection
                onAddCard={() => console.log('Add card clicked')}
                onCardClick={(card) => console.log('Card clicked:', card)}
                onMoreClick={() => console.log('More clicked')}
              />
            </Box>

            {/* Scheduled Transfers */}
            <ScheduledTransfers
              onViewAll={() => console.log('View all transfers')}
              onTransferClick={(transfer) => console.log('Transfer clicked:', transfer)}
              onMoreClick={() => console.log('More options')}
            />
          </Box>

          {/* Center Column - Summary Cards, Graph, Recent Transactions */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            mb: { xs: 4, xl: 0 }
          }}>
            {/* Financial Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Total Balance"
                  value={`$${financialData.totalBalance.toLocaleString()}`}
                  subtitle="All accounts"
                  icon={<AccountBalanceWallet />}
                  color="primary"
                  variant="gradient"
                  trendValue="+2.5%"
                  trend="up"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Total Spending"
                  value={`$${financialData.totalSpending.toLocaleString()}`}
                  subtitle="This month"
                  icon={<TrendingDown />}
                  color="error"
                  variant="outlined"
                  trendValue="-12.3%"
                  trend="down"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Total Saved"
                  value={`$${financialData.totalSaved.toLocaleString()}`}
                  subtitle="This month"
                  icon={<Savings />}
                  color="success"
                  variant="outlined"
                  trendValue="+8.1%"
                  trend="up"
                />
              </Grid>
            </Grid>

            {/* Financial Chart */}
            <Box sx={{ mb: 4 }}>
              <FinancialChart height={291} />
            </Box>

            {/* Recent Transactions */}
            <RecentTransactions
              onViewAll={() => console.log('View all transactions')}
              onTransactionClick={(transaction) => console.log('Transaction clicked:', transaction)}
              onMoreClick={() => console.log('More options')}
              maxItems={5}
            />
          </Box>

          {/* Right Column - Additional Widgets (matching Figma) */}
          <Box sx={{
            width: { xs: '100%', xl: 354 },
            flexShrink: 0,
            display: { xs: 'none', xl: 'block' }
          }}>
            {/* Quick Actions Widget */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.text.primary,
                      fontWeight: 600,
                      fontSize: '1.125rem',
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    sx={{
                      color: '#C8EE44',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    Add
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { title: 'Send Money', subtitle: 'Transfer to contacts' },
                    { title: 'Pay Bills', subtitle: 'Utilities & services' },
                    { title: 'Add Transaction', subtitle: 'Manual entry' },
                    { title: 'View Reports', subtitle: 'Financial insights' },
                  ].map((action, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        background: theme.background.secondary,
                        borderRadius: 2,
                        border: `1px solid ${theme.border.primary}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          background: theme.background.paper,
                          transform: 'translateY(-1px)',
                          boxShadow: theme.card.hoverShadow,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.text.primary,
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.text.secondary,
                          fontSize: '0.75rem',
                        }}
                      >
                        {action.subtitle}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Recent Activity Widget */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.text.primary,
                      fontWeight: 600,
                      fontSize: '1.125rem',
                    }}
                  >
                    Recent Activity
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<MoreVert />}
                    sx={{
                      color: theme.text.secondary,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      minWidth: 'auto',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { action: 'Card payment received', time: '2 hours ago', amount: '+$1,250', type: 'income' },
                    { action: 'Transfer to savings', time: '1 day ago', amount: '-$500', type: 'expense' },
                    { action: 'Grocery shopping', time: '2 days ago', amount: '-$85.50', type: 'expense' },
                    { action: 'Salary deposit', time: '3 days ago', amount: '+$3,200', type: 'income' },
                  ].map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        background: theme.background.secondary,
                        borderRadius: 2,
                        border: `1px solid ${theme.border.primary}`,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.text.primary,
                            fontWeight: 500,
                            mb: 0.5,
                          }}
                        >
                          {activity.action}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.text.secondary,
                            fontSize: '0.75rem',
                          }}
                        >
                          {activity.time}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: activity.type === 'income' ? '#4CAF50' : '#E53935',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        {activity.amount}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
    </PageLayout>
  );
};

export default Dashboard;
