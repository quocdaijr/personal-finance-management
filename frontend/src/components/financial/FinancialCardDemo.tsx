import React from 'react';
import { Box, Typography } from '@mui/material';
import FinancialCard from './FinancialCard';

const FinancialCardDemo: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
        Financial Cards Demo
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Primary Card - Maglo Universal Bank */}
        <FinancialCard
          bankName="Maglo."
          cardType="Universal Bank"
          cardNumber="5495 7381 3759 2321"
          expiryDate="04/24"
          holderName="John Doe"
          variant="primary"
          isDefault={true}
        />

        {/* Secondary Card - Commercial Bank */}
        <FinancialCard
          bankName="Maglo."
          cardType="Commercial Bank"
          cardNumber="8595 2548 **** ****"
          expiryDate="09/25"
          holderName="John Doe"
          variant="secondary"
          isDefault={false}
        />
      </Box>
    </Box>
  );
};

export default FinancialCardDemo;
