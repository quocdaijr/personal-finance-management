# Logging Infrastructure

## Overview

The application uses **Logrus** for structured logging with support for multiple output formats, levels, and destinations.

## Features

- ✅ Structured logging (JSON/Text formats)
- ✅ Multiple log levels (Debug, Info, Warn, Error, Fatal, Panic)
- ✅ HTTP request/response logging
- ✅ Automatic panic recovery
- ✅ Field-based logging for context
- ✅ File and console output
- ✅ Production-ready configuration

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Logging Configuration
LOG_LEVEL=info              # debug, info, warn, error
LOG_FORMAT=text             # json, text
LOG_OUTPUT=stdout           # stdout, file, both
LOG_FILE_PATH=logs/app.log  # path to log file
ENVIRONMENT=development     # development, production
```

### Initialization

In your `main.go`:

```go
import (
    "github.com/quocdaijr/finance-management-backend/pkg/logger"
    "github.com/quocdaijr/finance-management-backend/pkg/middleware"
)

func main() {
    // Initialize logger
    logger.Init(logger.Config{
        Level:       os.Getenv("LOG_LEVEL"),
        Format:      os.Getenv("LOG_FORMAT"),
        Output:      os.Getenv("LOG_OUTPUT"),
        FilePath:    os.Getenv("LOG_FILE_PATH"),
        Environment: os.Getenv("ENVIRONMENT"),
    })

    // Setup Gin router
    router := gin.New()
    
    // Add logging middleware
    router.Use(middleware.LoggerMiddleware())
    router.Use(middleware.RecoveryMiddleware())
    
    // ... rest of your app
}
```

## Usage

### Basic Logging

```go
import "github.com/quocdaijr/finance-management-backend/pkg/logger"

// Simple messages
logger.Info("Application started")
logger.Debug("Debug information")
logger.Warn("Warning message")
logger.Error("Error occurred")

// Formatted messages
logger.Infof("User %s logged in", username)
logger.Errorf("Failed to connect to database: %v", err)
```

### Structured Logging with Fields

```go
import (
    "github.com/quocdaijr/finance-management-backend/pkg/logger"
    "github.com/sirupsen/logrus"
)

// Log with multiple fields
logger.WithFields(logrus.Fields{
    "user_id":      userID,
    "action":       "login",
    "ip_address":   ipAddress,
    "success":      true,
}).Info("User authentication")

// Log with single field
logger.WithField("transaction_id", txID).Info("Transaction created")

// Log with error
logger.WithError(err).Error("Database query failed")
```

### Service-Level Logging

```go
// In your service layer
type TransactionService struct {
    logger *logrus.Entry
}

func NewTransactionService() *TransactionService {
    return &TransactionService{
        logger: logger.WithField("service", "transaction"),
    }
}

func (s *TransactionService) CreateTransaction(tx *Transaction) error {
    s.logger.WithFields(logrus.Fields{
        "user_id":    tx.UserID,
        "amount":     tx.Amount,
        "type":       tx.Type,
    }).Info("Creating transaction")
    
    // ... business logic
    
    if err != nil {
        s.logger.WithError(err).Error("Failed to create transaction")
        return err
    }
    
    s.logger.Info("Transaction created successfully")
    return nil
}
```

### HTTP Request Logging

The `LoggerMiddleware` automatically logs all HTTP requests:

```json
{
  "timestamp": "2024-01-15T10:30:45Z",
  "level": "info",
  "message": "Request completed",
  "status": 200,
  "method": "POST",
  "path": "/api/transactions",
  "query": "",
  "ip": "192.168.1.1",
  "latency": "45ms",
  "latency_ms": 45,
  "user_agent": "Mozilla/5.0...",
  "user_id": 123
}
```

### Error Logging

```go
// Log errors with context
if err := db.Create(&user).Error; err != nil {
    logger.WithFields(logrus.Fields{
        "user_id":  user.ID,
        "username": user.Username,
        "error":    err.Error(),
    }).Error("Failed to create user")
    return err
}
```

### Panic Recovery

The `RecoveryMiddleware` automatically catches and logs panics:

```go
// This panic will be caught and logged
panic("something went wrong")

// Logged as:
{
  "timestamp": "2024-01-15T10:30:45Z",
  "level": "error",
  "message": "Panic recovered",
  "error": "something went wrong",
  "path": "/api/endpoint",
  "method": "GET",
  "ip": "192.168.1.1"
}
```

## Log Levels

### Debug
Development-only detailed information:
```go
logger.Debug("Database query: SELECT * FROM users WHERE id = ?", userID)
```

### Info
General informational messages:
```go
logger.Info("User registration completed")
logger.Infof("Connected to database: %s", dbName)
```

### Warn
Warning messages for potentially harmful situations:
```go
logger.Warn("Password reset attempts exceeded threshold")
logger.Warnf("Deprecated API endpoint used: %s", endpoint)
```

### Error
Error messages for failures:
```go
logger.WithError(err).Error("Failed to send email")
logger.Errorf("Transaction failed: %v", err)
```

### Fatal
Critical errors that cause application exit:
```go
logger.Fatal("Failed to connect to database")
// Application exits with status 1
```

### Panic
Severe errors that trigger panic:
```go
logger.Panic("Critical system failure")
// Application panics
```

## Log Formats

### Text Format (Development)

```
2024-01-15 10:30:45 INFO Request completed status=200 method=POST path=/api/transactions latency=45ms
2024-01-15 10:30:46 ERROR Database error error="connection refused" service=transaction
```

### JSON Format (Production)

```json
{
  "timestamp": "2024-01-15T10:30:45Z",
  "level": "info",
  "message": "Request completed",
  "status": 200,
  "method": "POST",
  "path": "/api/transactions",
  "latency_ms": 45
}
```

## Output Destinations

### Console Only
```env
LOG_OUTPUT=stdout
```

### File Only
```env
LOG_OUTPUT=file
LOG_FILE_PATH=logs/app.log
```

### Both Console and File
```env
LOG_OUTPUT=both
LOG_FILE_PATH=logs/app.log
```

## Production Configuration

### Recommended Settings

```env
# Production environment
ENVIRONMENT=production
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUT=both
LOG_FILE_PATH=/var/log/finance-app/app.log
```

### Log Rotation

For production, use external log rotation tools:

**Using logrotate (Linux):**

Create `/etc/logrotate.d/finance-app`:

```
/var/log/finance-app/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 appuser appuser
    sharedscripts
    postrotate
        systemctl reload finance-app
    endscript
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```go
// ✅ Good
logger.Debug("Cache key: ", cacheKey)  // Development details
logger.Info("User login successful")   // Normal operations
logger.Warn("API rate limit reached")  // Potentially harmful
logger.Error("Database timeout")       // Failures

// ❌ Bad
logger.Info("Starting function X")     // Too verbose
logger.Error("User not found")         // Not an error
```

### 2. Add Context with Fields

```go
// ✅ Good
logger.WithFields(logrus.Fields{
    "user_id":        userID,
    "transaction_id": txID,
    "amount":         amount,
}).Info("Transaction processed")

// ❌ Bad
logger.Infof("Transaction %d for user %d amount %f processed", txID, userID, amount)
```

### 3. Don't Log Sensitive Data

```go
// ❌ Never log passwords, tokens, or PII
logger.WithField("password", password).Debug("Login attempt")
logger.WithField("credit_card", cardNumber).Info("Payment")

// ✅ Log safely
logger.WithField("username", username).Info("Login attempt")
logger.WithField("payment_method", "card").Info("Payment")
```

### 4. Use Service-Level Loggers

```go
// ✅ Good - Create service-specific logger
type UserService struct {
    logger *logrus.Entry
}

func NewUserService() *UserService {
    return &UserService{
        logger: logger.WithField("service", "user"),
    }
}

// All logs from this service will include "service": "user"
```

### 5. Log Errors with Context

```go
// ✅ Good
if err := service.CreateUser(user); err != nil {
    logger.WithFields(logrus.Fields{
        "username": user.Username,
        "email":    user.Email,
    }).WithError(err).Error("Failed to create user")
}

// ❌ Bad
if err != nil {
    logger.Error(err)
}
```

## Monitoring and Alerting

### Integration with Monitoring Tools

**For production, integrate with:**

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Grafana Loki**: Log aggregation and visualization
- **Datadog**: Application performance monitoring
- **Sentry**: Error tracking and alerting

### Example: Sentry Integration

```go
import "github.com/getsentry/sentry-go"

// Add Sentry hook
func init() {
    sentry.Init(sentry.ClientOptions{
        Dsn: os.Getenv("SENTRY_DSN"),
    })
    
    // Log errors to Sentry
    logger.AddHook(SentryHook{})
}
```

## Troubleshooting

### Logs Not Appearing

1. Check log level configuration
2. Verify output destination
3. Check file permissions for log directory
4. Ensure logger is initialized

### Performance Impact

- Use appropriate log levels (avoid Debug in production)
- Limit field count in structured logs
- Consider async logging for high-throughput applications
- Use log sampling for very high-volume endpoints

### File Permission Issues

```bash
# Create log directory
sudo mkdir -p /var/log/finance-app

# Set permissions
sudo chown -R appuser:appuser /var/log/finance-app
sudo chmod 755 /var/log/finance-app
```

## Testing with Logs

```go
import (
    "testing"
    "github.com/sirupsen/logrus"
    "github.com/sirupsen/logrus/hooks/test"
)

func TestWithLogs(t *testing.T) {
    // Create test logger with hook
    logger, hook := test.NewNullLogger()
    
    // Your test code that logs
    logger.Info("Test log")
    
    // Assert logs
    assert.Equal(t, 1, len(hook.Entries))
    assert.Equal(t, logrus.InfoLevel, hook.LastEntry().Level)
    assert.Equal(t, "Test log", hook.LastEntry().Message)
}
```

## Resources

- [Logrus Documentation](https://github.com/sirupsen/logrus)
- [Structured Logging Best Practices](https://www.structlog.org/)
- [The Twelve-Factor App: Logs](https://12factor.net/logs)
