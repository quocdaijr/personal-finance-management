# Setup and Installation Guide

## Prerequisites

### System Requirements

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| **Go** | 1.23+ | Latest stable |
| **Python** | 3.9+ | 3.11+ |
| **Node.js** | 18+ | 20+ LTS |
| **Docker** | 20.10+ | Latest stable |
| **Docker Compose** | 2.0+ | Latest stable |

### Development Tools

- **Git** for version control
- **VS Code** or preferred IDE
- **Postman** or similar for API testing
- **Database client** (optional, for database inspection)

## Installation Methods

### Method 1: Docker Setup (Recommended)

Docker provides the fastest and most consistent setup experience.

#### 1. Clone Repository

```bash
git clone https://github.com/quocdaijr/personal-finance-management.git
cd personal-finance-management
```

#### 2. Validate Docker Setup

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Test Docker configuration
./scripts/test-docker-setup.sh
```

#### 3. Start Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Or start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### 4. Validate Installation

```bash
# Test API integration
./scripts/test-api-integration.sh

# Check service health
curl http://localhost:8080/health
curl http://localhost:8000/health
```

### Method 2: Manual Development Setup

For developers who prefer manual setup or need to modify services individually.

#### 1. Backend Service Setup

```bash
# Navigate to backend directory
cd backend

# Install Go dependencies
go mod tidy

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (automatic on startup)
# Start the service
go run cmd/api/main.go
```

**Backend Environment Variables (.env):**
```env
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
PORT=8080
```

#### 2. Analytics Service Setup

```bash
# Navigate to analytics directory
cd analytics

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the service
python main.py
```

**Analytics Environment Variables (.env):**
```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Database Configuration
USE_SQLITE=true
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=finance-management

# Analytics Configuration
PORT=8000
```

#### 3. Frontend Service Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your configuration

# Start development server
npm run dev
```

**Frontend Environment Variables (.env.development):**
```env
# API Configuration
VITE_API_URL=http://localhost:8080
VITE_ANALYTICS_URL=http://localhost:8000

# Application Configuration
VITE_APP_NAME=Finance Management
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=true

# Development Configuration
NODE_ENV=development
CHOKIDAR_USEPOLLING=true
```

## Database Setup

### SQLite (Development)

SQLite is used by default for development and requires no additional setup. The database file is automatically created and seeded with test data.

**Location**: `backend/finance-management.db`

### PostgreSQL (Production)

For production environments, PostgreSQL is recommended.

#### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql

# Or use Docker
docker run --name postgres-finance \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=finance-management \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### 2. Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE finance_management;

-- Create user (optional)
CREATE USER finance_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE finance_management TO finance_user;
```

#### 3. Update Configuration

Update your `.env` files to use PostgreSQL:

```env
USE_SQLITE=false
DB_HOST=localhost
DB_PORT=5432
DB_USER=finance_user
DB_PASSWORD=secure_password
DB_NAME=finance_management
DB_SSLMODE=disable
```

## Configuration

### Environment Variables

Each service uses environment variables for configuration. Copy the example files and modify as needed:

```bash
# Backend
cp backend/.env.example backend/.env

# Analytics
cp analytics/.env.example analytics/.env

# Frontend
cp frontend/.env.example frontend/.env.development
```

### Security Configuration

#### JWT Secrets

Generate secure JWT secrets for production:

```bash
# Generate random secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

#### Database Security

- Use strong passwords for database users
- Enable SSL/TLS for database connections in production
- Restrict database access to application servers only
- Regular security updates and patches

### CORS Configuration

Update CORS settings in `backend/cmd/api/main.go` for your domain:

```go
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://your-domain.com"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
    AllowCredentials: true,
}))
```

## Testing

### Automated Testing

```bash
# Test Docker setup
./scripts/test-docker-setup.sh

# Test API integration
./scripts/test-api-integration.sh

# Run backend tests
cd backend && go test ./...

# Run frontend tests
cd frontend && npm test
```

### Manual Testing

#### 1. Test Authentication

```bash
# Register new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### 2. Test Protected Endpoints

```bash
# Set token from login response
export TOKEN="your_access_token_here"

# Test accounts
curl -X GET http://localhost:8080/api/accounts \
  -H "Authorization: Bearer $TOKEN"

# Test analytics
curl -X GET http://localhost:8000/api/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :8000  # Analytics
lsof -i :5432  # PostgreSQL

# Kill processes if needed
kill -9 <PID>
```

#### Docker Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache

# Check container logs
docker-compose -f docker-compose.dev.yml logs <service_name>
```

#### Database Connection Issues

```bash
# Check database status
# For PostgreSQL
pg_isready -h localhost -p 5432

# For SQLite, check file permissions
ls -la backend/finance-management.db
```

#### Go Module Issues

```bash
# Clean module cache
go clean -modcache

# Re-download dependencies
go mod download
go mod tidy
```

#### Python Dependencies

```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Node.js Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
```

#### Application Optimization

- Enable Go build optimizations: `go build -ldflags="-s -w"`
- Use production builds for frontend: `npm run build`
- Configure proper caching headers
- Enable gzip compression
- Use connection pooling for databases

## Production Deployment

### Docker Production Setup

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Monitor services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment-Specific Configuration

Create separate environment files for different stages:

- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

### Security Checklist

- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs for security events

### Monitoring Setup

- Set up health check endpoints
- Configure log aggregation
- Monitor resource usage
- Set up alerting for critical issues
- Regular backup verification

## Next Steps

After successful setup:

1. **Read the [User Guide](USER_GUIDE.md)** to understand how to use the application
2. **Review the [API Documentation](API.md)** for integration details
3. **Check the [Architecture Guide](ARCHITECTURE.md)** for system understanding
4. **Set up monitoring and backups** for production environments
