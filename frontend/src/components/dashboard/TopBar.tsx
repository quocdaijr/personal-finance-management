import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  ClickAwayListener,
} from '@mui/material';
import {
  Search,
  Notifications,
  Settings,
  KeyboardArrowDown,
  Person,
  Logout,
  Help,
  DarkMode,
  LightMode,
  Receipt,
  AccountBalanceWallet,
  PieChart,
  Flag,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { NotificationCenter } from '../notifications';
import searchService from '../../services/searchService';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title = 'Dashboard',
  showSearch = true,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchValue.length >= 2) {
        setSearchLoading(true);
        try {
          const result = await searchService.search(searchValue, 10);
          setSearchResults(result?.results || []);
          setShowSearchResults(true);
        } catch {
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleSearchResultClick = (result: any) => {
    navigate(result.url);
    setSearchValue('');
    setShowSearchResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <Receipt fontSize="small" />;
      case 'account': return <AccountBalanceWallet fontSize="small" />;
      case 'budget': return <PieChart fontSize="small" />;
      case 'goal': return <Flag fontSize="small" />;
      default: return <Search fontSize="small" />;
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    handleProfileMenuClose();
    navigate('/settings');
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    if (user?.first_name) {
      return user.first_name.charAt(0);
    }
    if (user?.username) {
      return user.username.charAt(0);
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.username || 'User';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        px: { xs: 2, sm: 3 },
        py: 2,
      }}
    >
      {/* Left Section - Title */}
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: theme.text.primary,
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontFamily: 'Kumbh Sans',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right Section - Search, Icons, and Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Search Bar with Results */}
        {showSearch && (
          <ClickAwayListener onClickAway={() => setShowSearchResults(false)}>
            <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
              <TextField
                size="small"
                placeholder="Search transactions, accounts..."
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Search sx={{ color: theme.text.secondary, fontSize: 20 }} />
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 320,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.background.secondary,
                    borderRadius: 2,
                    border: `1px solid ${theme.border.primary}`,
                    '&:hover': {
                      border: `1px solid ${theme.border.secondary}`,
                    },
                    '&.Mui-focused': {
                      border: `1px solid #C8EE44`,
                      boxShadow: `0 0 0 2px ${alpha('#C8EE44', 0.2)}`,
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.text.primary,
                    fontSize: '0.875rem',
                    '&::placeholder': {
                      color: theme.text.secondary,
                      opacity: 1,
                    },
                  },
                }}
              />
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    mt: 1,
                    maxHeight: 400,
                    overflow: 'auto',
                    zIndex: 1200,
                    background: theme.card.background,
                    border: `1px solid ${theme.card.border}`,
                  }}
                >
                  <List dense>
                    {searchResults.map((result, idx) => (
                      <ListItem
                        key={`${result.type}-${result.id}-${idx}`}
                        onClick={() => handleSearchResultClick(result)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getResultIcon(result.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.title}
                          secondary={result.description}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <Chip label={result.type} size="small" sx={{ fontSize: 10, height: 20 }} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        )}

        {/* Icons Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search Icon for Mobile */}
          {showSearch && (
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: theme.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.text.primary, 0.05),
                },
              }}
            >
              <Search />
            </IconButton>
          )}

          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: theme.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.text.primary, 0.05),
              },
            }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Notifications */}
          <NotificationCenter />

          {/* Settings */}
          <IconButton
            onClick={handleSettingsClick}
            sx={{
              color: theme.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.text.primary, 0.05),
              },
            }}
          >
            <Settings />
          </IconButton>
        </Box>

        {/* User Profile Section */}
        <Button
          onClick={handleProfileMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: theme.background.secondary,
            borderRadius: 25,
            px: 2,
            py: 1,
            textTransform: 'none',
            border: `1px solid ${theme.border.primary}`,
            '&:hover': {
              backgroundColor: alpha(theme.background.secondary, 0.8),
              border: `1px solid ${theme.border.secondary}`,
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#C8EE44',
              color: '#000000',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getUserInitials()}
          </Avatar>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.text.primary,
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: 1.2,
              }}
            >
              {getUserDisplayName()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.text.secondary,
                fontSize: '0.75rem',
                lineHeight: 1,
              }}
            >
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>

          <KeyboardArrowDown
            sx={{
              color: theme.text.secondary,
              fontSize: 20,
            }}
          />
        </Button>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            border: `1px solid ${alpha('#1B212D', 0.1)}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <Person sx={{ mr: 2, fontSize: 20 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/help')}>
          <Help sx={{ mr: 2, fontSize: 20 }} />
          Help
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TopBar;
