const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'your-secret-key';

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add OPTIONS handling for all routes
app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint is working' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test endpoint is working' });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  // Generate JWT token
  const token = jwt.sign(
    { user_id: 1, username: 'test' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const analyticsToken = jwt.sign(
    { user_id: 1, username: 'test' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    access_token: token,
    refresh_token: 'test-refresh-token',
    analytics_token: analyticsToken,
    expires_in: 3600,
    token_type: 'Bearer',
    user: {
      id: 1,
      username: 'test',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      is_email_verified: true,
      two_factor_enabled: false,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({
    id: 1,
    username: 'test',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    is_email_verified: false,
    two_factor_enabled: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  });
});

// Transaction endpoints
app.get('/api/transactions', (req, res) => {
  res.json([
    {
      id: '1',
      amount: 100.0,
      description: 'Test transaction',
      category: 'Food & Dining',
      type: 'expense',
      date: '2023-01-01T00:00:00Z',
      account_id: '1',
      tags: ['food', 'dining'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ]);
});

app.post('/api/transactions', (req, res) => {
  res.status(201).json({
    id: '2',
    amount: 200.0,
    description: 'New transaction',
    category: 'Shopping',
    type: 'expense',
    date: '2023-01-02T00:00:00Z',
    account_id: '1',
    tags: ['shopping'],
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  });
});

app.get('/api/transactions/categories', (req, res) => {
  res.json([
    'Food & Dining',
    'Shopping',
    'Housing',
    'Transportation',
    'Entertainment',
    'Health & Fitness',
    'Travel',
    'Education',
    'Personal Care',
    'Gifts & Donations',
    'Bills & Utilities',
    'Income',
    'Investments',
    'Uncategorized',
  ]);
});

app.get('/api/transactions/summary', (req, res) => {
  res.json({
    income: 1000.0,
    expenses: 500.0,
    balance: 500.0,
    count: 10,
    by_category: [
      {
        category: 'Food & Dining',
        amount: 200.0,
        count: 5,
      },
      {
        category: 'Shopping',
        amount: 150.0,
        count: 3,
      },
      {
        category: 'Transportation',
        amount: 100.0,
        count: 2,
      },
    ],
  });
});

// Account endpoints
app.get('/api/accounts', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Checking Account',
      type: 'checking',
      balance: 1000.0,
      currency: 'USD',
      is_default: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ]);
});

app.post('/api/accounts', (req, res) => {
  res.status(201).json({
    id: '2',
    name: 'Savings Account',
    type: 'savings',
    balance: 5000.0,
    currency: 'USD',
    is_default: false,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  });
});

app.get('/api/accounts/types', (req, res) => {
  res.json([
    {
      id: 'checking',
      name: 'Checking Account',
    },
    {
      id: 'savings',
      name: 'Savings Account',
    },
    {
      id: 'credit',
      name: 'Credit Card',
    },
    {
      id: 'investment',
      name: 'Investment Account',
    },
    {
      id: 'cash',
      name: 'Cash',
    },
    {
      id: 'other',
      name: 'Other',
    },
  ]);
});

app.get('/api/accounts/summary', (req, res) => {
  res.json({
    total_accounts: 2,
    total_assets: 6000.0,
    total_liabilities: 0.0,
    net_worth: 6000.0,
  });
});

// Budget endpoints
app.get('/api/budgets', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Food Budget',
      amount: 500.0,
      spent: 200.0,
      category: 'Food & Dining',
      period: 'monthly',
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-01-31T23:59:59Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ]);
});

app.post('/api/budgets', (req, res) => {
  res.status(201).json({
    id: '2',
    name: 'Shopping Budget',
    amount: 300.0,
    spent: 0.0,
    category: 'Shopping',
    period: 'monthly',
    start_date: '2023-01-01T00:00:00Z',
    end_date: '2023-01-31T23:59:59Z',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  });
});

app.get('/api/budgets/periods', (req, res) => {
  res.json([
    {
      id: 'monthly',
      name: 'Monthly',
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
    },
    {
      id: 'yearly',
      name: 'Yearly',
    },
  ]);
});

app.get('/api/budgets/summary', (req, res) => {
  res.json({
    total_budgeted: 800.0,
    total_spent: 200.0,
    total_remaining: 600.0,
    overall_progress: 25,
    total_budgets: 2,
    budgets_near_limit: 0,
    budgets_over_limit: 0,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
