import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { alpha } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartDataPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  date: string;
}

interface FinancialChartProps {
  data?: ChartDataPoint[];
  height?: number;
  showControls?: boolean;
}

const FinancialChart: React.FC<FinancialChartProps> = ({
  data,
  height = 291,
  showControls = true,
}) => {
  const muiTheme = useMuiTheme();
  const { theme, isDarkMode } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  const [selectedMetric, setSelectedMetric] = useState<'balance' | 'income' | 'expenses'>('balance');

  // Default chart data matching Figma design
  const defaultData: ChartDataPoint[] = [
    { month: 'Jan', income: 12500, expenses: 8200, balance: 4300, date: '2024-01' },
    { month: 'Feb', income: 13200, expenses: 7800, balance: 5400, date: '2024-02' },
    { month: 'Mar', income: 11800, expenses: 9100, balance: 2700, date: '2024-03' },
    { month: 'Apr', income: 14500, expenses: 8900, balance: 5600, date: '2024-04' },
    { month: 'May', income: 13800, expenses: 7600, balance: 6200, date: '2024-05' },
    { month: 'Jun', income: 15200, expenses: 8400, balance: 6800, date: '2024-06' },
    { month: 'Jul', income: 14200, expenses: 9200, balance: 5000, date: '2024-07' },
    { month: 'Aug', income: 16100, expenses: 8800, balance: 7300, date: '2024-08' },
    { month: 'Sep', income: 15500, expenses: 9500, balance: 6000, date: '2024-09' },
    { month: 'Oct', income: 17200, expenses: 9800, balance: 7400, date: '2024-10' },
    { month: 'Nov', income: 16800, expenses: 8600, balance: 8200, date: '2024-11' },
    { month: 'Dec', income: 18500, expenses: 9200, balance: 9300, date: '2024-12' },
  ];

  const chartData = data || defaultData;

  // Get color based on selected metric
  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'income':
        return '#4CAF50';
      case 'expenses':
        return '#E53935';
      case 'balance':
      default:
        return '#C8EE44';
    }
  };

  // Get gradient colors
  const getGradientColors = () => {
    switch (selectedMetric) {
      case 'income':
        return {
          start: alpha('#4CAF50', 0.3),
          end: alpha('#4CAF50', 0.05),
        };
      case 'expenses':
        return {
          start: alpha('#E53935', 0.3),
          end: alpha('#E53935', 0.05),
        };
      case 'balance':
      default:
        return {
          start: alpha('#C8EE44', 0.3),
          end: alpha('#C8EE44', 0.05),
        };
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${alpha('#000000', 0.1)}`,
            borderRadius: 2,
            p: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label} 2024
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                }}
              />
              <Typography variant="caption">
                Income: ${data.income.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#E53935',
                }}
              />
              <Typography variant="caption">
                Expenses: ${data.expenses.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#C8EE44',
                }}
              />
              <Typography variant="caption">
                Balance: ${data.balance.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }
    return null;
  };

  // Format currency for Y-axis
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const gradientColors = getGradientColors();

  return (
    <Card
      sx={{
        height: height,
        background: '#FFFFFF',
        border: `1px solid #F5F5F5`,
        borderRadius: 2.5,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      {showControls && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            pb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: '#1B212D',
                fontWeight: 600,
                fontSize: '1.125rem',
                mb: 0.5,
              }}
            >
              Financial Overview
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#1B212D', 0.6),
                fontSize: '0.875rem',
              }}
            >
              Track your income, expenses, and balance
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Metric Selector */}
            <ButtonGroup size="small" variant="outlined">
              {[
                { key: 'balance', label: 'Balance' },
                { key: 'income', label: 'Income' },
                { key: 'expenses', label: 'Expenses' },
              ].map((metric) => (
                <Button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key as any)}
                  sx={{
                    backgroundColor: selectedMetric === metric.key ? '#C8EE44' : 'transparent',
                    color: selectedMetric === metric.key ? '#000000' : alpha('#1B212D', 0.7),
                    borderColor: alpha('#1B212D', 0.2),
                    fontSize: '0.75rem',
                    px: 2,
                    '&:hover': {
                      backgroundColor: selectedMetric === metric.key ? '#C8EE44' : alpha('#C8EE44', 0.1),
                    },
                  }}
                >
                  {metric.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Period Selector */}
            <ButtonGroup size="small" variant="outlined">
              {['1M', '3M', '6M', '1Y'].map((period) => (
                <Button
                  key={period}
                  onClick={() => setSelectedPeriod(period as any)}
                  sx={{
                    backgroundColor: selectedPeriod === period ? '#C8EE44' : 'transparent',
                    color: selectedPeriod === period ? '#000000' : alpha('#1B212D', 0.7),
                    borderColor: alpha('#1B212D', 0.2),
                    fontSize: '0.75rem',
                    minWidth: 40,
                    '&:hover': {
                      backgroundColor: selectedPeriod === period ? '#C8EE44' : alpha('#C8EE44', 0.1),
                    },
                  }}
                >
                  {period}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Box>
      )}

      {/* Chart Container */}
      <Box
        sx={{
          height: showControls ? height - 100 : height - 20,
          px: 3,
          pb: 2,
          position: 'relative',
        }}
      >
        {/* Gradient Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 49,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(250, 251, 254, 0) 0%, #F2F6FC 100%)',
            borderRadius: 3,
            zIndex: 0,
          }}
        />

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColors.start} />
                <stop offset="100%" stopColor={gradientColors.end} />
              </linearGradient>
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.text.primary, 0.1)}
              horizontal={true}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: theme.text.secondary,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: theme.text.secondary,
              }}
              tickFormatter={formatCurrency}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor()}
              strokeWidth={3}
              fill="url(#colorGradient)"
              dot={{
                fill: getMetricColor(),
                strokeWidth: 2,
                stroke: theme.background.default,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: getMetricColor(),
                stroke: theme.background.default,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default FinancialChart;
