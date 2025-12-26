# Testing Guide

## Overview

This project uses **testify** as the primary testing framework for Go backend services. The testing infrastructure includes unit tests, integration tests, and mocking capabilities.

## Testing Framework

### Dependencies

- **testify/assert** - Assertions for test validation
- **testify/mock** - Mock object generation
- **testify/suite** - Test suite support
- **GORM** - In-memory SQLite for integration tests

### Installation

Dependencies are already included in `go.mod`:

```go
github.com/stretchr/testify v1.10.0
```

## Running Tests

### Using Make (Recommended)

```bash
# Run all tests
make test

# Run with verbose output
make test-verbose

# Run with coverage report
make test-coverage

# Run unit tests only
make test-unit

# Clean test cache
make clean
```

### Using Go Commands

```bash
# Run all tests
go test ./...

# Run tests with verbose output
go test ./... -v

# Run tests with coverage
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out

# Run specific package tests
go test ./internal/domain/services/...

# Run specific test
go test ./internal/domain/services/ -run TestAuthService_Register

# Run tests with race detector
go test ./... -race
```

## Test Structure

### Directory Organization

```
backend/
├── internal/
│   ├── domain/
│   │   └── services/
│   │       ├── auth_service.go
│   │       ├── auth_service_test.go          # Unit tests for auth service
│   │       ├── transaction_service.go
│   │       └── transaction_service_test.go   # Unit tests for transaction service
│   ├── api/
│   │   └── handlers/
│   │       ├── auth_handler.go
│   │       └── auth_handler_test.go          # Handler tests
│   └── repository/
│       ├── user_repository.go
│       └── user_repository_test.go           # Repository tests
└── tests/
    └── integration/                           # Integration tests
        └── api_integration_test.go
```

### Test File Naming

- Unit tests: `<filename>_test.go` in the same package
- Integration tests: Separate `tests/` directory
- Mock files: `mock_<interface>_test.go` or use mockery

## Writing Tests

### Basic Test Structure

```go
package services

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestServiceFunction(t *testing.T) {
	// Setup
	service := NewService()
	
	// Execute
	result, err := service.DoSomething()
	
	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, expectedValue, result)
}
```

### Using Testify Assertions

```go
// Equality
assert.Equal(t, expected, actual)
assert.NotEqual(t, expected, actual)

// Nil checks
assert.Nil(t, object)
assert.NotNil(t, object)

// Error checks
assert.NoError(t, err)
assert.Error(t, err)
assert.EqualError(t, err, "expected error message")
assert.Contains(t, err.Error(), "substring")

// Boolean
assert.True(t, condition)
assert.False(t, condition)

// Collections
assert.Len(t, collection, expectedLength)
assert.Empty(t, collection)
assert.NotEmpty(t, collection)
assert.Contains(t, collection, element)
```

### Creating Mocks

#### Manual Mocks

```go
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetByID(id uint) (*models.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) Create(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}
```

#### Using Mocks in Tests

```go
func TestWithMock(t *testing.T) {
	// Setup
	mockRepo := new(MockUserRepository)
	service := NewAuthService(mockRepo, nil, "secret")
	
	// Set expectations
	expectedUser := &models.User{ID: 1, Username: "test"}
	mockRepo.On("GetByID", uint(1)).Return(expectedUser, nil)
	
	// Execute
	user, err := service.GetUser(1)
	
	// Assert
	assert.NoError(t, err)
	assert.Equal(t, "test", user.Username)
	mockRepo.AssertExpectations(t) // Verify all expectations were met
}
```

### Testing with In-Memory Database

```go
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}
	
	// Auto-migrate test models
	err = db.AutoMigrate(&models.User{}, &models.Transaction{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}
	
	return db
}

func TestWithDatabase(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUserRepository(db)
	
	// Test database operations
	user := &models.User{Username: "test"}
	err := repo.Create(user)
	assert.NoError(t, err)
}
```

### Table-Driven Tests

```go
func TestValidation(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expected    bool
		expectError bool
	}{
		{
			name:        "valid email",
			input:       "test@example.com",
			expected:    true,
			expectError: false,
		},
		{
			name:        "invalid email",
			input:       "invalid",
			expected:    false,
			expectError: true,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ValidateEmail(tt.input)
			
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			
			assert.Equal(t, tt.expected, result)
		})
	}
}
```

## Test Coverage

### Generating Coverage Reports

```bash
# Generate coverage profile
go test ./... -coverprofile=coverage.out

# View coverage in terminal
go tool cover -func=coverage.out

# Generate HTML coverage report
go tool cover -html=coverage.out -o coverage.html
```

### Coverage Goals

- **Unit Tests**: Target 80%+ coverage for services
- **Integration Tests**: Cover critical user flows
- **Edge Cases**: Test error conditions and boundary cases

### Viewing Coverage

Open `coverage.html` in a browser to see line-by-line coverage highlighting.

## Best Practices

### 1. Test Organization

- **One test file per source file**: `service.go` → `service_test.go`
- **Group related tests**: Use descriptive test names
- **Arrange-Act-Assert**: Structure tests clearly

### 2. Test Naming

```go
// Format: Test<FunctionName>_<Scenario>
func TestAuthService_Login_Success(t *testing.T) { }
func TestAuthService_Login_InvalidPassword(t *testing.T) { }
func TestAuthService_Login_UserNotFound(t *testing.T) { }
```

### 3. Test Independence

- Each test should be independent
- Don't rely on test execution order
- Clean up resources after tests
- Use `t.Cleanup()` for teardown

```go
func TestWithCleanup(t *testing.T) {
	db := setupTestDB(t)
	
	t.Cleanup(func() {
		// Cleanup code
		db.Exec("DELETE FROM users")
	})
	
	// Test code
}
```

### 4. Testing Errors

Always test both success and error cases:

```go
func TestService_BothCases(t *testing.T) {
	t.Run("success case", func(t *testing.T) {
		// Test successful execution
	})
	
	t.Run("error case", func(t *testing.T) {
		// Test error handling
	})
}
```

### 5. Mock Verification

Always verify mock expectations:

```go
mockRepo.On("Create", user).Return(nil)
// ... test code ...
mockRepo.AssertExpectations(t)
mockRepo.AssertCalled(t, "Create", user)
```

## Integration Testing

### Setup Test Environment

```go
func TestMain(m *testing.M) {
	// Setup
	os.Setenv("ENVIRONMENT", "test")
	
	// Run tests
	code := m.Run()
	
	// Teardown
	os.Exit(code)
}
```

### API Integration Tests

```go
func TestAPI_CreateUser(t *testing.T) {
	// Setup test server
	router := SetupRouter()
	w := httptest.NewRecorder()
	
	// Create request
	body := `{"username":"test","email":"test@example.com","password":"pass123"}`
	req, _ := http.NewRequest("POST", "/api/users", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	
	// Execute
	router.ServeHTTP(w, req)
	
	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.23'
      
      - name: Run tests
        run: make test-coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.out
```

## Troubleshooting

### Common Issues

**1. Tests fail in CI but pass locally**
- Clear test cache: `go clean -testcache`
- Check for timing issues or race conditions
- Ensure consistent test data

**2. Mock expectations not met**
- Verify exact parameter matching
- Use `mock.Anything` for flexible matching
- Check call order if using `Once()` or `Times()`

**3. Database connection errors**
- Ensure in-memory SQLite is being used
- Check database migration in test setup

**4. Import cycle errors**
- Keep mocks in `_test.go` files
- Consider separate test package: `package services_test`

## Resources

- [Testify Documentation](https://github.com/stretchr/testify)
- [Go Testing Package](https://pkg.go.dev/testing)
- [Table-Driven Tests in Go](https://dave.cheney.net/2019/05/07/prefer-table-driven-tests)
- [Advanced Testing in Go](https://about.sourcegraph.com/blog/go/advanced-testing-in-go)
