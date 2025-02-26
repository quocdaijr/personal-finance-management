import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layout';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] = useState<{
    secret: string;
    qrCodeUrl: string;
  } | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [disableTwoFactorDialog, setDisableTwoFactorDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.put('/api/profile', {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
      });
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.put('/api/profile/password', {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      
      setSuccess('Password updated successfully');
      
      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const setupTwoFactor = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/profile/2fa/setup');
      setTwoFactorData(response.data);
      setShowTwoFactorDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to setup two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactor = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/profile/2fa/verify', {
        token: twoFactorToken,
      });
      
      setSuccess('Two-factor authentication enabled successfully');
      setShowTwoFactorDialog(false);
      
      // Force a page reload to update the user data
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify token');
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete('/api/profile/2fa');
      
      setSuccess('Two-factor authentication disabled successfully');
      setDisableTwoFactorDialog(false);
      
      // Force a page reload to update the user data
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      maxWidth="md"
      showSearch={false}
    >
      <Box
          sx={{
            marginBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              centered
            >
              <Tab label="Profile" />
              <Tab label="Security" />
            </Tabs>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ m: 2 }}>
              {success}
            </Alert>
          )}
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            <Box component="form" onSubmit={handleProfileSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="username"
                    label="Username"
                    value={user?.username || ''}
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email"
                    value={user?.email || ''}
                    disabled
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            
            <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="oldPassword"
                    label="Current Password"
                    type={showOldPassword ? 'text' : 'password'}
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            edge="end"
                          >
                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h6" gutterBottom>
              Two-Factor Authentication
            </Typography>
            
            <Typography variant="body2" paragraph>
              Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
            </Typography>
            
            {user?.two_factor_enabled ? (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Status:</strong> Enabled
                </Typography>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDisableTwoFactorDialog(true)}
                  disabled={loading}
                >
                  Disable Two-Factor Authentication
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Status:</strong> Disabled
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={setupTwoFactor}
                  disabled={loading}
                >
                  Enable Two-Factor Authentication
                </Button>
              </>
            )}
          </TabPanel>
        </Paper>
      </Box>
      
      {/* Two-Factor Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onClose={() => setShowTwoFactorDialog(false)}>
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Scan the QR code below with your authenticator app (like Google Authenticator or Authy), then enter the 6-digit code provided by the app.
          </DialogContentText>
          
          {twoFactorData && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img src={twoFactorData.qrCodeUrl} alt="QR Code" style={{ maxWidth: '100%' }} />
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                If you can't scan the QR code, enter this code manually: <strong>{twoFactorData.secret}</strong>
              </Typography>
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="token"
            label="Authentication Code"
            type="text"
            fullWidth
            value={twoFactorToken}
            onChange={(e) => setTwoFactorToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTwoFactorDialog(false)}>Cancel</Button>
          <Button onClick={verifyTwoFactor} disabled={loading || twoFactorToken.length !== 6}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Disable Two-Factor Dialog */}
      <Dialog open={disableTwoFactorDialog} onClose={() => setDisableTwoFactorDialog(false)}>
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisableTwoFactorDialog(false)}>Cancel</Button>
          <Button onClick={disableTwoFactor} color="error" disabled={loading}>
            {loading ? 'Disabling...' : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default Profile;
