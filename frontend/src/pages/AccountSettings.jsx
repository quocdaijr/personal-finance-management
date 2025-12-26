import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Person,
  Security,
  Email,
  Lock,
  Shield,
  Edit,
  Save,
  Cancel,
  Delete,
  PhotoCamera,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { PageLayout } from "../components/layout";

const AccountSettings = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Local state for profile editing
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    username: user?.username || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: user?.two_factor_enabled || false,
    emailVerified: user?.is_email_verified || false,
    loginNotifications: true,
    sessionTimeout: 30,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle profile data changes
  const handleProfileChange = (field) => (event) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle password data changes
  const handlePasswordChange = (field) => (event) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle security settings changes
  const handleSecurityChange = (field) => (event) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: event.target.checked || event.target.value,
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(profileData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to update profile",
        severity: "error",
      });
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: "Password must be at least 8 characters long",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setSnackbar({
        open: true,
        message: "Password changed successfully!",
        severity: "success",
      });
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to change password",
        severity: "error",
      });
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    const newState = !securitySettings.twoFactorEnabled;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/2fa/${newState ? "enable" : "disable"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update 2FA settings");
      }

      setSecuritySettings((prev) => ({
        ...prev,
        twoFactorEnabled: newState,
      }));

      setSnackbar({
        open: true,
        message: `Two-factor authentication ${newState ? "enabled" : "disabled"}`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to update 2FA settings",
        severity: "error",
      });
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      setSnackbar({
        open: true,
        message: "Account deletion initiated. You will be logged out shortly.",
        severity: "info",
      });
      setShowDeleteDialog(false);

      // Log out after 2 seconds
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete account",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <PageLayout maxWidth="xl" showSearch={false}>
      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Person sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Profile Information</Typography>
                </Box>
                <Button
                  variant={isEditing ? "outlined" : "contained"}
                  startIcon={isEditing ? <Cancel /> : <Edit />}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.first_name}
                    onChange={handleProfileChange("first_name")}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.last_name}
                    onChange={handleProfileChange("last_name")}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileData.username}
                    onChange={handleProfileChange("username")}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange("email")}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Picture */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile Picture
              </Typography>
              <Box
                sx={{ position: "relative", display: "inline-block", mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: "2rem",
                    fontWeight: 600,
                  }}
                >
                  {user?.first_name?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "U"}
                </Avatar>
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Click the camera icon to upload a new profile picture
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Security sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Security & Privacy</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.twoFactorEnabled}
                          onChange={handleToggle2FA}
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4 }}
                    >
                      Add an extra layer of security to your account
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.emailVerified}
                          disabled
                        />
                      }
                      label="Email Verified"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4 }}
                    >
                      Your email address has been verified
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.loginNotifications}
                          onChange={handleSecurityChange("loginNotifications")}
                        />
                      }
                      label="Login Notifications"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4 }}
                    >
                      Get notified when someone logs into your account
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Lock />}
                      onClick={() => setShowPasswordDialog(true)}
                      fullWidth
                    >
                      Change Password
                    </Button>

                    <Button variant="outlined" startIcon={<Email />} fullWidth>
                      Resend Verification Email
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: "1px solid", borderColor: "error.main" }}>
            <CardContent>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. Please be
                certain.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange("currentPassword")}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange("newPassword")}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange("confirmPassword")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be
            undone and all your data will be permanently lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default AccountSettings;
