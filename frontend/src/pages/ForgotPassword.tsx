import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack, Email } from '@mui/icons-material';
import authService from '../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2E2B4A 0%, #29263F 100%)',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 3,
          p: 4,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Back Link */}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#666' }}>
            <ArrowBack sx={{ fontSize: 20, mr: 1 }} />
            <Typography variant="body2">Back to Login</Typography>
          </Box>
        </Link>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'rgba(200, 238, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Email sx={{ fontSize: 30, color: '#C8EE44' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1B212D', mb: 1 }}>
            Forgot Password?
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(27, 33, 45, 0.6)' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
        </Box>

        {/* Success Message */}
        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            If an account exists with this email, you will receive a password reset link shortly.
            Please check your inbox and spam folder.
          </Alert>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email}
                sx={{
                  py: 1.5,
                  backgroundColor: '#C8EE44',
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#B8DE34' },
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Box>
          </>
        )}

        {/* Additional Links */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(27, 33, 45, 0.6)' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#C8EE44', fontWeight: 500 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;

