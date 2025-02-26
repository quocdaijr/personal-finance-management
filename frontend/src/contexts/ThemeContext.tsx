import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Light theme colors - matching Figma design exactly
  const lightTheme = {
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF',
      secondary: '#F8F9FA',
    },
    text: {
      primary: '#1B212D',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    border: {
      primary: '#E5E7EB',
      secondary: '#F3F4F6',
    },
    card: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      hoverShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    },
  };

  // Dark theme colors - matching Figma design
  const darkTheme = {
    background: {
      default: '#1C1A2E',
      paper: '#201E34',
      secondary: '#282541',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    border: {
      primary: '#282541',
      secondary: 'rgba(255, 255, 255, 0.1)',
    },
    card: {
      background: '#201E34',
      border: '#282541',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      hoverShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#C8EE44',
        contrastText: '#000000',
      },
      secondary: {
        main: isDarkMode ? '#2E2B4A' : '#1B212D',
      },
      background: {
        default: currentTheme.background.default,
        paper: currentTheme.background.paper,
      },
      text: {
        primary: currentTheme.text.primary,
        secondary: currentTheme.text.secondary,
      },
      success: {
        main: '#4CAF50',
      },
      error: {
        main: '#E53935',
      },
      warning: {
        main: '#FBC02D',
      },
      info: {
        main: '#2196F3',
      },
    },
    typography: {
      fontFamily: 'Kumbh Sans, Gordita, -apple-system, BlinkMacSystemFont, sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      body1: {
        fontWeight: 400,
      },
      body2: {
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: currentTheme.background.default,
            minHeight: '100vh',
            color: currentTheme.text.primary,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: currentTheme.card.background,
            border: `1px solid ${currentTheme.card.border}`,
            boxShadow: currentTheme.card.shadow,
            color: currentTheme.text.primary,
            '&:hover': {
              boxShadow: currentTheme.card.hoverShadow,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 600,
            padding: '12px 24px',
          },
          contained: {
            backgroundColor: '#C8EE44',
            color: '#1B212D',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#B8DE34',
              boxShadow: 'none',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: currentTheme.background.secondary,
              borderRadius: 15,
              '& fieldset': {
                borderColor: currentTheme.border.primary,
              },
              '&:hover fieldset': {
                borderColor: currentTheme.border.secondary,
              },
              '&.Mui-focused fieldset': {
                borderColor: '#C8EE44',
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: currentTheme.card.background,
            border: `1px solid ${currentTheme.card.border}`,
            borderRadius: 15,
            boxShadow: currentTheme.card.shadow,
            color: currentTheme.text.primary,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: currentTheme.text.primary,
          },
        },
      },
    },
  });

  const value = {
    isDarkMode,
    toggleTheme,
    theme: currentTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
