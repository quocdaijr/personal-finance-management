import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  LinearProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';

interface SecondaryValue {
  label: string;
  value: string | number;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  progress?: number;
  secondaryValue?: SecondaryValue;
  variant?: 'default' | 'gradient' | 'outlined';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  progress,
  secondaryValue,
  variant = 'gradient',
  trend,
  trendValue
}) => {
  const { theme, isDarkMode } = useTheme();

  // Get card background based on variant and theme
  const getCardBackground = () => {
    switch (variant) {
      case 'gradient':
        return isDarkMode
          ? 'linear-gradient(135deg, #2E2B4A 0%, #29263F 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)';
      case 'outlined':
        return theme.card.background;
      default:
        return theme.card.background;
    }
  };

  // Get card border based on theme
  const getCardBorder = () => {
    return `1px solid ${theme.card.border}`;
  };

  // Get icon background color
  const getIconBackground = () => {
    const colorMap = {
      primary: alpha('#C8EE44', 0.2),
      secondary: alpha('#2196F3', 0.2),
      success: alpha('#4CAF50', 0.2),
      error: alpha('#E53935', 0.2),
      warning: alpha('#FBC02D', 0.2),
      info: alpha('#2196F3', 0.2),
    };
    return colorMap[color] || colorMap.primary;
  };

  // Get icon color
  const getIconColor = () => {
    const colorMap = {
      primary: '#C8EE44',
      secondary: '#2196F3',
      success: '#4CAF50',
      error: '#E53935',
      warning: '#FBC02D',
      info: '#2196F3',
    };
    return colorMap[color] || colorMap.primary;
  };

  // Get trend color
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#4CAF50';
      case 'down':
        return '#E53935';
      default:
        return theme.text.secondary;
    }
  };

  // Get text colors based on variant and theme
  const getTextColors = () => {
    if (variant === 'gradient') {
      return {
        title: isDarkMode ? alpha('#FFFFFF', 0.7) : alpha('#1B212D', 0.7),
        value: isDarkMode ? '#FFFFFF' : '#1B212D',
        subtitle: isDarkMode ? alpha('#FFFFFF', 0.6) : alpha('#1B212D', 0.6),
        secondary: isDarkMode ? alpha('#FFFFFF', 0.6) : alpha('#1B212D', 0.6),
        secondaryValue: isDarkMode ? '#FFFFFF' : '#1B212D',
        progress: isDarkMode ? alpha('#FFFFFF', 0.6) : alpha('#1B212D', 0.6),
        progressValue: isDarkMode ? '#FFFFFF' : '#1B212D',
      };
    }
    return {
      title: theme.text.secondary,
      value: theme.text.primary,
      subtitle: theme.text.secondary,
      secondary: theme.text.secondary,
      secondaryValue: theme.text.primary,
      progress: theme.text.secondary,
      progressValue: theme.text.primary,
    };
  };

  const textColors = getTextColors();

  return (
    <Card
      sx={{
        height: '100%',
        background: getCardBackground(),
        border: getCardBorder(),
        borderRadius: 2.5,
        transition: 'all 0.3s ease-in-out',
        boxShadow: variant === 'gradient'
          ? '0 4px 20px rgba(46, 43, 74, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: variant === 'gradient'
            ? (isDarkMode ? '0 8px 32px rgba(46, 43, 74, 0.25)' : '0 8px 32px rgba(0, 0, 0, 0.15)')
            : theme.card.hoverShadow,
          border: variant === 'gradient'
            ? `1px solid ${alpha(isDarkMode ? '#FFFFFF' : '#1B212D', 0.2)}`
            : `1px solid ${alpha('#C8EE44', 0.3)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography
            variant="body1"
            component="div"
            sx={{
              color: textColors.title,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{
              backgroundColor: getIconBackground(),
              color: getIconColor(),
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
              minHeight: 48,
            }}>
              {icon}
            </Box>
          )}
        </Box>

        {/* Main Value */}
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: textColors.value,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            lineHeight: 1.2,
            fontFamily: 'Kumbh Sans',
          }}
        >
          {value}
        </Typography>

        {/* Subtitle and Trend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: textColors.subtitle,
                fontSize: '0.875rem',
              }}
            >
              {subtitle}
            </Typography>
          )}
          {trendValue && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: alpha(getTrendColor(), 0.1),
                borderRadius: 1,
                px: 1,
                py: 0.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: getTrendColor(),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Secondary Value */}
        {secondaryValue && (
          <>
            <Divider sx={{
              my: 2,
              borderColor: variant === 'gradient'
                ? alpha(isDarkMode ? '#FFFFFF' : '#1B212D', 0.1)
                : theme.border.primary
            }} />
            <Typography
              variant="body2"
              sx={{
                color: textColors.secondary,
                fontSize: '0.875rem',
                mb: 0.5,
              }}
            >
              {secondaryValue.label}
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: textColors.secondaryValue,
                fontWeight: 500,
                fontSize: '1.125rem',
              }}
            >
              {secondaryValue.value}
            </Typography>
          </>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: textColors.progress,
                  fontSize: '0.875rem',
                }}
              >
                Progress
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: textColors.progressValue,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: variant === 'gradient'
                  ? alpha(isDarkMode ? '#FFFFFF' : '#1B212D', 0.1)
                  : alpha(theme.text.primary, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getIconColor(),
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
