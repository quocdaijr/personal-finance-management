import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import authService from '../services/authService';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerifying(false);
        setError('Invalid or missing verification token.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setSuccess(true);
        if (response.user?.email) {
          setEmail(response.user.email);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify email. The link may be expired.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      await authService.resendVerification(email);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const getIcon = () => {
    if (verifying) return <CircularProgress size={30} sx={{ color: '#C8EE44' }} />;
    if (success) return <CheckCircle sx={{ fontSize: 30, color: '#4CAF50' }} />;
    return <Error sx={{ fontSize: 30, color: '#f44336' }} />;
  };

  const getIconBg = () => {
    if (verifying) return 'rgba(200, 238, 68, 0.2)';
    if (success) return 'rgba(76, 175, 80, 0.2)';
    return 'rgba(244, 67, 54, 0.2)';
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
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: getIconBg(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          {getIcon()}
        </Box>

        {/* Title and Message */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1B212D', mb: 1 }}>
          {verifying ? 'Verifying Email...' : success ? 'Email Verified!' : 'Verification Failed'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(27, 33, 45, 0.6)', mb: 3 }}>
          {verifying
            ? 'Please wait while we verify your email address.'
            : success
            ? 'Your email has been successfully verified. You can now log in.'
            : error}
        </Typography>

        {/* Success State */}
        {success && (
          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="contained"
            sx={{ py: 1.5, backgroundColor: '#C8EE44', color: '#000', fontWeight: 600, '&:hover': { backgroundColor: '#B8DE34' }, mb: 2 }}
          >
            Go to Login
          </Button>
        )}

        {/* Error State with Resend Option */}
        {!verifying && !success && (
          <>
            {resendSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Verification email sent! Please check your inbox.
              </Alert>
            ) : (
              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="contained"
                sx={{ py: 1.5, backgroundColor: '#C8EE44', color: '#000', fontWeight: 600, '&:hover': { backgroundColor: '#B8DE34' } }}
              >
                Back to Login
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmail;

