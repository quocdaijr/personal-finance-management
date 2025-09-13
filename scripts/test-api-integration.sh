#!/bin/bash

# API Integration Test Script
set -e

echo "🔗 Testing API Integration for Finance Management System"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8080"
ANALYTICS_URL="http://localhost:8000"
TEST_USER="testuser"
TEST_PASSWORD="password123"

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local method=${2:-GET}
    local data=${3:-}
    local headers=${4:-}
    local expected_status=${5:-200}
    
    print_info "Testing $method $url"
    
    local curl_cmd="curl -s -w '%{http_code}' -o /tmp/response.json"
    
    if [ ! -z "$headers" ]; then
        curl_cmd="$curl_cmd -H '$headers'"
    fi
    
    if [ "$method" != "GET" ]; then
        curl_cmd="$curl_cmd -X $method"
    fi
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -d '$data' -H 'Content-Type: application/json'"
    fi
    
    curl_cmd="$curl_cmd $url"
    
    local status_code=$(eval $curl_cmd)
    
    if [ "$status_code" = "$expected_status" ]; then
        print_status "Response: $status_code" 0
        return 0
    else
        print_status "Response: $status_code (expected $expected_status)" 1
        if [ -f /tmp/response.json ]; then
            echo "Response body: $(cat /tmp/response.json)"
        fi
        return 1
    fi
}

# Test 1: Health Checks
echo -e "\n🏥 Testing Health Endpoints..."

test_endpoint "$BACKEND_URL/health" "GET" "" "" "200"
test_endpoint "$ANALYTICS_URL/health" "GET" "" "" "200"

# Test 2: Authentication Flow
echo -e "\n🔐 Testing Authentication..."

# Login
print_info "Attempting login with test user..."
login_data='{"username":"'$TEST_USER'","password":"'$TEST_PASSWORD'"}'

if test_endpoint "$BACKEND_URL/api/auth/login" "POST" "$login_data" "" "200"; then
    # Extract token from response
    ACCESS_TOKEN=$(cat /tmp/response.json | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    if [ ! -z "$ACCESS_TOKEN" ]; then
        print_status "Access token obtained" 0
        AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"
    else
        print_status "Failed to extract access token" 1
        AUTH_HEADER=""
    fi
else
    print_warning "Login failed - continuing with limited tests"
    AUTH_HEADER=""
fi

# Test 3: Protected Endpoints (if authenticated)
if [ ! -z "$AUTH_HEADER" ]; then
    echo -e "\n🔒 Testing Protected Endpoints..."
    
    # Test accounts
    test_endpoint "$BACKEND_URL/api/accounts" "GET" "" "$AUTH_HEADER" "200"
    test_endpoint "$BACKEND_URL/api/accounts/summary" "GET" "" "$AUTH_HEADER" "200"
    
    # Test transactions
    test_endpoint "$BACKEND_URL/api/transactions" "GET" "" "$AUTH_HEADER" "200"
    test_endpoint "$BACKEND_URL/api/transactions/categories" "GET" "" "$AUTH_HEADER" "200"
    
    # Test budgets
    test_endpoint "$BACKEND_URL/api/budgets" "GET" "" "$AUTH_HEADER" "200"
    test_endpoint "$BACKEND_URL/api/budgets/summary" "GET" "" "$AUTH_HEADER" "200"
    
    # Test analytics
    echo -e "\n📊 Testing Analytics Endpoints..."
    test_endpoint "$ANALYTICS_URL/api/analytics/overview" "GET" "" "$AUTH_HEADER" "200"
    test_endpoint "$ANALYTICS_URL/api/analytics/transactions/trends" "GET" "" "$AUTH_HEADER" "200"
    test_endpoint "$ANALYTICS_URL/api/analytics/insights" "GET" "" "$AUTH_HEADER" "200"
    
    # Test profile
    test_endpoint "$BACKEND_URL/api/profile" "GET" "" "$AUTH_HEADER" "200"
else
    print_warning "Skipping protected endpoint tests (no authentication)"
fi

# Test 4: CORS Headers
echo -e "\n🌐 Testing CORS Configuration..."

print_info "Checking CORS headers..."
cors_response=$(curl -s -I -H "Origin: http://localhost:3000" "$BACKEND_URL/health")

if echo "$cors_response" | grep -i "access-control-allow-origin" > /dev/null; then
    print_status "CORS headers present" 0
else
    print_warning "CORS headers not found"
fi

# Test 5: Error Handling
echo -e "\n🚨 Testing Error Handling..."

# Test 404
test_endpoint "$BACKEND_URL/api/nonexistent" "GET" "" "" "404"

# Test unauthorized access
test_endpoint "$BACKEND_URL/api/accounts" "GET" "" "" "401"

# Test invalid login
invalid_login='{"username":"invalid","password":"invalid"}'
test_endpoint "$BACKEND_URL/api/auth/login" "POST" "$invalid_login" "" "401"

# Summary
echo -e "\n📋 Integration Test Summary"
echo "=========================="
print_info "API integration testing completed."
print_info ""
print_info "If tests failed, check:"
print_info "1. Backend service is running on port 8080"
print_info "2. Analytics service is running on port 8000"
print_info "3. Database is properly seeded with test data"
print_info "4. CORS is configured for frontend origin"
print_info ""
print_info "Test user credentials:"
print_info "  Username: $TEST_USER"
print_info "  Password: $TEST_PASSWORD"

# Cleanup
rm -f /tmp/response.json

echo -e "\n🎉 API integration test completed!"
