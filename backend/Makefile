# Makefile for Finance Management Backend

.PHONY: help test test-verbose test-coverage test-unit test-integration clean build run

# Default target
help:
	@echo "Available targets:"
	@echo "  test           - Run all tests"
	@echo "  test-verbose   - Run tests with verbose output"
	@echo "  test-coverage  - Run tests with coverage report"
	@echo "  test-unit      - Run unit tests only"
	@echo "  test-watch     - Run tests in watch mode"
	@echo "  clean          - Clean build artifacts and test cache"
	@echo "  build          - Build the application"
	@echo "  run            - Run the application"
	@echo "  lint           - Run linter"
	@echo "  fmt            - Format code"

# Run all tests
test:
	@echo "Running all tests..."
	go test ./... -v

# Run tests with verbose output
test-verbose:
	@echo "Running tests with verbose output..."
	go test ./... -v -count=1

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test ./... -coverprofile=coverage.out -covermode=atomic
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run unit tests only (excluding integration tests)
test-unit:
	@echo "Running unit tests..."
	go test ./internal/domain/services/... -v

# Run tests in watch mode (requires entr or similar)
test-watch:
	@echo "Running tests in watch mode..."
	find . -name '*.go' | entr -c go test ./... -v

# Clean build artifacts and test cache
clean:
	@echo "Cleaning build artifacts and test cache..."
	go clean -testcache
	rm -f coverage.out coverage.html
	rm -rf tmp/

# Build the application
build:
	@echo "Building application..."
	go build -o bin/server cmd/api/main.go

# Run the application
run:
	@echo "Running application..."
	go run cmd/api/main.go

# Run linter (requires golangci-lint)
lint:
	@echo "Running linter..."
	golangci-lint run

# Format code
fmt:
	@echo "Formatting code..."
	go fmt ./...

# Run go mod tidy
tidy:
	@echo "Tidying go modules..."
	go mod tidy

# Install dependencies
deps:
	@echo "Installing dependencies..."
	go mod download

# Generate mocks (if using mockery)
mocks:
	@echo "Generating mocks..."
	@echo "Install mockery first: go install github.com/vektra/mockery/v2@latest"
	mockery --all --dir internal/domain/services --output internal/mocks

# Run security scan (requires gosec)
security:
	@echo "Running security scan..."
	gosec ./...
