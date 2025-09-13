# Personal Finance Management System

A comprehensive personal finance management application built with modern web technologies. This system has been fully modernized with proper API-based architecture, real database operations, and comprehensive analytics.

## Architecture

This application follows a microservices architecture with the following components:

- **Backend**: Go (Gin framework) - RESTful API server with JWT authentication
- **Analytics**: Python (FastAPI) - Data analytics and financial insights
- **Frontend**: React with TypeScript - User interface (ready for integration)
- **Database**: SQLite (development) / PostgreSQL (production) - Data persistence

## Features

✅ **Implemented and Working:**
- Complete user authentication and authorization with JWT tokens
- Account management (checking, savings, credit cards, investment accounts)
- Transaction tracking with full CRUD operations
- Budget creation and monitoring with spending tracking
- Financial analytics and insights with real-time data
- Comprehensive API endpoints with proper error handling
- Input validation and security middleware
- Database seeding with realistic test data

## Getting Started

### Prerequisites

- Go 1.19+
- Python 3.9+
- Node.js 16+ (for frontend development)

### Quick Start (Development)

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-finance-management
```

2. Start the backend service:
```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

3. Start the analytics service:
```bash
cd analytics
pip install -r requirements.txt
python main.py
```

The application will be available at:
- Backend API: http://localhost:8080
- Analytics API: http://localhost:8000
- Frontend: http://localhost:3000 (when started)

### Test the APIs

1. Register a new user or use the test user:
```bash
# Login with test user
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

2. Use the returned token to access protected endpoints:
```bash
# Get accounts
curl -X GET http://localhost:8080/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get financial overview
curl -X GET http://localhost:8000/api/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/setup-2fa` - Setup two-factor authentication

### Account Endpoints

- `GET /api/accounts` - Get user accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/summary` - Get account summary
- `GET /api/accounts/types` - Get available account types
- `GET /api/accounts/:id` - Get specific account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transaction Endpoints

- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/summary` - Get transaction summary
- `GET /api/transactions/categories` - Get transaction categories
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Endpoints

- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/summary` - Get budget summary
- `GET /api/budgets/periods` - Get budget periods
- `GET /api/budgets/:id` - Get specific budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics Endpoints

- `GET /api/analytics/overview` - Financial overview with assets, liabilities, and spending
- `GET /api/analytics/transactions/trends` - Transaction trends analysis
- `GET /api/analytics/insights` - AI-powered financial insights and recommendations

## Environment Configuration

### Backend (.env)
```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=finance-management
DB_SSLMODE=disable
USE_SQLITE=true

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_EXPIRY_HOURS=24

# Application Configuration
APP_NAME=Finance Management
```

### Analytics (.env)
```
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Database Configuration
USE_SQLITE=true
```

## Database

The application uses SQLite for development (automatically created) and supports PostgreSQL for production. The database is automatically seeded with test data including:

- Test user: `testuser` / `password123`
- Sample accounts (checking, savings, credit card)
- Sample transactions across different categories
- Sample budgets with spending tracking

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting middleware
- XSS protection

## Development Notes

- All mock data and temporary implementations have been removed
- Real database operations with proper error handling
- Comprehensive logging and monitoring
- API-first architecture with proper separation of concerns
- Ready for frontend integration

## Testing

The system includes comprehensive test data and all endpoints have been validated:
- Authentication flow works correctly
- CRUD operations for all entities
- Analytics endpoints provide real insights
- Error handling and validation working properly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all endpoints
5. Submit a pull request

## License

This project is licensed under the MIT License.