import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import FinancialCard from '../components/financial/FinancialCard';
import WalletSection from '../components/dashboard/WalletSection';
import ScheduledTransfers from '../components/dashboard/ScheduledTransfers';
import SummaryCard from '../components/dashboard/SummaryCard';
import { AccountBalanceWallet } from '@mui/icons-material';

const ComponentTest: React.FC = () => {
  const { theme } = useTheme();

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={false}
    >
      <Typography variant="h4" sx={{ color: theme.text.primary, mb: 4 }}>
        Component Test Page
      </Typography>

      {/* Test FinancialCard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: theme.text.primary, mb: 2 }}>
          FinancialCard Component
        </Typography>
          <FinancialCard
            bankName="Maglo."
            cardType="Universal Bank"
            cardNumber="5495 7381 3759 2321"
            expiryDate="04/24"
            holderName="John Doe"
            variant="primary"
            isDefault={true}
          />
        </Box>

      {/* Test SummaryCard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: theme.text.primary, mb: 2 }}>
          SummaryCard Component
        </Typography>
          <Box sx={{ width: 300 }}>
            <SummaryCard
              title="Total Balance"
              value="$25,420.50"
              subtitle="All accounts"
              icon={<AccountBalanceWallet />}
              color="primary"
              trendValue="+2.5%"
              trend="up"
            />
          </Box>
        </Box>

      {/* Test WalletSection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: theme.text.primary, mb: 2 }}>
          WalletSection Component
        </Typography>
          <WalletSection />
        </Box>

      {/* Test ScheduledTransfers */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: theme.text.primary, mb: 2 }}>
          ScheduledTransfers Component
        </Typography>
        <ScheduledTransfers />
      </Box>
    </PageLayout>
  );
};

export default ComponentTest;
