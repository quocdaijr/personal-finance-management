# System Architecture

## Overview

The Personal Finance Management System follows a modern microservices architecture designed for scalability, maintainability, and security. The system is composed of three main services that communicate through well-defined APIs.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                                 │
│  • User Interface                                              │
│  • State Management                                            │
│  • API Integration                                             │
│  Port: 3000                                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTP/HTTPS + JWT
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer / Reverse Proxy (Nginx)                        │
│  • SSL Termination                                             │
│  • Request Routing                                             │
│  • Rate Limiting                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│  Backend API    │ │ Analytics API   │
│  (Go + Gin)     │ │ (Python FastAPI)│
│  Port: 8080     │ │ Port: 8000      │
└─────────────────┘ └─────────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────────┐
│           Data Layer                    │
├─────────────────────────────────────────┤
│  Database (SQLite/PostgreSQL)          │
│  • User Data                           │
│  • Financial Records                   │
│  • Analytics Cache                     │
│  Port: 5432                            │
└─────────────────────────────────────────┘
```

## Service Components

### 1. Frontend Service (React + TypeScript)

**Purpose**: User interface and client-side application logic

**Technologies**:
- React 19 with TypeScript
- Vite 6.1.1 for build tooling
- Material-UI for component library
- Axios for HTTP client
- JWT token management

**Responsibilities**:
- User authentication and session management
- Financial data visualization
- Form handling and validation
- Real-time updates and notifications
- Responsive design for multiple devices

**Key Features**:
- Hot module replacement for development
- Code splitting for optimal loading
- Progressive Web App capabilities
- Offline support with service workers

### 2. Backend API Service (Go + Gin)

**Purpose**: Core business logic and data management

**Technologies**:
- Go 1.23+ with Gin framework
- GORM for database ORM
- JWT for authentication
- bcrypt for password hashing
- SQLite/PostgreSQL for data storage

**Responsibilities**:
- User authentication and authorization
- Account and transaction management
- Budget creation and monitoring
- Data validation and sanitization
- Security middleware and CORS handling

**API Endpoints**:
- Authentication: `/api/auth/*`
- Accounts: `/api/accounts/*`
- Transactions: `/api/transactions/*`
- Budgets: `/api/budgets/*`
- User Profile: `/api/profile`

### 3. Analytics Service (Python + FastAPI)

**Purpose**: Financial analytics and insights generation

**Technologies**:
- Python 3.9+ with FastAPI
- Pandas for data processing
- NumPy for numerical computations
- SQLAlchemy for database access
- Pydantic for data validation

**Responsibilities**:
- Financial trend analysis
- Spending pattern recognition
- Budget utilization tracking
- AI-powered insights generation
- Real-time analytics processing

**Analytics Endpoints**:
- Overview: `/api/analytics/overview`
- Trends: `/api/analytics/transactions/trends`
- Insights: `/api/analytics/insights`

## Data Flow Architecture

### 1. Authentication Flow

```
User → Frontend → Backend API → JWT Token → Frontend Storage
                      ↓
                 Database (User Verification)
```

### 2. Transaction Processing Flow

```
User Input → Frontend Validation → Backend API → Database Storage
                                        ↓
                                 Analytics Service → Insights Generation
```

### 3. Analytics Generation Flow

```
Database → Analytics Service → Data Processing → Insights → Frontend Display
    ↑              ↓
    └── Cache Updates ──┘
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication with access and refresh tokens
- **Token Expiry**: Configurable token lifetime with automatic refresh
- **Role-Based Access**: User permissions and access control
- **2FA Support**: Two-factor authentication for enhanced security

### Data Protection

- **Password Hashing**: bcrypt with salt for secure password storage
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content Security Policy and input escaping

### Network Security

- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Rate Limiting**: API request throttling and abuse prevention
- **Security Headers**: Comprehensive HTTP security headers

## Database Schema

### Core Entities

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    type VARCHAR(20) NOT NULL,
    date TIMESTAMP NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100),
    period VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment Architecture

### Development Environment

- **Docker Compose**: Multi-container development setup
- **Hot Reload**: Live code updates for all services
- **Local Database**: SQLite for rapid development
- **Debug Mode**: Enhanced logging and error reporting

### Production Environment

- **Container Orchestration**: Docker Swarm or Kubernetes
- **Load Balancing**: Nginx reverse proxy with SSL termination
- **Database**: PostgreSQL with connection pooling
- **Monitoring**: Health checks and performance metrics
- **Scaling**: Horizontal scaling for API services

### Infrastructure Components

```
Internet → Load Balancer → API Gateway → Services → Database
    ↓           ↓              ↓           ↓         ↓
  CDN     SSL Termination  Rate Limiting  Auto-scaling  Backups
```

## Performance Considerations

### Caching Strategy

- **Application Cache**: In-memory caching for frequently accessed data
- **Database Cache**: Query result caching and connection pooling
- **CDN**: Static asset delivery and global distribution
- **Browser Cache**: Client-side caching for optimal performance

### Optimization Techniques

- **Database Indexing**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Lazy Loading**: On-demand data loading for large datasets
- **Compression**: Gzip compression for API responses

## Monitoring & Observability

### Health Monitoring

- **Service Health Checks**: Automated endpoint monitoring
- **Database Health**: Connection and performance monitoring
- **Resource Monitoring**: CPU, memory, and disk usage tracking
- **Error Tracking**: Comprehensive error logging and alerting

### Metrics & Analytics

- **API Metrics**: Request/response times and error rates
- **Business Metrics**: User engagement and feature usage
- **Performance Metrics**: System performance and bottlenecks
- **Security Metrics**: Authentication failures and security events

## Scalability Design

### Horizontal Scaling

- **Stateless Services**: Services designed for horizontal scaling
- **Load Distribution**: Even distribution across service instances
- **Database Sharding**: Data partitioning for large datasets
- **Microservice Independence**: Services can scale independently

### Vertical Scaling

- **Resource Optimization**: Efficient resource utilization
- **Performance Tuning**: Database and application optimization
- **Caching Layers**: Multiple levels of caching for performance
- **Connection Management**: Optimized database connections
