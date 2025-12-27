# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development with Docker (Recommended)
```bash
# Start all services (Frontend, Backend, Analytics)
docker-compose -f docker-compose.dev.yml up

# Validate Docker setup before starting
./scripts/test-docker-setup.sh

# Test API integration
./scripts/test-api-integration.sh
```

### Running Services Individually

**Backend (Go + Gin):**
```bash
cd backend
go run cmd/api/main.go
# Server runs on http://localhost:8080
```

**Analytics (Python + FastAPI):**
```bash
cd analytics
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
# Dev server runs on http://localhost:3000
```

### Building Services

```bash
# Backend
cd backend && go build -o main ./cmd/api

# Frontend
cd frontend && npm run build

# Preview frontend production build
cd frontend && npm run preview
```

## Architecture Overview

This is a **microservices application** with three independent services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Analytics     │
│   React + TS    │◄──►│   Go + Gin      │◄──►│ Python FastAPI  │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────►│    Database     │◄─────────────┘
                        │ SQLite/PostgreSQL│
                        │   Port: 5432    │
                        └─────────────────┘
```

**Service Communication:**
- Frontend proxies `/api` → Backend (8080)
- Frontend proxies `/analytics` → Analytics (8000), rewritten to `/api/analytics`
- All services share JWT authentication with same secret
- Backend and Analytics both access the same database

**Database Strategy:**
- **Development**: SQLite (set `USE_SQLITE=true` in `.env`)
- **Production**: PostgreSQL (set `USE_SQLITE=false` and provide DB credentials)

## Backend (Go + Gin)

**Entry Point:** `backend/cmd/api/main.go`

### Layered Architecture

```
backend/
├── cmd/api/           # Application entry point
├── internal/
│   ├── api/
│   │   ├── handlers/  # HTTP request handlers (15 handlers)
│   │   ├── middleware/# Auth, CORS, validation, rate limiting, logging
│   │   └── routes/    # Route definitions
│   ├── domain/
│   │   ├── models/    # Data models (11 models)
│   │   ├── services/  # Business logic (11 services)
│   │   └── repositories/ # Data access interfaces
│   ├── repository/    # Repository implementations (10 repos)
│   ├── infrastructure/# Database setup, seeding
│   ├── config/        # Configuration loading
│   └── utils/         # JWT, password, 2FA, context helpers
```

**Request Flow:** HTTP Request → Middleware → Handler → Service → Repository → Database

### API Endpoints (40+)

**Authentication (No Auth Required):**
- `POST /api/auth/register`, `/api/auth/login`, `/api/auth/refresh-token`
- `POST /api/auth/verify-2fa`, `/api/auth/forgot-password`, `/api/auth/reset-password`

**Protected Endpoints (JWT Required):**
- Accounts: `GET/POST/PUT/DELETE /api/accounts`, `/api/accounts/summary`
- Transactions: `GET/POST/PUT/DELETE /api/transactions`, `/api/transactions/search`, `/api/transactions/transfer`
- Budgets: `GET/POST/PUT/DELETE /api/budgets`, `/api/budgets/summary`
- Goals: `GET/POST/PUT/DELETE /api/goals`, `/api/goals/:id/contribute`
- Recurring Transactions: `GET/POST/PUT/DELETE /api/recurring-transactions`, `PATCH /api/recurring-transactions/:id/toggle`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`
- Categories, Balance History, Currencies, Import/Export, Search

**Health Check:** `GET /health`

### Middleware Stack

1. **CORS** - Allows localhost:3000 and localhost:5173
2. **AuthMiddleware** - JWT validation, extracts user_id to context
3. **SanitizeInput** - XSS prevention
4. **ValidateContentType** - Enforces `application/json`
5. **RateLimitMiddleware** - IP-based rate limiting

### Key Patterns

- **Repository Pattern**: Data access abstracted through interfaces
- **Service Layer**: Business logic separated from HTTP handlers
- **Context-based User ID**: `c.Get("user_id")` extracts authenticated user
- **GORM Auto-Migration**: Database schema auto-created on startup
- **Hot Reload**: Uses `air` tool configured in `.air.toml`

## Analytics Service (Python + FastAPI)

**Entry Point:** `analytics/main.py`

### API Endpoints (3 main)

1. `GET /api/analytics/overview` - Total assets, liabilities, net worth, 30-day trends
2. `GET /api/analytics/transactions/trends?period=week|month|year` - Transaction trends with moving averages
3. `GET /api/analytics/insights` - Spending patterns, budget alerts, recommendations

### Architecture

- **FastAPI** web framework with Uvicorn server
- **SQLAlchemy** ORM (shares database with backend)
- **Pandas** for data analysis and aggregation
- **JWT Authentication** validates tokens using same `JWT_SECRET` as backend

### Key Modules

- `transaction_analytics.py` - Transaction analysis and trends
- `account_analytics.py` - Account balance history
- `budget_analytics.py` - Budget performance tracking
- `financial_insights.py` - AI-generated insights and recommendations

## Frontend (React + TypeScript + Vite)

**Entry Point:** `frontend/src/main.tsx`

### Architecture

```
frontend/src/
├── components/        # Feature-based components (dashboard, transactions, accounts, etc.)
├── pages/            # Route-level page components
├── services/         # 16 API client modules
├── contexts/         # 3 React Context providers
│   ├── AuthContext.tsx           # JWT authentication state
│   ├── ThemeContext.tsx          # Dark/light theme
│   └── UserPreferencesContext.tsx # Currency, language, date format
├── i18n/             # Internationalization (i18next)
├── types/            # TypeScript type definitions
└── App.tsx           # React Router setup with protected routes
```

### Routing (React Router v7)

**Public Routes:**
- `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`

**Protected Routes (Behind ProtectedRoute Component):**
- `/dashboard` - Financial overview
- `/transactions` - Transaction management
- `/accounts` - Account management
- `/budgets` - Budget tracking
- `/goals` - Financial goals
- `/recurring` - Recurring transactions
- `/profile`, `/settings/*` - User settings

### Service Layer (16 API Clients)

All API calls abstracted through service modules in `src/services/`:
- `authService.js` - Authentication
- `accountService.js`, `transactionService.js`, `budgetService.js`, `goalService.js`
- `analyticsService.js` - Analytics data
- `currencyService.js`, `balanceHistoryService.js`, `notificationService.js`
- `importService.js`, `exportService.js`, `searchService.js`

### Vite Configuration (`vite.config.ts`)

**API Proxying:**
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8080',           // Backend
    '/analytics': {
      target: 'http://localhost:8000',          // Analytics
      rewrite: (path) => path.replace(/^\/analytics/, '/api/analytics')
    }
  }
}
```

**Key Features:**
- HMR on port 8097 for Docker compatibility
- Code splitting: vendor (React), MUI, utils
- Development server on port 3000 (strict mode)

## Service Integration

### Authentication Flow

1. User logs in via `POST /api/auth/login` → Backend returns JWT token
2. Frontend stores token in AuthContext
3. All subsequent requests include `Authorization: Bearer {token}` header
4. Backend AuthMiddleware validates token, extracts `user_id`
5. Analytics service validates same token using shared `JWT_SECRET`

### Data Flow

```
User Action → Frontend Service → Vite Proxy → Backend/Analytics → Database
                                    ↓
                            /api → :8080 (Backend)
                            /analytics → :8000 (Analytics)
```

### Multi-Tenancy

All queries filtered by `user_id` from JWT token:
- Backend: `c.Get("user_id")` from middleware context
- Analytics: User ID extracted from JWT payload
- Database: All models include user associations

## Configuration & Environment

### Backend `.env` (Required Variables)

```bash
# Database
DB_HOST=localhost                # 'db' in Docker
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=finance-management
DB_SSLMODE=disable
USE_SQLITE=false                 # true for SQLite, false for PostgreSQL

# JWT Secrets (MUST match between backend and analytics)
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_EXPIRY_HOURS=24

# Application
APP_NAME=Finance Management
ENVIRONMENT=development
BASE_URL=http://localhost:3000
PORT=8080
```

### Analytics `.env` (Required Variables)

```bash
# Database (same as backend)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=finance-management
USE_SQLITE=false

# JWT Secret (MUST match backend)
JWT_SECRET=your-secret-key-change-in-production

# Application
PORT=8000
PYTHONUNBUFFERED=1
RELOAD=true
```

### Frontend Environment Variables

Set via Vite (prefix with `VITE_`):
```bash
VITE_API_URL=http://localhost:8080
VITE_ANALYTICS_URL=http://localhost:8000
VITE_APP_VERSION=1.0.0
```

## Key Development Patterns

### Backend (Go)

- **Clean Architecture**: Separation of handlers, services, repositories
- **Repository Pattern**: Data access abstracted through interfaces
- **Dependency Injection**: Services and repositories injected into handlers
- **Middleware Chain**: Authentication → Validation → Rate Limiting → Handlers
- **Error Handling**: Consistent JSON error responses

### API Design

- **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **User Context**: All protected endpoints access `user_id` from JWT
- **Pagination**: Not currently implemented (future enhancement)
- **Filtering**: Query parameters for search and filtering
- **Validation**: Request body validation in handlers

### Frontend (React)

- **Service Layer**: All API calls through dedicated service modules
- **Context API**: Global state management for Auth, Theme, Preferences
- **Protected Routes**: ProtectedRoute component wraps authenticated pages
- **Type Safety**: TypeScript for compile-time type checking
- **i18n**: Internationalization with language preferences

### Authentication

- **JWT with Refresh Tokens**: Main token expires in 24h, refresh for rotation
- **Two-Factor Authentication**: OTP-based 2FA support
- **Password Reset**: Email-based password reset workflow
- **Email Verification**: Email verification on registration

### Multi-Currency Support

- User preferences stored in database: `currency`, `language`, `date_format`
- Currency conversion available via `/api/currencies/convert` endpoint
- Frontend adapts display based on user preferences

## Database Schema (11 Models)

**Core Models:**
- **User** - Authentication, preferences (currency, language, 2FA)
- **Account** - Bank accounts with balance tracking (checking, savings, credit, investment)
- **Transaction** - Financial transactions (income, expense, transfer)
- **Budget** - Budget tracking by category and period (monthly, quarterly, yearly)
- **Category** - Transaction categories (custom per user)
- **Goal** - Financial goals with progress tracking
- **RecurringTransaction** - Automated recurring transactions
- **Notification** - User notifications and alerts
- **BalanceHistory** - Historical balance snapshots for trend analysis
- **PasswordResetToken** - Password reset workflow
- **EmailVerificationToken** - Email verification workflow

**Migration:** GORM auto-migrates on backend startup. Analytics uses SQLAlchemy models that mirror GORM models.

## Testing

### Backend Testing

- **Repository Tests**: `backend/cmd/repotest/` - Test repository implementations
- **Database Tests**: `backend/cmd/dbtest/` - Database connectivity tests
- **No Unit Tests**: Currently no `_test.go` files (manual testing used)

### Integration Testing

```bash
# Validate Docker setup
./scripts/test-docker-setup.sh

# Test API endpoints
./scripts/test-api-integration.sh
```

### Frontend Testing

- **No Test Framework**: Currently no Jest/Vitest configuration
- **Manual Testing**: Test via browser during development

## Common Development Tasks

### Running a Single Test

Backend repository tests:
```bash
cd backend
go run cmd/repotest/main.go
```

### Hot Reload Development

Backend with Air:
```bash
cd backend
air -c .air.toml
# Auto-reloads on .go file changes
```

Frontend with Vite HMR:
```bash
cd frontend
npm run dev
# Auto-reloads on file changes
```

### Adding a New API Endpoint

1. Define route in `backend/internal/api/routes/routes.go`
2. Create handler in `backend/internal/api/handlers/`
3. Implement service logic in `backend/internal/domain/services/`
4. Add repository method if needed in `backend/internal/repository/`
5. Update frontend service in `frontend/src/services/`

### Database Migration

GORM auto-migrates on startup. To add a new model:
1. Create model struct in `backend/internal/domain/models/`
2. Add to migration list in `backend/cmd/api/main.go`
3. Restart backend - tables created automatically

### Debugging

**Backend (Delve):**
- Docker exposes debugger on port 2345
- Use Delve or IDE debugger

**Analytics (debugpy):**
- Docker exposes debugger on port 5678
- Use Python debugger or IDE

**Frontend (React DevTools):**
- Install React DevTools browser extension
- HMR available on port 8097
