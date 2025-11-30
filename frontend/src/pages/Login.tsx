import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, verify2FA, isAuthenticated, loading, error, requires2FA, tempUsername, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  // Get the page user was trying to access
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Redirect if already authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear error when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requires2FA) {
      await verify2FA(tempUsername || username, twoFactorToken);
    } else {
      await login(username, password);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #2E2B4A 0%, #29263F 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(200, 238, 68, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(200, 238, 68, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
          `,
        }}
      />

      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '3rem',
              fontFamily: 'Gordita, Kumbh Sans, sans-serif',
              mb: 2,
            }}
          >
            Maglo.
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 400,
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            Take control of your financial future with smart money management
          </Typography>
        </Box>

        {/* Features */}
        <Box sx={{ maxWidth: 400 }}>
          {[
            'Track expenses and income in real-time',
            'Manage multiple accounts and cards',
            'Set budgets and financial goals',
            'Secure and encrypted transactions',
          ].map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#C8EE44',
                  mr: 2,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                }}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#2E2B4A',
                fontWeight: 700,
                fontFamily: 'Gordita, Kumbh Sans, sans-serif',
                mb: 1,
              }}
            >
              Maglo.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(46, 43, 74, 0.7)',
              }}
            >
              Financial Management
            </Typography>
          </Box>

          {/* Form Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#1B212D',
                fontWeight: 600,
                fontSize: '1.75rem',
                mb: 1,
              }}
            >
              {requires2FA ? 'Two-Factor Authentication' : 'Welcome Back'}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(27, 33, 45, 0.6)',
                fontSize: '1rem',
              }}
            >
              {requires2FA
                ? 'Enter the verification code from your authenticator app'
                : 'Sign in to your account to continue'
              }
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {!requires2FA ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA',
                      '& fieldset': {
                        borderColor: 'rgba(27, 33, 45, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(27, 33, 45, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#C8EE44',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(27, 33, 45, 0.6)',
                      '&.Mui-focused': {
                        color: '#C8EE44',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{
                            color: 'rgba(27, 33, 45, 0.6)',
                            '&:hover': {
                              color: 'rgba(27, 33, 45, 0.8)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#FAFAFA',
                      '& fieldset': {
                        borderColor: 'rgba(27, 33, 45, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(27, 33, 45, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#C8EE44',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(27, 33, 45, 0.6)',
                      '&.Mui-focused': {
                        color: '#C8EE44',
                      },
                    },
                  }}
                />
              </>
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="token"
                label="Authentication Code"
                name="token"
                autoFocus
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                helperText="Enter the 6-digit code from your authenticator app"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#FAFAFA',
                    '& fieldset': {
                      borderColor: 'rgba(27, 33, 45, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(27, 33, 45, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#C8EE44',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(27, 33, 45, 0.6)',
                    '&.Mui-focused': {
                      color: '#C8EE44',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(27, 33, 45, 0.6)',
                    fontSize: '0.875rem',
                  },
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#C8EE44',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(200, 238, 68, 0.3)',
                '&:hover': {
                  backgroundColor: '#B8DE34',
                  boxShadow: '0 6px 16px rgba(200, 238, 68, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(200, 238, 68, 0.5)',
                  color: 'rgba(0, 0, 0, 0.5)',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {loading ? 'Please wait...' : requires2FA ? 'Verify Code' : 'Sign In'}
            </Button>

            {!requires2FA && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(27, 33, 45, 0.6)',
                    fontSize: '0.875rem',
                  }}
                >
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      textDecoration: 'none',
                      color: '#C8EE44',
                      fontWeight: 500,
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            )}

            {/* Additional Links */}
            {!requires2FA && (
              <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid rgba(27, 33, 45, 0.1)' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(27, 33, 45, 0.6)',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  Forgot your password?{' '}
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: 'none',
                      color: '#C8EE44',
                      fontWeight: 500,
                    }}
                  >
                    Reset it here
                  </Link>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
