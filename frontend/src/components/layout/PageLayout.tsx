import React from 'react';
import { Box, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { TopBar } from '../dashboard';

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  customTitle?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  maxWidth = 'xl',
  showSearch = true,
  onSearchChange,
  customTitle,
}) => {
  const { theme } = useTheme();
  const location = useLocation();

  // Auto-detect page title based on current route
  const getPageTitle = (): string => {
    if (customTitle) return customTitle;
    
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/transactions': 'Transactions',
      '/accounts': 'Accounts',
      '/wallets': 'My Wallets',
      '/budgets': 'Budgets',
      '/settings': 'Settings',
      '/settings/general': 'General Settings',
      '/settings/account': 'Account Settings',
      '/profile': 'Profile',
      '/help': 'Help & Support',
      '/test': 'Component Test',
    };

    return titleMap[path] || 'Dashboard';
  };

  // Determine if search should be shown based on page
  const getShowSearch = (): boolean => {
    if (showSearch !== undefined) return showSearch;
    
    const path = location.pathname;
    const searchEnabledPages = ['/dashboard', '/transactions', '/accounts', '/wallets'];
    return searchEnabledPages.includes(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TopBar - Full Width from Sidebar to Browser Edge */}
      <Box
        sx={{
          width: '100%',
          flexShrink: 0,
          borderBottom: `1px solid ${theme.border.primary}`,
          background: theme.background.default,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <TopBar
          title={getPageTitle()}
          showSearch={getShowSearch()}
          onSearchChange={onSearchChange}
        />
      </Box>

      {/* Page Content Area */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          pt: 2, // Add some top padding after the header
        }}
      >
        {maxWidth ? (
          <Container 
            maxWidth={maxWidth} 
            sx={{ 
              px: { xs: 2, sm: 3 },
              height: '100%',
            }}
          >
            {children}
          </Container>
        ) : (
          <Box sx={{ px: { xs: 2, sm: 3 }, height: '100%' }}>
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageLayout;
