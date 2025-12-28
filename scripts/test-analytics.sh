#!/bin/bash

# Sprint 4 API Integration Test Script
# Tests all Sprint 4 endpoints for Advanced Analytics & Reporting

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
ANALYTICS_URL="${ANALYTICS_URL:-http://localhost:8000}"
TEST_USERNAME="sprint4testuser"
TEST_EMAIL="sprint4test@example.com"
TEST_PASSWORD="TestPass123"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print section header
print_header() {
    echo ""
    echo "========================================="
    echo "$1"
    echo "========================================="
}

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to make authenticated request
auth_request() {
    local method=$1
    local url=$2
    local data=$3

    if [ -z "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            "$url"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url"
    fi
}

print_header "SPRINT 4 API TESTING"
echo "Backend: $BACKEND_URL"
echo "Analytics: $ANALYTICS_URL"

# Health checks
print_header "1. HEALTH CHECKS"

echo "Checking backend health..."
BACKEND_HEALTH=$(curl -s "$BACKEND_URL/health" | grep -o '"status":"ok"' || echo "")
if [ -n "$BACKEND_HEALTH" ]; then
    print_result 0 "Backend health check"
else
    print_result 1 "Backend health check"
    exit 1
fi

echo "Checking analytics health..."
ANALYTICS_HEALTH=$(curl -s "$ANALYTICS_URL/health" | grep -o '"status":"OK"' || echo "")
if [ -n "$ANALYTICS_HEALTH" ]; then
    print_result 0 "Analytics health check"
else
    print_result 1 "Analytics health check"
    exit 1
fi

# Authentication
print_header "2. AUTHENTICATION"

echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}" \
    "$BACKEND_URL/api/auth/login")

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    echo "Warning: Login failed. Attempting to register new user..."

    REGISTER_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"first_name\":\"Test\",\"last_name\":\"User\"}" \
        "$BACKEND_URL/api/auth/register")

    JWT_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -n "$JWT_TOKEN" ]; then
    print_result 0 "Authentication successful"
else
    print_result 1 "Authentication failed"
    exit 1
fi

# Advanced Analytics Tests
print_header "3. ADVANCED ANALYTICS"

echo "Testing spending patterns..."
PATTERNS=$(auth_request GET "$ANALYTICS_URL/api/analytics/spending-patterns?group_by=month")
if echo "$PATTERNS" | grep -q "patterns"; then
    print_result 0 "Get spending patterns"
else
    print_result 1 "Get spending patterns"
fi

echo "Testing income/expense trends..."
TRENDS=$(auth_request GET "$ANALYTICS_URL/api/analytics/income-expense-trends?months=6")
if echo "$TRENDS" | grep -q "trends"; then
    print_result 0 "Get income/expense trends"
else
    print_result 1 "Get income/expense trends"
fi

echo "Testing category breakdown..."
CATEGORIES=$(auth_request GET "$ANALYTICS_URL/api/analytics/category-breakdown")
if echo "$CATEGORIES" | grep -q "categories"; then
    print_result 0 "Get category breakdown"
else
    print_result 1 "Get category breakdown"
fi

echo "Testing spending forecast..."
FORECAST=$(auth_request GET "$ANALYTICS_URL/api/analytics/forecast?forecast_months=3")
if echo "$FORECAST" | grep -q "forecast"; then
    print_result 0 "Get spending forecast"
else
    print_result 1 "Get spending forecast"
fi

echo "Testing year-over-year comparison..."
YOY=$(auth_request GET "$ANALYTICS_URL/api/analytics/year-over-year")
if echo "$YOY" | grep -q "current_year"; then
    print_result 0 "Get year-over-year comparison"
else
    print_result 1 "Get year-over-year comparison"
fi

# AI Insights Tests
print_header "4. AI-POWERED INSIGHTS"

echo "Testing anomaly detection..."
ANOMALIES=$(auth_request GET "$ANALYTICS_URL/api/analytics/anomalies?sensitivity=medium&days=90")
if echo "$ANOMALIES" | grep -q "anomalies"; then
    print_result 0 "Detect anomalies"
else
    print_result 1 "Detect anomalies"
fi

echo "Testing budget recommendations..."
RECOMMENDATIONS=$(auth_request GET "$ANALYTICS_URL/api/analytics/recommendations")
if echo "$RECOMMENDATIONS" | grep -q "recommendations"; then
    print_result 0 "Get budget recommendations"
else
    print_result 1 "Get budget recommendations"
fi

echo "Testing savings opportunities..."
SAVINGS=$(auth_request GET "$ANALYTICS_URL/api/analytics/savings-opportunities")
if echo "$SAVINGS" | grep -q "opportunities"; then
    print_result 0 "Identify savings opportunities"
else
    print_result 1 "Identify savings opportunities"
fi

# Data Visualization Tests
print_header "5. DATA VISUALIZATION"

echo "Testing spending heatmap..."
HEATMAP=$(auth_request GET "$ANALYTICS_URL/api/analytics/heatmap?months=6")
if echo "$HEATMAP" | grep -q "heatmap_data"; then
    print_result 0 "Get spending heatmap"
else
    print_result 1 "Get spending heatmap"
fi

echo "Testing trend lines..."
TRENDLINES=$(auth_request GET "$ANALYTICS_URL/api/analytics/trend-lines?months=12&metric=expenses")
if echo "$TRENDLINES" | grep -q "trend_line"; then
    print_result 0 "Get trend lines"
else
    print_result 1 "Get trend lines"
fi

echo "Testing comparative analysis..."
COMPARISON=$(auth_request GET "$ANALYTICS_URL/api/analytics/comparison?comparison_type=month_over_month")
if echo "$COMPARISON" | grep -q "current_period"; then
    print_result 0 "Get comparative analysis"
else
    print_result 1 "Get comparative analysis"
fi

echo "Testing waterfall data..."
WATERFALL=$(auth_request GET "$ANALYTICS_URL/api/analytics/waterfall")
if echo "$WATERFALL" | grep -q "waterfall_data"; then
    print_result 0 "Get waterfall data"
else
    print_result 1 "Get waterfall data"
fi

echo "Testing seasonality detection..."
SEASONALITY=$(auth_request GET "$ANALYTICS_URL/api/analytics/seasonality")
if echo "$SEASONALITY" | grep -q "has_seasonality"; then
    print_result 0 "Detect seasonality"
else
    print_result 1 "Detect seasonality"
fi

# Tax Category Tests
print_header "6. TAX PREPARATION"

echo "Creating tax category..."
TAX_CATEGORY_DATA='{"name":"Business Expenses","description":"Deductible business expenses","tax_type":"deduction"}'
CREATE_TAX=$(auth_request POST "$BACKEND_URL/api/tax/categories" "$TAX_CATEGORY_DATA")
TAX_CATEGORY_ID=$(echo "$CREATE_TAX" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$TAX_CATEGORY_ID" ]; then
    print_result 0 "Create tax category"
else
    print_result 1 "Create tax category"
fi

echo "Listing tax categories..."
TAX_LIST=$(auth_request GET "$BACKEND_URL/api/tax/categories")
if echo "$TAX_LIST" | grep -q "Business Expenses"; then
    print_result 0 "List tax categories"
else
    print_result 1 "List tax categories"
fi

echo "Getting tax report..."
CURRENT_YEAR=$(date +%Y)
TAX_REPORT=$(auth_request GET "$BACKEND_URL/api/tax/report?year=$CURRENT_YEAR")
if echo "$TAX_REPORT" | grep -q "year"; then
    print_result 0 "Get tax report"
else
    print_result 1 "Get tax report"
fi

# Report Tests
print_header "7. CUSTOM REPORTS"

echo "Creating report definition..."
REPORT_DATA='{"name":"Monthly Summary","report_type":"monthly","parameters":{"format":"pdf"}}'
CREATE_REPORT=$(auth_request POST "$BACKEND_URL/api/reports" "$REPORT_DATA")
REPORT_ID=$(echo "$CREATE_REPORT" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$REPORT_ID" ]; then
    print_result 0 "Create report"
else
    print_result 1 "Create report"
fi

echo "Listing reports..."
REPORT_LIST=$(auth_request GET "$BACKEND_URL/api/reports")
if echo "$REPORT_LIST" | grep -q "reports"; then
    print_result 0 "List reports"
else
    print_result 1 "List reports"
fi

if [ -n "$REPORT_ID" ]; then
    echo "Getting report details..."
    REPORT_DETAILS=$(auth_request GET "$BACKEND_URL/api/reports/$REPORT_ID")
    if echo "$REPORT_DETAILS" | grep -q "Monthly Summary"; then
        print_result 0 "Get report details"
    else
        print_result 1 "Get report details"
    fi
fi

echo "Testing report generation..."
GENERATE_DATA='{"report_type":"monthly","format":"pdf"}'
GENERATE_REPORT=$(auth_request POST "$ANALYTICS_URL/api/analytics/reports/generate" "$GENERATE_DATA")
if echo "$GENERATE_REPORT" | grep -q "success"; then
    print_result 0 "Generate report"
else
    print_result 1 "Generate report"
fi

# Goals Analytics Tests (if goals exist)
print_header "8. GOALS ANALYTICS"

echo "Note: Goals analytics tests require existing goals with data"
echo "Skipping goals analytics tests (requires test data setup)"

# Summary
print_header "TEST SUMMARY"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
