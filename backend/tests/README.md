# Backend Tests

## Test Structure

This directory contains integration tests and test utilities for the Finance Management Backend.

## Quick Start

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run unit tests only
make test-unit
```

## Test Categories

### Unit Tests
Located alongside source files: `internal/domain/services/*_test.go`

**Coverage:**
- ✅ Auth Service (`auth_service_test.go`)
- ✅ Transaction Service (`transaction_service_test.go`)
- 🔄 Account Service (TODO)
- 🔄 Budget Service (TODO)
- 🔄 Goal Service (TODO)

### Integration Tests
Located in: `tests/integration/`

**Coverage:**
- 🔄 API Endpoints (TODO)
- 🔄 Database Operations (TODO)
- 🔄 Authentication Flow (TODO)

### Test Utilities
Located in: `tests/testutils/`

**Utilities:**
- 🔄 Test database setup (TODO)
- 🔄 Mock factories (TODO)
- 🔄 Test helpers (TODO)

## Running Specific Tests

```bash
# Run auth service tests
go test ./internal/domain/services/ -run TestAuthService

# Run transaction service tests
go test ./internal/domain/services/ -run TestTransactionService

# Run with verbose output
go test ./internal/domain/services/ -v

# Run with race detection
go test ./... -race
```

## Test Coverage Status

Current test coverage by service:

| Service | Coverage | Status |
|---------|----------|--------|
| Auth Service | ✅ 85% | Complete |
| Transaction Service | ✅ 80% | Complete |
| Account Service | 🔄 0% | TODO |
| Budget Service | 🔄 0% | TODO |
| Goal Service | 🔄 0% | TODO |
| Email Service | 🔄 0% | TODO |

## Adding New Tests

1. Create test file: `<service>_test.go` next to source file
2. Import testify: `github.com/stretchr/testify/assert`
3. Create mocks for dependencies
4. Write test cases following AAA pattern:
   - Arrange: Setup test data and mocks
   - Act: Execute the function
   - Assert: Verify results

See `TESTING.md` for detailed guidelines.

## CI/CD Integration

Tests are automatically run on:
- Every push to main branch
- Every pull request
- Before deployment

## Next Steps

1. Add remaining service tests:
   - Account Service
   - Budget Service
   - Goal Service
   - Email Service

2. Add integration tests:
   - API endpoint tests
   - Database transaction tests
   - Authentication flow tests

3. Add benchmark tests for performance-critical operations

4. Increase coverage to 90%+ across all services
