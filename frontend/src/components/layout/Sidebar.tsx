import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  AccountBalanceWallet,
  Settings,
  Help,
  Logout,
  Menu,
  ExpandLess,
  ExpandMore,
  Person,
  Tune,
  Flag,
  Repeat,
  PieChart,
  Assessment,
  Category,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
  width?: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  section?: 'main' | 'secondary';
  hasSubmenu?: boolean;
  submenu?: NavigationSubItem[];
}

interface NavigationSubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  variant = 'permanent',
  width = 280,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // State for expanded submenus
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  // Navigation items matching Figma design
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      section: 'main',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <Receipt />,
      path: '/transactions',
      section: 'main',
    },
    {
      id: 'wallets',
      label: 'My Wallets',
      icon: <AccountBalanceWallet />,
      path: '/wallets',
      section: 'main',
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: <PieChart />,
      path: '/budgets',
      section: 'main',
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Flag />,
      path: '/goals',
      section: 'main',
    },
    {
      id: 'recurring',
      label: 'Recurring',
      icon: <Repeat />,
      path: '/recurring',
      section: 'main',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <Assessment />,
      path: '/reports',
      section: 'main',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <Category />,
      path: '/categories',
      section: 'main',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      section: 'secondary',
      hasSubmenu: true,
      submenu: [
        {
          id: 'general',
          label: 'General',
          icon: <Tune />,
          path: '/settings/general',
        },
        {
          id: 'account',
          label: 'Account',
          icon: <Person />,
          path: '/settings/account',
        },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      icon: <Help />,
      path: '/help',
      section: 'secondary',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleSubmenuToggle = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu: NavigationSubItem[]) => {
    return submenu.some(item => location.pathname === item.path);
  };

  // Auto-expand settings menu if on a settings page
  React.useEffect(() => {
    if (location.pathname.startsWith('/settings') && !expandedMenus.includes('settings')) {
      setExpandedMenus(prev => [...prev, 'settings']);
    }
  }, [location.pathname, expandedMenus]);

  const sidebarContent = (
    <Box
      sx={{
        width: width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.background.paper,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.border.primary}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {variant === 'temporary' && (
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.text.secondary,
                '&:hover': {
                  backgroundColor: theme.background.secondary,
                },
              }}
            >
              <Menu />
            </IconButton>
          )}
          
          <Typography
            variant="h5"
            sx={{
              color: theme.text.primary,
              fontWeight: 700,
              fontSize: '1.5rem',
            }}
          >
            Maglo.
          </Typography>
        </Box>
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.border.primary}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: '#C8EE44',
              color: '#000000',
              fontWeight: 600,
            }}
          >
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={{
                color: theme.text.primary,
                fontWeight: 500,
                fontSize: '1rem',
              }}
            >
              {user?.first_name || user?.username || 'User'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.text.secondary,
                fontSize: '0.875rem',
              }}
            >
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2 }}>
        {/* Main Navigation */}
        <List sx={{ px: 2 }}>
          {navigationItems
            .filter(item => item.section === 'main')
            .map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item.path ? handleNavigation(item.path) : handleSubmenuToggle(item.id)}
                  selected={item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: alpha('#C8EE44', 0.15),
                      color: '#C8EE44',
                      '&:hover': {
                        backgroundColor: alpha('#C8EE44', 0.2),
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#C8EE44',
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.background.secondary,
                    },
                    color: theme.text.primary,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: (item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)) ? '#C8EE44' : theme.text.secondary,
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.95rem',
                        fontWeight: (item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)) ? 600 : 400,
                        color: (item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)) ? '#C8EE44' : theme.text.primary,
                      },
                    }}
                  />
                  {item.hasSubmenu && (
                    <ListItemIcon sx={{ minWidth: 'auto', color: theme.text.secondary }}>
                      {expandedMenus.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        {/* Divider */}
        <Divider
          sx={{
            my: 2,
            mx: 3,
            borderColor: theme.border.primary,
          }}
        />

        {/* Secondary Navigation */}
        <List sx={{ px: 2 }}>
          {navigationItems
            .filter(item => item.section === 'secondary')
            .map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => item.path ? handleNavigation(item.path) : handleSubmenuToggle(item.id)}
                    selected={item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: alpha('#C8EE44', 0.15),
                        color: '#C8EE44',
                        '&:hover': {
                          backgroundColor: alpha('#C8EE44', 0.2),
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#C8EE44',
                        },
                      },
                      '&:hover': {
                        backgroundColor: theme.background.secondary,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: (item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)) ? '#C8EE44' : theme.text.secondary,
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '0.95rem',
                          fontWeight: (item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)) ? 600 : 400,
                          color: (item.path ? isActive(item.path) : (item.submenu ? isSubmenuActive(item.submenu) : false)) ? '#C8EE44' : theme.text.primary,
                        },
                      }}
                    />
                    {item.hasSubmenu && (
                      <ListItemIcon sx={{ minWidth: 'auto', color: theme.text.secondary }}>
                        {expandedMenus.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                      </ListItemIcon>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Submenu Items */}
                {item.hasSubmenu && item.submenu && expandedMenus.includes(item.id) && (
                  <Box sx={{ pl: 2 }}>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => handleNavigation(subItem.path)}
                          selected={isActive(subItem.path)}
                          sx={{
                            borderRadius: 2,
                            py: 1,
                            px: 2,
                            ml: 2,
                            '&.Mui-selected': {
                              backgroundColor: alpha('#C8EE44', 0.15),
                              color: '#C8EE44',
                              '&:hover': {
                                backgroundColor: alpha('#C8EE44', 0.2),
                              },
                              '& .MuiListItemIcon-root': {
                                color: '#C8EE44',
                              },
                            },
                            '&:hover': {
                              backgroundColor: theme.background.secondary,
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: isActive(subItem.path) ? '#C8EE44' : theme.text.secondary,
                              minWidth: 32,
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.label}
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem',
                                fontWeight: isActive(subItem.path) ? 600 : 400,
                                color: isActive(subItem.path) ? '#C8EE44' : theme.text.primary,
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </Box>
                )}
              </React.Fragment>
            ))}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.border.primary}` }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: alpha('#E53935', 0.1),
              color: '#E53935',
              '& .MuiListItemIcon-root': {
                color: '#E53935',
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: theme.text.secondary,
              minWidth: 40,
            }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              '& .MuiTypography-root': {
                fontSize: '0.95rem',
                color: theme.text.primary,
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          border: 'none',
          background: 'transparent',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
