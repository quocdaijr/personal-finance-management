# API Documentation

## Overview

The Personal Finance Management System provides two main APIs:
- **Backend API** (Go + Gin): Core business logic and data management
- **Analytics API** (Python + FastAPI): Financial analytics and insights

## Base URLs

| Environment | Backend API | Analytics API |
|-------------|-------------|---------------|
| Development | `http://localhost:8080` | `http://localhost:8000` |
| Production | `https://api.finance-app.com` | `https://analytics.finance-app.com` |

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

### Authentication Flow

1. **Login** to obtain access and refresh tokens
2. **Use access token** for API requests
3. **Refresh token** when access token expires
4. **Logout** to invalidate tokens

## Backend API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and obtain JWT tokens.

**Request:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "analytics_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  }
}
```

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword",
  "first_name": "New",
  "last_name": "User"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User"
  }
}
```

#### POST /api/auth/refresh-token
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

### Account Management

#### GET /api/accounts
Get all user accounts.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "1",
    "name": "Main Checking",
    "type": "checking",
    "balance": 2500.00,
    "currency": "USD",
    "is_default": true,
    "created_at": "2025-01-13T10:00:00Z",
    "updated_at": "2025-01-13T10:00:00Z"
  },
  {
    "id": "2",
    "name": "Savings Account",
    "type": "savings",
    "balance": 10000.00,
    "currency": "USD",
    "is_default": false,
    "created_at": "2025-01-13T10:00:00Z",
    "updated_at": "2025-01-13T10:00:00Z"
  }
]
```

#### POST /api/accounts
Create a new account.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Investment Account",
  "type": "investment",
  "balance": 5000.00,
  "currency": "USD",
  "is_default": false
}
```

**Response:**
```json
{
  "id": "3",
  "name": "Investment Account",
  "type": "investment",
  "balance": 5000.00,
  "currency": "USD",
  "is_default": false,
  "created_at": "2025-01-13T10:00:00Z",
  "updated_at": "2025-01-13T10:00:00Z"
}
```

#### GET /api/accounts/summary
Get account summary with totals.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_accounts": 4,
  "total_assets": 17500.00,
  "total_liabilities": 2500.00,
  "net_worth": 15000.00
}
```

### Transaction Management

#### GET /api/transactions
Get user transactions with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `account_id` (optional): Filter by account ID
- `category` (optional): Filter by category
- `type` (optional): Filter by type (income/expense)
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "amount": -85.50,
    "description": "Grocery shopping",
    "category": "Food & Dining",
    "type": "expense",
    "date": "2025-01-13T14:30:00Z",
    "account_id": "1",
    "tags": ["groceries", "food"],
    "created_at": "2025-01-13T14:30:00Z",
    "updated_at": "2025-01-13T14:30:00Z"
  }
]
```

#### POST /api/transactions
Create a new transaction.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "amount": -25.99,
  "description": "Coffee shop",
  "category": "Food & Dining",
  "type": "expense",
  "date": "2025-01-13T15:05:00Z",
  "account_id": 1,
  "tags": ["coffee", "food"]
}
```

**Response:**
```json
{
  "id": 6,
  "amount": -25.99,
  "description": "Coffee shop",
  "category": "Food & Dining",
  "type": "expense",
  "date": "2025-01-13T15:05:00Z",
  "account_id": "1",
  "tags": ["coffee", "food"],
  "created_at": "2025-01-13T15:05:00Z",
  "updated_at": "2025-01-13T15:05:00Z"
}
```

#### GET /api/transactions/categories
Get available transaction categories.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Income",
  "Other"
]
```

### Budget Management

#### GET /api/budgets
Get user budgets.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "1",
    "name": "Monthly Food Budget",
    "amount": 500.00,
    "spent": 111.49,
    "category": "Food & Dining",
    "period": "monthly",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T23:59:59Z",
    "created_at": "2025-01-13T10:00:00Z",
    "updated_at": "2025-01-13T10:00:00Z"
  }
]
```

#### POST /api/budgets
Create a new budget.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Entertainment Budget",
  "amount": 200.00,
  "category": "Entertainment",
  "period": "monthly",
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-01-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "2",
  "name": "Entertainment Budget",
  "amount": 200.00,
  "spent": 0.00,
  "category": "Entertainment",
  "period": "monthly",
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-01-31T23:59:59Z",
  "created_at": "2025-01-13T15:30:00Z",
  "updated_at": "2025-01-13T15:30:00Z"
}
```

## Analytics API Endpoints

### Financial Overview

#### GET /api/analytics/overview
Get comprehensive financial overview.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_assets": 17500.00,
  "total_liabilities": 2500.00,
  "net_worth": 15000.00,
  "income_30d": 3000.00,
  "expenses_30d": 1200.50,
  "balance_30d": 1799.50,
  "spending_by_category": [
    {
      "category": "Food & Dining",
      "amount": 111.49
    },
    {
      "category": "Transportation",
      "amount": 45.00
    }
  ],
  "total_accounts": 4
}
```

### Transaction Trends

#### GET /api/analytics/transactions/trends
Get transaction trends analysis.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): Analysis period (monthly, quarterly, yearly)
- `months` (optional): Number of months to analyze (default: 12)

**Response:**
```json
{
  "trends": [
    {
      "period": "2024-12",
      "income": 3000.00,
      "expenses": 1200.50,
      "net": 1799.50
    },
    {
      "period": "2025-01",
      "income": 3000.00,
      "expenses": 1350.75,
      "net": 1649.25
    }
  ],
  "total_income": 6000.00,
  "total_expenses": 2551.25,
  "average_monthly_income": 3000.00,
  "average_monthly_expenses": 1275.63
}
```

### Financial Insights

#### GET /api/analytics/insights
Get AI-powered financial insights and recommendations.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "insights": [
    {
      "type": "spending_alert",
      "title": "High Food Spending",
      "description": "Your food spending is 22% above your budget this month.",
      "category": "Food & Dining",
      "priority": "medium"
    },
    {
      "type": "savings_opportunity",
      "title": "Savings Goal Achievement",
      "description": "You're on track to save $500 more than planned this month.",
      "category": "Savings",
      "priority": "low"
    }
  ],
  "generated_at": "2025-01-13T15:45:00Z"
}
```

## Error Responses

All APIs use consistent error response format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Authentication endpoints**: 10 requests per minute
- **Analytics endpoints**: 100 requests per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642089600
```
