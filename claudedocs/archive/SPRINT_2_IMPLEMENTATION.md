# Sprint 2: API Enhancement & Security - Implementation Guide

**Status:** 🎯 Ready to Implement
**Duration:** 3-4 weeks
**Focus:** API improvements, security hardening, advanced features

---

## Overview

Sprint 2 builds on the solid foundation from Sprint 1 by enhancing the API layer with production-grade features including pagination, rate limiting, security hardening, and comprehensive API documentation.

---

## Task 1: API Pagination & Filtering

### Objective
Implement pagination and advanced filtering for all list endpoints to improve performance and user experience.

### Implementation Steps

#### Step 1.1: Create Pagination Models
**Location:** `backend/internal/domain/models/pagination.go`

```go
package models

// PaginationRequest represents pagination parameters
type PaginationRequest struct {
    Page     int    `form:"page" binding:"omitempty,min=1"`
    PageSize int    `form:"page_size" binding:"omitempty,min=1,max=100"`
    SortBy   string `form:"sort_by"`
    SortOrder string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

// PaginationResponse represents pagination metadata
type PaginationResponse struct {
    Page       int   `json:"page"`
    PageSize   int   `json:"page_size"`
    Total      int64 `json:"total"`
    TotalPages int   `json:"total_pages"`
}

// DefaultPagination returns default pagination values
func DefaultPagination() *PaginationRequest {
    return &PaginationRequest{
        Page:      1,
        PageSize:  20,
        SortOrder: "desc",
    }
}
```

#### Step 1.2: Add Filtering to Transaction Model
**Location:** `backend/internal/domain/models/transaction.go`

```go
// TransactionFilterRequest represents advanced filter parameters
type TransactionFilterRequest struct {
    PaginationRequest

    // Date filters
    StartDate *time.Time `form:"start_date" time_format:"2006-01-02"`
    EndDate   *time.Time `form:"end_date" time_format:"2006-01-02"`

    // Amount filters
    MinAmount *float64 `form:"min_amount" binding:"omitempty,min=0"`
    MaxAmount *float64 `form:"max_amount" binding:"omitempty,min=0"`

    // Category filters
    Categories []string `form:"categories"`

    // Type filter
    Type string `form:"type" binding:"omitempty,oneof=income expense transfer"`

    // Search
    Search string `form:"search"`
}
```

#### Step 1.3: Update Repository Layer
**Location:** `backend/internal/repository/transaction_repository.go`

```go
// GetPaginated returns paginated transactions with filters
func (r *TransactionRepository) GetPaginated(
    userID uint,
    filter *models.TransactionFilterRequest,
) ([]models.Transaction, int64, error) {
    var transactions []models.Transaction
    var total int64

    // Base query
    query := r.db.Model(&models.Transaction{}).Where("user_id = ?", userID)

    // Apply filters
    if filter.StartDate != nil {
        query = query.Where("date >= ?", filter.StartDate)
    }
    if filter.EndDate != nil {
        query = query.Where("date <= ?", filter.EndDate)
    }
    if filter.MinAmount != nil {
        query = query.Where("amount >= ?", *filter.MinAmount)
    }
    if filter.MaxAmount != nil {
        query = query.Where("amount <= ?", *filter.MaxAmount)
    }
    if len(filter.Categories) > 0 {
        query = query.Where("category IN ?", filter.Categories)
    }
    if filter.Type != "" {
        query = query.Where("type = ?", filter.Type)
    }
    if filter.Search != "" {
        query = query.Where(
            "description LIKE ? OR category LIKE ?",
            "%"+filter.Search+"%",
            "%"+filter.Search+"%",
        )
    }

    // Count total
    query.Count(&total)

    // Apply sorting
    sortBy := filter.SortBy
    if sortBy == "" {
        sortBy = "date"
    }
    sortOrder := filter.SortOrder
    if sortOrder == "" {
        sortOrder = "desc"
    }
    query = query.Order(sortBy + " " + sortOrder)

    // Apply pagination
    offset := (filter.Page - 1) * filter.PageSize
    query = query.Offset(offset).Limit(filter.PageSize)

    // Execute query
    result := query.Find(&transactions)
    return transactions, total, result.Error
}
```

#### Step 1.4: Update Service Layer
**Location:** `backend/internal/domain/services/transaction_service.go`

Add paginated method to service

#### Step 1.5: Update Handler
**Location:** `backend/internal/api/handlers/transaction_handler.go`

```go
// GetTransactions handles GET /api/transactions with pagination
func (h *TransactionHandler) GetTransactions(c *gin.Context) {
    userID := c.GetUint("user_id")

    // Bind filter parameters
    var filter models.TransactionFilterRequest
    if err := c.ShouldBindQuery(&filter); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Apply defaults
    if filter.Page < 1 {
        filter.Page = 1
    }
    if filter.PageSize < 1 {
        filter.PageSize = 20
    }

    // Get paginated transactions
    transactions, total, err := h.service.GetPaginated(userID, &filter)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve transactions"})
        return
    }

    // Calculate pagination metadata
    totalPages := int(total) / filter.PageSize
    if int(total)%filter.PageSize > 0 {
        totalPages++
    }

    // Return response
    c.JSON(http.StatusOK, gin.H{
        "data": transactions,
        "pagination": models.PaginationResponse{
            Page:       filter.Page,
            PageSize:   filter.PageSize,
            Total:      total,
            TotalPages: totalPages,
        },
    })
}
```

#### Step 1.6: Update Frontend Service
**Location:** `frontend/src/services/transactionService.js`

```javascript
export const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page);
  if (filters.pageSize) params.append('page_size', filters.pageSize);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.categories?.length) {
    filters.categories.forEach(cat => params.append('categories', cat));
  }
  if (filters.search) params.append('search', filters.search);

  const response = await apiClient.get(`/transactions?${params.toString()}`);
  return response.data;
};
```

### Testing Checklist
- [ ] Test pagination with different page sizes
- [ ] Test date range filtering
- [ ] Test amount range filtering
- [ ] Test multi-category filtering
- [ ] Test search functionality
- [ ] Test sorting (ascending/descending)
- [ ] Test edge cases (empty results, invalid params)

---

## Task 2: Rate Limiting Enhancement

### Objective
Implement Redis-based distributed rate limiting to prevent API abuse.

### Implementation Steps

#### Step 2.1: Install Redis Dependencies
```bash
cd backend
go get github.com/redis/go-redis/v9
go get github.com/ulule/limiter/v3
go get github.com/ulule/limiter/v3/drivers/store/redis
```

#### Step 2.2: Create Redis Client
**Location:** `backend/internal/infrastructure/redis.go`

```go
package infrastructure

import (
    "context"
    "github.com/redis/go-redis/v9"
    "github.com/quocdaijr/finance-management-backend/internal/config"
)

func NewRedisClient(cfg *config.Config) *redis.Client {
    return redis.NewClient(&redis.Options{
        Addr:     cfg.RedisAddr,
        Password: cfg.RedisPassword,
        DB:       cfg.RedisDB,
    })
}

func PingRedis(client *redis.Client) error {
    ctx := context.Background()
    return client.Ping(ctx).Err()
}
```

#### Step 2.3: Create Rate Limiting Middleware
**Location:** `backend/pkg/middleware/rate_limiter.go`

```go
package middleware

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/redis/go-redis/v9"
    "github.com/ulule/limiter/v3"
    sredis "github.com/ulule/limiter/v3/drivers/store/redis"
)

// RateLimiterConfig represents rate limiter configuration
type RateLimiterConfig struct {
    Rate   limiter.Rate
    Client *redis.Client
}

// NewRateLimiter creates a new rate limiting middleware
func NewRateLimiter(config RateLimiterConfig) gin.HandlerFunc {
    store, err := sredis.NewStoreWithOptions(config.Client, limiter.StoreOptions{
        Prefix:   "rate_limit",
        MaxRetry: 3,
    })
    if err != nil {
        panic(err)
    }

    instance := limiter.New(store, config.Rate)

    return func(c *gin.Context) {
        // Get identifier (IP or user ID)
        identifier := getIdentifier(c)

        // Get limit context
        context, err := instance.Get(c.Request.Context(), identifier)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
                "error": "Rate limiter error",
            })
            return
        }

        // Set rate limit headers
        c.Header("X-RateLimit-Limit", string(context.Limit))
        c.Header("X-RateLimit-Remaining", string(context.Remaining))
        c.Header("X-RateLimit-Reset", string(context.Reset))

        // Check if limit exceeded
        if context.Reached {
            c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
                "error": "Rate limit exceeded",
                "retry_after": context.Reset,
            })
            return
        }

        c.Next()
    }
}

func getIdentifier(c *gin.Context) string {
    // Use user ID if authenticated
    if userID, exists := c.Get("user_id"); exists {
        return "user:" + string(userID.(uint))
    }
    // Otherwise use IP
    return "ip:" + c.ClientIP()
}
```

#### Step 2.4: Apply Rate Limiting to Routes
**Location:** `backend/internal/api/routes/routes.go`

```go
// Different rate limits for different endpoint groups
publicLimiter := middleware.NewRateLimiter(middleware.RateLimiterConfig{
    Rate:   limiter.Rate{Period: 1 * time.Minute, Limit: 20},
    Client: redisClient,
})

authLimiter := middleware.NewRateLimiter(middleware.RateLimiterConfig{
    Rate:   limiter.Rate{Period: 1 * time.Minute, Limit: 100},
    Client: redisClient,
})

// Apply to routes
public := r.Group("/api")
public.Use(publicLimiter)

protected := r.Group("/api")
protected.Use(authMiddleware, authLimiter)
```

#### Step 2.5: Update Docker Compose
**Location:** `docker-compose.local.yml`

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  backend:
    environment:
      - REDIS_ADDR=redis:6379
      - REDIS_PASSWORD=
      - REDIS_DB=0

volumes:
  redis_data:
```

### Testing Checklist
- [ ] Test rate limit enforcement
- [ ] Test rate limit headers in response
- [ ] Test different limits for auth/unauth users
- [ ] Test Redis connection failure handling
- [ ] Load test rate limiting performance

---

## Task 3: API Versioning

### Objective
Implement API versioning strategy for backward compatibility.

### Implementation Steps

#### Step 3.1: Create Versioning Middleware
**Location:** `backend/pkg/middleware/versioning.go`

```go
package middleware

import (
    "strings"
    "github.com/gin-gonic/gin"
)

// APIVersion extracts API version from URL
func APIVersion() gin.HandlerFunc {
    return func(c *gin.Context) {
        path := c.Request.URL.Path

        // Extract version from path (e.g., /api/v1/transactions)
        parts := strings.Split(path, "/")
        if len(parts) >= 3 && strings.HasPrefix(parts[2], "v") {
            version := parts[2]
            c.Set("api_version", version)
        } else {
            // Default to v1
            c.Set("api_version", "v1")
        }

        c.Next()
    }
}
```

#### Step 3.2: Restructure Routes
**Location:** `backend/internal/api/routes/routes.go`

```go
func SetupRoutes(r *gin.Engine, handlers *Handlers) {
    // API v1
    v1 := r.Group("/api/v1")
    v1.Use(middleware.APIVersion())
    {
        setupV1Routes(v1, handlers)
    }

    // Future: API v2
    // v2 := r.Group("/api/v2")
    // v2.Use(middleware.APIVersion())
    // {
    //     setupV2Routes(v2, handlers)
    // }

    // Legacy support - redirect /api/* to /api/v1/*
    r.Group("/api").Use(func(c *gin.Context) {
        if !strings.HasPrefix(c.Request.URL.Path, "/api/v") {
            newPath := strings.Replace(c.Request.URL.Path, "/api/", "/api/v1/", 1)
            c.Redirect(http.StatusMovedPermanently, newPath)
            c.Abort()
        }
    })
}
```

### Testing Checklist
- [ ] Test /api/v1/* endpoints
- [ ] Test legacy /api/* redirects
- [ ] Test version extraction middleware

---

## Task 4: Security Hardening

### Objective
Implement comprehensive security measures to protect against common vulnerabilities.

### Implementation Steps

#### Step 4.1: CSRF Protection
**Location:** `backend/pkg/middleware/csrf.go`

```go
package middleware

import (
    "crypto/subtle"
    "net/http"

    "github.com/gin-gonic/gin"
)

// CSRF provides CSRF protection middleware
func CSRF(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Skip CSRF for GET, HEAD, OPTIONS
        if c.Request.Method == "GET" || c.Request.Method == "HEAD" || c.Request.Method == "OPTIONS" {
            c.Next()
            return
        }

        // Get CSRF token from header
        token := c.GetHeader("X-CSRF-Token")

        // Get expected token from session/cookie
        expectedToken, _ := c.Cookie("csrf_token")

        // Compare tokens
        if !secureCompare(token, expectedToken) {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "error": "CSRF token invalid",
            })
            return
        }

        c.Next()
    }
}

func secureCompare(a, b string) bool {
    return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}
```

#### Step 4.2: Security Headers Middleware
**Location:** `backend/pkg/middleware/security_headers.go`

```go
package middleware

import "github.com/gin-gonic/gin"

// SecurityHeaders adds security headers to responses
func SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Prevent clickjacking
        c.Header("X-Frame-Options", "DENY")

        // Prevent MIME type sniffing
        c.Header("X-Content-Type-Options", "nosniff")

        // Enable XSS protection
        c.Header("X-XSS-Protection", "1; mode=block")

        // Enforce HTTPS
        c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

        // Content Security Policy
        c.Header("Content-Security-Policy", "default-src 'self'")

        // Referrer Policy
        c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

        // Permissions Policy
        c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

        c.Next()
    }
}
```

#### Step 4.3: Input Sanitization
**Location:** `backend/pkg/middleware/sanitize.go`

```go
package middleware

import (
    "html"
    "reflect"
    "strings"

    "github.com/gin-gonic/gin"
)

// SanitizeInput sanitizes request data to prevent XSS
func SanitizeInput() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get request body
        var body interface{}
        if err := c.ShouldBindJSON(&body); err == nil {
            sanitized := sanitizeValue(body)
            c.Set("sanitized_body", sanitized)
        }

        c.Next()
    }
}

func sanitizeValue(v interface{}) interface{} {
    val := reflect.ValueOf(v)

    switch val.Kind() {
    case reflect.String:
        return html.EscapeString(strings.TrimSpace(val.String()))
    case reflect.Map:
        m := make(map[string]interface{})
        for _, key := range val.MapKeys() {
            m[key.String()] = sanitizeValue(val.MapIndex(key).Interface())
        }
        return m
    case reflect.Slice:
        s := make([]interface{}, val.Len())
        for i := 0; i < val.Len(); i++ {
            s[i] = sanitizeValue(val.Index(i).Interface())
        }
        return s
    default:
        return v
    }
}
```

#### Step 4.4: SQL Injection Prevention Audit
Create audit script:

**Location:** `backend/scripts/security-audit.sh`

```bash
#!/bin/bash

echo "Running SQL Injection Audit..."

# Check for string concatenation in SQL queries
echo "Checking for unsafe SQL concatenation..."
grep -rn "db.Raw\|db.Exec" --include="*.go" backend/internal/ | grep -v "?" || echo "✅ No unsafe SQL found"

# Check for user input in queries
echo "Checking for unvalidated user input..."
grep -rn "c.Query\|c.Param" --include="*.go" backend/internal/api/handlers/ || echo "✅ All inputs validated"

echo "Security audit complete!"
```

### Testing Checklist
- [ ] Test CSRF protection on POST/PUT/DELETE
- [ ] Verify security headers in responses
- [ ] Test XSS prevention with malicious input
- [ ] Run SQL injection audit script
- [ ] Perform manual penetration testing

---

## Task 5: Request Validation Middleware

### Objective
Implement comprehensive request validation with clear error messages.

### Implementation Steps

#### Step 5.1: Create Validation Helpers
**Location:** `backend/pkg/validation/validators.go`

```go
package validation

import (
    "regexp"
    "github.com/go-playground/validator/v10"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// RegisterCustomValidators registers custom validation rules
func RegisterCustomValidators(v *validator.Validate) {
    v.RegisterValidation("strong_password", validateStrongPassword)
    v.RegisterValidation("transaction_type", validateTransactionType)
    v.RegisterValidation("positive_amount", validatePositiveAmount)
}

func validateStrongPassword(fl validator.FieldLevel) bool {
    password := fl.Field().String()

    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    if len(password) < 8 {
        return false
    }

    hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)

    return hasUpper && hasLower && hasNumber
}

func validateTransactionType(fl validator.FieldLevel) bool {
    transactionType := fl.Field().String()
    validTypes := []string{"income", "expense", "transfer"}

    for _, t := range validTypes {
        if transactionType == t {
            return true
        }
    }
    return false
}

func validatePositiveAmount(fl validator.FieldLevel) bool {
    amount := fl.Field().Float()
    return amount > 0
}
```

#### Step 5.2: Create Validation Error Formatter
**Location:** `backend/pkg/validation/errors.go`

```go
package validation

import (
    "github.com/go-playground/validator/v10"
)

// ValidationError represents a formatted validation error
type ValidationError struct {
    Field   string `json:"field"`
    Message string `json:"message"`
}

// FormatValidationErrors formats validator errors
func FormatValidationErrors(err error) []ValidationError {
    var errors []ValidationError

    if validationErrors, ok := err.(validator.ValidationErrors); ok {
        for _, e := range validationErrors {
            errors = append(errors, ValidationError{
                Field:   e.Field(),
                Message: getErrorMessage(e),
            })
        }
    }

    return errors
}

func getErrorMessage(e validator.FieldError) string {
    switch e.Tag() {
    case "required":
        return e.Field() + " is required"
    case "email":
        return "Invalid email format"
    case "strong_password":
        return "Password must be at least 8 characters with uppercase, lowercase, and number"
    case "min":
        return e.Field() + " must be at least " + e.Param()
    case "max":
        return e.Field() + " must be at most " + e.Param()
    case "transaction_type":
        return "Transaction type must be income, expense, or transfer"
    case "positive_amount":
        return "Amount must be positive"
    default:
        return "Invalid " + e.Field()
    }
}
```

#### Step 5.3: Apply Validation in Models
**Location:** `backend/internal/domain/models/user.go`

```go
type RegisterRequest struct {
    Username  string `json:"username" binding:"required,min=3,max=50"`
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,strong_password"`
    FirstName string `json:"first_name" binding:"required,min=1,max=50"`
    LastName  string `json:"last_name" binding:"required,min=1,max=50"`
}
```

### Testing Checklist
- [ ] Test required field validation
- [ ] Test email format validation
- [ ] Test password strength validation
- [ ] Test custom validators
- [ ] Test error message formatting

---

## Task 6: API Documentation (OpenAPI/Swagger)

### Objective
Generate interactive API documentation using Swagger/OpenAPI.

### Implementation Steps

#### Step 6.1: Install Swagger Dependencies
```bash
cd backend
go get -u github.com/swaggo/swag/cmd/swag
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/files
```

#### Step 6.2: Add Swagger Annotations
**Location:** `backend/cmd/api/main.go`

```go
// @title Finance Management API
// @version 1.0
// @description Personal Finance Management System API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@financeapp.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
    // ... existing code
}
```

#### Step 6.3: Annotate Handlers
**Location:** `backend/internal/api/handlers/transaction_handler.go`

```go
// GetTransactions godoc
// @Summary Get transactions
// @Description Get paginated list of transactions with filters
// @Tags transactions
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Param categories query []string false "Categories"
// @Param type query string false "Transaction type" Enums(income, expense, transfer)
// @Param search query string false "Search term"
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /transactions [get]
func (h *TransactionHandler) GetTransactions(c *gin.Context) {
    // ... implementation
}
```

#### Step 6.4: Generate Swagger Docs
```bash
cd backend
swag init -g cmd/api/main.go -o docs
```

#### Step 6.5: Serve Swagger UI
**Location:** `backend/internal/api/routes/routes.go`

```go
import (
    swaggerFiles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
    _ "github.com/quocdaijr/finance-management-backend/docs" // Import generated docs
)

func SetupRoutes(r *gin.Engine, handlers *Handlers) {
    // ... existing routes

    // Swagger documentation
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
```

### Testing Checklist
- [ ] Access Swagger UI at http://localhost:8080/swagger/index.html
- [ ] Test API calls from Swagger UI
- [ ] Verify all endpoints documented
- [ ] Test authentication in Swagger

---

## Task 7: Advanced Search

### Objective
Implement full-text search with autocomplete for transactions.

### Implementation Steps

#### Step 7.1: Add Search Index to Database
**Location:** `backend/internal/domain/models/transaction.go`

```go
// Add to Transaction model
type Transaction struct {
    // ... existing fields

    SearchVector string `gorm:"type:tsvector;index:idx_search_vector,type:gin"` // PostgreSQL only
}
```

#### Step 7.2: Create Search Service
**Location:** `backend/internal/domain/services/search_service.go`

```go
package services

import (
    "strings"
    "github.com/quocdaijr/finance-management-backend/internal/domain/models"
    "github.com/quocdaijr/finance-management-backend/internal/repository"
)

type SearchService struct {
    transactionRepo *repository.TransactionRepository
}

func NewSearchService(transactionRepo *repository.TransactionRepository) *SearchService {
    return &SearchService{transactionRepo: transactionRepo}
}

// Search performs full-text search on transactions
func (s *SearchService) Search(userID uint, query string, limit int) ([]models.Transaction, error) {
    // Sanitize query
    query = strings.TrimSpace(query)
    if query == "" {
        return []models.Transaction{}, nil
    }

    return s.transactionRepo.FullTextSearch(userID, query, limit)
}

// Autocomplete suggests search terms
func (s *SearchService) Autocomplete(userID uint, query string) ([]string, error) {
    suggestions := []string{}

    // Get unique categories and descriptions matching query
    categories, _ := s.transactionRepo.GetMatchingCategories(userID, query)
    suggestions = append(suggestions, categories...)

    // Limit to 10 suggestions
    if len(suggestions) > 10 {
        suggestions = suggestions[:10]
    }

    return suggestions, nil
}
```

#### Step 7.3: Update Repository
**Location:** `backend/internal/repository/transaction_repository.go`

```go
// FullTextSearch performs full-text search (PostgreSQL)
func (r *TransactionRepository) FullTextSearch(userID uint, query string, limit int) ([]models.Transaction, error) {
    var transactions []models.Transaction

    // PostgreSQL full-text search
    result := r.db.Where("user_id = ?", userID).
        Where("search_vector @@ plainto_tsquery(?)", query).
        Limit(limit).
        Order("ts_rank(search_vector, plainto_tsquery(?)) DESC", query).
        Find(&transactions)

    return transactions, result.Error
}

// GetMatchingCategories returns categories matching query
func (r *TransactionRepository) GetMatchingCategories(userID uint, query string) ([]string, error) {
    var categories []string

    r.db.Model(&models.Transaction{}).
        Where("user_id = ?", userID).
        Where("category ILIKE ?", "%"+query+"%").
        Distinct("category").
        Limit(10).
        Pluck("category", &categories)

    return categories, nil
}
```

### Testing Checklist
- [ ] Test full-text search with various queries
- [ ] Test autocomplete suggestions
- [ ] Test search performance with large datasets
- [ ] Test special character handling in search

---

## Task 8: Bulk Operations

### Objective
Implement bulk import/export and bulk operations for transactions.

### Implementation Steps

#### Step 8.1: CSV Import Handler
**Location:** `backend/internal/api/handlers/import_handler.go`

```go
package handlers

import (
    "encoding/csv"
    "io"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/quocdaijr/finance-management-backend/internal/domain/models"
    "github.com/quocdaijr/finance-management-backend/internal/domain/services"
)

type ImportHandler struct {
    transactionService *services.TransactionService
}

// ImportCSV handles bulk CSV import
func (h *ImportHandler) ImportCSV(c *gin.Context) {
    userID := c.GetUint("user_id")

    // Get file from form
    file, _, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File required"})
        return
    }
    defer file.Close()

    // Parse CSV
    reader := csv.NewReader(file)

    // Skip header
    reader.Read()

    var imported, failed int
    var errors []string

    for {
        record, err := reader.Read()
        if err == io.EOF {
            break
        }
        if err != nil {
            continue
        }

        // Parse transaction from CSV row
        transaction, err := parseCSVRecord(record, userID)
        if err != nil {
            failed++
            errors = append(errors, err.Error())
            continue
        }

        // Create transaction
        _, err = h.transactionService.Create(userID, transaction)
        if err != nil {
            failed++
            errors = append(errors, err.Error())
        } else {
            imported++
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "imported": imported,
        "failed":   failed,
        "errors":   errors,
    })
}

func parseCSVRecord(record []string, userID uint) (*models.TransactionRequest, error) {
    // Expected CSV format: Date,Amount,Type,Category,Description,AccountID
    if len(record) < 6 {
        return nil, errors.New("invalid CSV format")
    }

    date, _ := time.Parse("2006-01-02", record[0])
    amount, _ := strconv.ParseFloat(record[1], 64)
    accountID, _ := strconv.ParseUint(record[5], 10, 32)

    return &models.TransactionRequest{
        Date:        date,
        Amount:      amount,
        Type:        record[2],
        Category:    record[3],
        Description: record[4],
        AccountID:   uint(accountID),
    }, nil
}
```

#### Step 8.2: Bulk Delete Handler
**Location:** `backend/internal/api/handlers/transaction_handler.go`

```go
// BulkDelete handles bulk transaction deletion
func (h *TransactionHandler) BulkDelete(c *gin.Context) {
    userID := c.GetUint("user_id")

    var req struct {
        IDs []uint `json:"ids" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Delete all transactions
    deleted := 0
    for _, id := range req.IDs {
        if err := h.service.Delete(id, userID); err == nil {
            deleted++
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "deleted": deleted,
        "total":   len(req.IDs),
    })
}
```

### Testing Checklist
- [ ] Test CSV import with valid data
- [ ] Test CSV import with invalid data
- [ ] Test bulk delete operation
- [ ] Test large file imports (>1000 rows)
- [ ] Test error handling and reporting

---

## Sprint 2 Completion Checklist

### Development Tasks
- [ ] Task 1: API Pagination & Filtering
- [ ] Task 2: Rate Limiting Enhancement
- [ ] Task 3: API Versioning
- [ ] Task 4: Security Hardening
- [ ] Task 5: Request Validation Middleware
- [ ] Task 6: API Documentation (Swagger)
- [ ] Task 7: Advanced Search
- [ ] Task 8: Bulk Operations

### Testing Tasks
- [ ] Unit tests for all new services
- [ ] Integration tests for API endpoints
- [ ] Performance tests for pagination
- [ ] Security tests (CSRF, XSS, SQL injection)
- [ ] Load tests for rate limiting

### Documentation Tasks
- [ ] Update API documentation
- [ ] Create security guide
- [ ] Document rate limiting configuration
- [ ] Create import/export guide
- [ ] Update CLAUDE.md with new patterns

### Deployment Tasks
- [ ] Update docker-compose with Redis
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Deploy to staging
- [ ] Smoke test staging environment

### Code Quality
- [ ] Code review all changes
- [ ] Run linters (golangci-lint)
- [ ] Check test coverage (>80%)
- [ ] Update dependencies
- [ ] Run security audit script

---

## Success Criteria

Sprint 2 is complete when:
1. ✅ All list endpoints support pagination and filtering
2. ✅ Redis-based rate limiting is functional
3. ✅ API versioning system is in place
4. ✅ Security headers are on all responses
5. ✅ Swagger documentation is accessible and complete
6. ✅ Advanced search works with acceptable performance
7. ✅ Bulk operations are tested and working
8. ✅ All tests pass with >80% coverage
9. ✅ Security audit shows no critical vulnerabilities
10. ✅ Documentation is up to date

---

## Estimated Timeline

| Task | Estimated Days |
|------|----------------|
| Task 1: Pagination & Filtering | 3-4 days |
| Task 2: Rate Limiting | 2-3 days |
| Task 3: API Versioning | 1-2 days |
| Task 4: Security Hardening | 3-4 days |
| Task 5: Request Validation | 2-3 days |
| Task 6: API Documentation | 2-3 days |
| Task 7: Advanced Search | 3-4 days |
| Task 8: Bulk Operations | 2-3 days |
| Testing & Documentation | 3-4 days |

**Total: ~21-30 days (3-4 weeks)**

---

## Next Sprint Preview

Sprint 3 will focus on:
- Real-time features with WebSocket
- Push notifications
- Real-time analytics dashboard
- Activity feed

Prepare for Sprint 3 by reviewing WebSocket technologies and notification services.
