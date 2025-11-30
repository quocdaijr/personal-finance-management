import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { ArrowBack, Lock, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import authService from '../services/authService';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #2E2B4A 0%, #29263F 100%)', p: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 400, background: 'rgba(255, 255, 255, 0.95)', borderRadius: 3, p: 4 }}>
          <Alert severity="error">
            Invalid or missing reset token. Please request a new password reset link.
          </Alert>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link to="/forgot-password" style={{ color: '#C8EE44', fontWeight: 500 }}>
              Request New Reset Link
            </Link>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #2E2B4A 0%, #29263F 100%)', p: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 400, background: 'rgba(255, 255, 255, 0.95)', borderRadius: 3, p: 4, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#666' }}>
            <ArrowBack sx={{ fontSize: 20, mr: 1 }} />
            <Typography variant="body2">Back to Login</Typography>
          </Box>
        </Link>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(200, 238, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            {success ? <CheckCircle sx={{ fontSize: 30, color: '#4CAF50' }} /> : <Lock sx={{ fontSize: 30, color: '#C8EE44' }} />}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1B212D', mb: 1 }}>
            {success ? 'Password Reset!' : 'Reset Your Password'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(27, 33, 45, 0.6)' }}>
            {success ? 'Your password has been successfully reset. Redirecting to login...' : 'Enter your new password below.'}
          </Typography>
        </Box>

        {success ? (
          <Alert severity="success">Password reset successful! Redirecting to login...</Alert>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.5, backgroundColor: '#C8EE44', color: '#000', fontWeight: 600, '&:hover': { backgroundColor: '#B8DE34' } }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResetPassword;

