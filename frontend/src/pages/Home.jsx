import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import authService from '../services/authService';

const Home = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  return (
    <Container maxWidth="lg">
      {/* Hero section */}
      <Paper 
        sx={{ 
          p: 6, 
          mb: 6, 
          borderRadius: 2,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Take Control of Your Finances
        </Typography>
        <Typography variant="h6" paragraph>
          Track expenses, manage accounts, and achieve your financial goals with our easy-to-use finance management app.
        </Typography>
        <Box sx={{ mt: 4 }}>
          {isAuthenticated ? (
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to="/dashboard"
              sx={{ px: 4, py: 1.5 }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="large"
                component={RouterLink}
                to="/login"
                sx={{ px: 4, py: 1.5 }}
              >
                Login
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Features section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Everything you need to manage your personal finances in one place
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  color: 'primary.main'
                }}>
                  <ReceiptLongIcon sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Track Transactions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Easily record and categorize your income and expenses. Get insights into your spending habits with detailed reports and analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  color: 'primary.main'
                }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Manage Accounts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Keep track of all your financial accounts in one place. Monitor balances, track net worth, and get a complete picture of your finances.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  color: 'primary.main'
                }}>
                  <TrendingUpIcon sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Budget Planning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create and manage budgets for different categories. Stay on track with your financial goals and get alerts when you're approaching your limits.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Call to action */}
      {!isAuthenticated && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 6, bgcolor: 'background.default' }}>
          <Typography variant="h5" gutterBottom>
            Ready to take control of your finances?
          </Typography>
          <Typography variant="body1" paragraph>
            Join thousands of users who have improved their financial health with our app.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            component={RouterLink}
            to="/register"
          >
            Create Free Account
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default Home;
