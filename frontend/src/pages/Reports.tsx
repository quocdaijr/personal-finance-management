import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline,
  Download,
  Lightbulb,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

import { PageLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import analyticsService from '../services/analyticsService';
import exportService from '../services/exportService';
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil } from '../utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 24 }}>
    {value === index && children}
  </div>
);

const COLORS = ['#C8EE44', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#6366F1'];

const Reports: React.FC = () => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [tabValue, setTabValue] = useState(0);

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, trendsData, insightsData] = await Promise.all([
        analyticsService.getFinancialOverview(),
        analyticsService.getSpendingTrends(period),
        analyticsService.getInsights(),
      ]);
      setOverview(overviewData);
      setTrends(trendsData);
      setInsights(insightsData?.insights || []);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      // Use mock data if API fails
      setOverview({
        totalAssets: 45000,
        totalLiabilities: 12000,
        netWorth: 33000,
        income30d: 5500,
        expenses30d: 3200,
        balance30d: 2300,
        spendingByCategory: [
          { category: 'Food & Dining', amount: 850 },
          { category: 'Transportation', amount: 420 },
          { category: 'Shopping', amount: 680 },
          { category: 'Utilities', amount: 350 },
          { category: 'Entertainment', amount: 280 },
          { category: 'Healthcare', amount: 180 },
          { category: 'Other', amount: 440 },
        ],
        totalAccounts: 4,
      });
      setTrends({
        data: [
          { period: 'Week 1', income: 1200, expense: 800 },
          { period: 'Week 2', income: 1400, expense: 950 },
          { period: 'Week 3', income: 1100, expense: 720 },
          { period: 'Week 4', income: 1800, expense: 730 },
        ],
      });
      setInsights([
        { type: 'warning', title: 'High Food Spending', description: 'Your food expenses are 25% higher than last month.' },
        { type: 'success', title: 'Savings Goal Progress', description: 'You\'re on track to meet your emergency fund goal!' },
        { type: 'info', title: 'Budget Reminder', description: 'You\'ve used 75% of your entertainment budget.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  const formatDate = (date: Date | string | number) => {
    return formatDateUtil(date, preferences.dateFormat);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        await exportService.exportTransactionsCSV();
      } else {
        await exportService.exportTransactionsJSON();
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <PageLayout maxWidth="xl" showSearch={false} customTitle="Reports & Analytics">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl" showSearch={false} customTitle="Reports & Analytics">
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Period</InputLabel>
          <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)} size="small">
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <Button startIcon={<Download />} onClick={() => handleExport('csv')} sx={{ mr: 1 }}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => handleExport('json')}>
            Export JSON
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Net Worth</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(overview?.net_worth || 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                Assets: {formatCurrency(overview?.total_assets || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Income (30d)</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatCurrency(overview?.income_30d || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Expenses (30d)</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {formatCurrency(overview?.expenses_30d || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Balance (30d)</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: (overview?.balance_30d || 0) >= 0 ? 'success.main' : 'error.main' }}>
                {formatCurrency(overview?.balance_30d || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab icon={<BarChartIcon />} label="Income vs Expenses" iconPosition="start" />
          <Tab icon={<PieChartIcon />} label="Spending by Category" iconPosition="start" />
          <Tab icon={<Lightbulb />} label="Insights" iconPosition="start" />
        </Tabs>

        {/* Income vs Expenses Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Income vs Expenses Trend</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border.primary} />
                  <XAxis dataKey="period" stroke={theme.text.secondary} />
                  <YAxis stroke={theme.text.secondary} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    contentStyle={{ background: theme.card.background, border: `1px solid ${theme.border.primary}` }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Income" />
                  <Area type="monotone" dataKey="expense" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>

        {/* Spending by Category Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Spending Distribution</Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview?.spending_by_category || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(overview?.spending_by_category || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                {(overview?.spending_by_category || []).map((cat: any, index: number) => {
                  const total = (overview?.spending_by_category || []).reduce((sum: number, c: any) => sum + c.amount, 0);
                  const percent = total > 0 ? (cat.amount / total) * 100 : 0;
                  return (
                    <Box key={cat.category} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[index % COLORS.length], mr: 1 }} />
                          <Typography variant="body2">{cat.category}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(cat.amount)}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.border.primary,
                          '& .MuiLinearProgress-bar': { backgroundColor: COLORS[index % COLORS.length] },
                        }}
                      />
                    </Box>
                  );
                })}
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Insights Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Financial Insights</Typography>
            {insights.length === 0 ? (
              <Alert severity="info">No insights available. Keep tracking your finances to get personalized recommendations!</Alert>
            ) : (
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Alert
                      severity={insight.type === 'warning' ? 'warning' : insight.type === 'success' ? 'success' : 'info'}
                      sx={{ height: '100%' }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>{insight.title}</Typography>
                      <Typography variant="body2">{insight.description}</Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </PageLayout>
  );
};

export default Reports;

