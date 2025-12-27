import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  MoreVert,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { formatCurrency as formatCurrencyUtil } from '../../utils/formatters';

interface TransferData {
  id: string;
  recipientName: string;
  recipientAvatar?: string;
  amount: number;
  currency?: string;
  scheduledDate: string;
  scheduledTime: string;
  status?: 'pending' | 'completed' | 'failed';
}

interface ScheduledTransfersProps {
  transfers?: TransferData[];
  onViewAll?: () => void;
  onTransferClick?: (transfer: TransferData) => void;
  onMoreClick?: () => void;
}

const ScheduledTransfers: React.FC<ScheduledTransfersProps> = ({
  transfers = [],
  onViewAll,
  onTransferClick,
  onMoreClick,
}) => {
  const { preferences } = useUserPreferences();
  // Default transfers data matching Figma design
  const defaultTransfers: TransferData[] = [
    {
      id: '1',
      recipientName: 'Saleh Ahmed',
      amount: 435.00,
      currency: 'USD',
      scheduledDate: 'April 28, 2022',
      scheduledTime: '11:00',
      status: 'pending',
    },
    {
      id: '2',
      recipientName: 'Delowar Hossain',
      amount: 132.00,
      currency: 'USD',
      scheduledDate: 'April 25, 2022',
      scheduledTime: '11:00',
      status: 'pending',
    },
  ];

  const displayTransfers = transfers.length > 0 ? transfers : defaultTransfers;

  // Format currency
  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem',
          }}
        >
          Scheduled Transfers
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
              '&:hover': {
                backgroundColor: alpha('#C8EE44', 0.1),
              },
            }}
          >
            View All
          </Button>
        </Box>
      </Box>

      {/* Transfers List */}
      <Box
        sx={{
          background: alpha('#FFFFFF', 0.02),
          borderRadius: 2,
          border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
          overflow: 'hidden',
        }}
      >
        {displayTransfers.map((transfer, index) => (
          <React.Fragment key={transfer.id}>
            <Box
              onClick={() => onTransferClick?.(transfer)}
              sx={{
                p: 3,
                cursor: onTransferClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha('#FFFFFF', 0.03),
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left Section - Avatar and Details */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: getAvatarColor(transfer.recipientName),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                    src={transfer.recipientAvatar}
                  >
                    {getInitials(transfer.recipientName)}
                  </Avatar>

                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '1rem',
                        mb: 0.5,
                      }}
                    >
                      {transfer.recipientName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha('#FFFFFF', 0.6),
                        fontSize: '0.875rem',
                      }}
                    >
                      {transfer.scheduledDate} at {transfer.scheduledTime}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Section - Amount and Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#E53935', // Red for outgoing transfers
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}
                  >
                    - {formatCurrency(transfer.amount)}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreClick?.();
                    }}
                    sx={{
                      color: alpha('#FFFFFF', 0.6),
                      '&:hover': {
                        backgroundColor: alpha('#FFFFFF', 0.1),
                        color: alpha('#FFFFFF', 0.8),
                      },
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Divider between items */}
            {index < displayTransfers.length - 1 && (
              <Divider
                sx={{
                  borderColor: alpha('#FFFFFF', 0.1),
                  mx: 3,
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Empty State */}
        {displayTransfers.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha('#FFFFFF', 0.6),
                mb: 2,
              }}
            >
              No scheduled transfers found
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
              Schedule Transfer
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer Summary */}
      {displayTransfers.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: alpha('#FFFFFF', 0.6),
              fontSize: '0.875rem',
            }}
          >
            {displayTransfers.length} {displayTransfers.length === 1 ? 'transfer' : 'transfers'} scheduled
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: alpha('#FFFFFF', 0.6),
              fontSize: '0.875rem',
            }}
          >
            Total: {formatCurrency(
              displayTransfers.reduce((sum, transfer) => sum + transfer.amount, 0)
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ScheduledTransfers;
