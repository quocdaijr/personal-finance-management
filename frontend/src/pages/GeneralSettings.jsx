import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Grid,
  Paper,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Notifications,
  Language,
  Palette,
  Save,
  RestoreFromTrash,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layout';

const GeneralSettings = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  
  // Local state for settings
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      transactions: true,
      budgets: true,
      reports: false,
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US',
      autoSave: true,
      compactView: false,
    },
    privacy: {
      analytics: true,
      crashReports: true,
      marketingEmails: false,
    }
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle settings changes
  const handleNotificationChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: event.target.checked
      }
    }));
  };

  const handlePreferenceChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: event.target.value
      }
    }));
  };

  const handlePrivacyChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: event.target.checked
      }
    }));
  };

  // Save settings
  const handleSaveSettings = () => {
    // Here you would typically save to backend
    localStorage.setItem('generalSettings', JSON.stringify(settings));
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success'
    });
  };

  // Reset to defaults
  const handleResetSettings = () => {
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        desktop: false,
        transactions: true,
        budgets: true,
        reports: false,
      },
      preferences: {
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'US',
        autoSave: true,
        compactView: false,
      },
      privacy: {
        analytics: true,
        crashReports: true,
        marketingEmails: false,
      }
    };
    
    setSettings(defaultSettings);
    setSnackbar({
      open: true,
      message: 'Settings reset to defaults',
      severity: 'info'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={false}
    >
      <Grid container spacing={4}>
          {/* Theme Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Palette sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Theme & Appearance</Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDarkMode}
                      onChange={toggleTheme}
                      icon={<LightMode />}
                      checkedIcon={<DarkMode />}
                    />
                  }
                  label={`${isDarkMode ? 'Dark' : 'Light'} Mode`}
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.preferences.compactView}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, compactView: e.target.checked }
                      }))}
                    />
                  }
                  label="Compact View"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={handleNotificationChange('email')}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push}
                        onChange={handleNotificationChange('push')}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.desktop}
                        onChange={handleNotificationChange('desktop')}
                      />
                    }
                    label="Desktop Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.transactions}
                        onChange={handleNotificationChange('transactions')}
                      />
                    }
                    label="Transaction Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.budgets}
                        onChange={handleNotificationChange('budgets')}
                      />
                    }
                    label="Budget Alerts"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Language & Region */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Language sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Language & Region</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.preferences.language}
                      onChange={handlePreferenceChange('language')}
                      label="Language"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.preferences.currency}
                      onChange={handlePreferenceChange('currency')}
                      label="Currency"
                    >
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                      <MenuItem value="GBP">GBP (£)</MenuItem>
                      <MenuItem value="JPY">JPY (¥)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.preferences.dateFormat}
                      onChange={handlePreferenceChange('dateFormat')}
                      label="Date Format"
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Privacy & Data</Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.analytics}
                        onChange={handlePrivacyChange('analytics')}
                      />
                    }
                    label="Share Analytics Data"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.crashReports}
                        onChange={handlePrivacyChange('crashReports')}
                      />
                    }
                    label="Send Crash Reports"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.marketingEmails}
                        onChange={handlePrivacyChange('marketingEmails')}
                      />
                    }
                    label="Marketing Emails"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.preferences.autoSave}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, autoSave: e.target.checked }
                        }))}
                      />
                    }
                    label="Auto-save Changes"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestoreFromTrash />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </PageLayout>
  );
};

export default GeneralSettings;
