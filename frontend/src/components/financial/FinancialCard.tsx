import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Wifi,
  ContactlessOutlined,
  MoreVert,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface FinancialCardProps {
  bankName: string;
  cardType: string;
  cardNumber: string;
  expiryDate: string;
  holderName?: string;
  variant?: 'primary' | 'secondary';
  isDefault?: boolean;
}

const FinancialCard: React.FC<FinancialCardProps> = ({
  bankName,
  cardType,
  cardNumber,
  expiryDate,
  holderName,
  variant = 'primary',
  isDefault = false,
}) => {
  // Format card number to show only last 4 digits
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length >= 16) {
      return `${cleaned.slice(0, 4)}  ${cleaned.slice(4, 8)}  ${cleaned.slice(8, 12)}  ${cleaned.slice(12, 16)}`;
    }
    return number;
  };

  // Get card gradient based on variant
  const getCardGradient = () => {
    if (variant === 'primary') {
      return 'linear-gradient(135deg, #2E2B4A 0%, #29263F 100%)';
    }
    return 'linear-gradient(135deg, rgba(46, 43, 74, 0.4) 0%, rgba(41, 38, 63, 0.4) 100%)';
  };

  // Get card border
  const getCardBorder = () => {
    if (variant === 'primary') {
      return `1px solid ${alpha('#FFFFFF', 0.2)}`;
    }
    return `1px solid ${alpha('#FFFFFF', 0.1)}`;
  };

  return (
    <Card
      sx={{
        width: 320,
        height: 200,
        background: getCardGradient(),
        border: getCardBorder(),
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: variant === 'secondary' 
            ? 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Ccircle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23grain)"/%3E%3C/svg%3E")'
            : 'none',
          opacity: 0.3,
        }}
      />

      <CardContent sx={{ p: 3, height: '100%', position: 'relative', zIndex: 1 }}>
        {/* Top Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 0.5,
              }}
            >
              {bankName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#FFFFFF', 0.7),
                fontSize: '0.8rem',
              }}
            >
              {cardType}
            </Typography>
            {isDefault && (
              <Chip
                label="Default"
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: alpha('#C8EE44', 0.2),
                  color: '#C8EE44',
                  border: `1px solid ${alpha('#C8EE44', 0.3)}`,
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Contactless Icon */}
            <ContactlessOutlined
              sx={{
                color: alpha('#FFFFFF', 0.8),
                fontSize: 20,
              }}
            />
            {/* WiFi Icon */}
            <Wifi
              sx={{
                color: alpha('#FFFFFF', 0.8),
                fontSize: 18,
              }}
            />
            {/* More Options */}
            <IconButton
              size="small"
              sx={{
                color: alpha('#FFFFFF', 0.8),
                '&:hover': {
                  backgroundColor: alpha('#FFFFFF', 0.1),
                },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Chip */}
        <Box
          sx={{
            width: 40,
            height: 28,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: 1,
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 2,
              left: 2,
              right: 2,
              bottom: 2,
              background: 'linear-gradient(135deg, #FFE55C 0%, #FFB347 100%)',
              borderRadius: 0.5,
            },
          }}
        />

        {/* Card Number */}
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: 500,
            letterSpacing: 2,
            mb: 2,
          }}
        >
          {formatCardNumber(cardNumber)}
        </Typography>

        {/* Bottom Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            {holderName && (
              <Typography
                variant="body2"
                sx={{
                  color: alpha('#FFFFFF', 0.7),
                  fontSize: '0.75rem',
                  mb: 0.5,
                }}
              >
                CARD HOLDER
              </Typography>
            )}
            {holderName && (
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {holderName.toUpperCase()}
              </Typography>
            )}
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#FFFFFF', 0.7),
                fontSize: '0.75rem',
                mb: 0.5,
              }}
            >
              EXPIRES
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 500,
                fontFamily: 'monospace',
              }}
            >
              {expiryDate}
            </Typography>
          </Box>
        </Box>

        {/* Mastercard/Visa Logo Placeholder */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 40,
            height: 24,
            background: alpha('#FFFFFF', 0.1),
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: alpha('#FFFFFF', 0.8),
              fontSize: '0.6rem',
              fontWeight: 600,
            }}
          >
            CARD
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialCard;
