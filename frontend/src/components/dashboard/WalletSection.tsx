import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import {
  MoreHoriz,
  Add,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialCard from '../financial/FinancialCard';

interface CardData {
  id: string;
  bankName: string;
  cardType: string;
  cardNumber: string;
  expiryDate: string;
  holderName?: string;
  isDefault?: boolean;
}

interface WalletSectionProps {
  cards?: CardData[];
  onAddCard?: () => void;
  onCardClick?: (card: CardData) => void;
  onMoreClick?: () => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({
  cards = [],
  onAddCard,
  onCardClick,
  onMoreClick,
}) => {
  const { theme, isDarkMode } = useTheme();
  // Default cards if none provided (matching Figma design)
  const defaultCards: CardData[] = [
    {
      id: '1',
      bankName: 'Maglo.',
      cardType: 'Universal Bank',
      cardNumber: '5495 7381 3759 2321',
      expiryDate: '04/24',
      holderName: 'John Doe',
      isDefault: true,
    },
    {
      id: '2',
      bankName: 'Maglo.',
      cardType: 'Commercial Bank',
      cardNumber: '8595 2548 **** ****',
      expiryDate: '09/25',
      holderName: 'John Doe',
      isDefault: false,
    },
  ];

  const displayCards = cards.length > 0 ? cards : defaultCards;

  return (
    <Box sx={{ mb: 4 }}>
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
          Wallet
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Add Card Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={onAddCard}
            sx={{
              color: alpha('#FFFFFF', 0.8),
              borderColor: alpha('#FFFFFF', 0.3),
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: alpha('#FFFFFF', 0.5),
                backgroundColor: alpha('#FFFFFF', 0.05),
              },
            }}
          >
            Add Card
          </Button>

          {/* More Options */}
          <IconButton
            size="small"
            onClick={onMoreClick}
            sx={{
              color: alpha('#FFFFFF', 0.8),
              backgroundColor: alpha('#FFFFFF', 0.05),
              border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
              '&:hover': {
                backgroundColor: alpha('#FFFFFF', 0.1),
                borderColor: alpha('#FFFFFF', 0.2),
              },
            }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Cards Container */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha('#FFFFFF', 0.1),
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha('#FFFFFF', 0.3),
            borderRadius: 3,
            '&:hover': {
              backgroundColor: alpha('#FFFFFF', 0.4),
            },
          },
        }}
      >
        {displayCards.map((card, index) => (
          <Box
            key={card.id}
            onClick={() => onCardClick?.(card)}
            sx={{
              flexShrink: 0,
              cursor: onCardClick ? 'pointer' : 'default',
            }}
          >
            <FinancialCard
              bankName={card.bankName}
              cardType={card.cardType}
              cardNumber={card.cardNumber}
              expiryDate={card.expiryDate}
              holderName={card.holderName}
              variant={index === 0 ? 'primary' : 'secondary'}
              isDefault={card.isDefault}
            />
          </Box>
        ))}

        {/* Add New Card Placeholder */}
        {displayCards.length < 3 && (
          <Box
            onClick={onAddCard}
            sx={{
              width: 320,
              height: 200,
              border: `2px dashed ${alpha(theme.text.primary, 0.3)}`,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              flexShrink: 0,
              '&:hover': {
                borderColor: alpha(theme.text.primary, 0.5),
                backgroundColor: alpha(theme.text.primary, 0.02),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Add
              sx={{
                fontSize: 48,
                color: alpha(theme.text.primary, 0.4),
                mb: 1,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.text.primary, 0.6),
                textAlign: 'center',
              }}
            >
              Add New Card
            </Typography>
          </Box>
        )}
      </Box>

      {/* Cards Summary */}
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
            color: alpha(theme.text.primary, 0.6),
            fontSize: '0.875rem',
          }}
        >
          {displayCards.length} {displayCards.length === 1 ? 'card' : 'cards'} available
        </Typography>

        {displayCards.length > 2 && (
          <Button
            variant="text"
            size="small"
            onClick={onMoreClick}
            sx={{
              color: '#C8EE44',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: alpha('#C8EE44', 0.1),
              },
            }}
          >
            View All Cards
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default WalletSection;
