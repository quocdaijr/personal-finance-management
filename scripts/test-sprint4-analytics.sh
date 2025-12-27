#!/bin/bash

# Sprint 4: Advanced Analytics & Reporting - Integration Tests
# Tests all Sprint 4 features including analytics, reports, AI insights, and tax support

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Sprint 4: Advanced Analytics & Reporting Tests ===${NC}\n"

# Configuration
API_URL="http://localhost:8080"
ANALYTICS_URL="http://localhost:8000"

# Login and get token
echo -e "${YELLOW}Step 1: Authentication${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}\n"

# Test 1: Advanced Analytics - Spending Patterns
echo -e "${YELLOW}Test 1: Spending Patterns Analysis${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/spending-patterns" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "daily_patterns\|weekly_patterns\|monthly_patterns"; then
    echo -e "${GREEN}✅ Spending patterns endpoint working${NC}"
else
    echo -e "${RED}❌ Spending patterns failed${NC}"
    echo "$RESPONSE"
fi

# Test 2: Income vs Expense Trends
echo -e "\n${YELLOW}Test 2: Income vs Expense Trends${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/income-expense-trends" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "income_trend\|expense_trend"; then
    echo -e "${GREEN}✅ Income vs expense trends working${NC}"
else
    echo -e "${RED}❌ Income vs expense trends failed${NC}"
fi

# Test 3: Category Breakdown
echo -e "\n${YELLOW}Test 3: Enhanced Category Breakdown${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/category-breakdown" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "categories"; then
    echo -e "${GREEN}✅ Category breakdown working${NC}"
else
    echo -e "${RED}❌ Category breakdown failed${NC}"
fi

# Test 4: Forecast
echo -e "\n${YELLOW}Test 4: Spending Forecast${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/forecast?months=3" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "predictions\|forecast"; then
    echo -e "${GREEN}✅ Forecast endpoint working${NC}"
else
    echo -e "${RED}❌ Forecast failed${NC}"
fi

# Test 5: AI Anomaly Detection
echo -e "\n${YELLOW}Test 5: AI Anomaly Detection${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/anomalies" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "anomalies"; then
    echo -e "${GREEN}✅ Anomaly detection working${NC}"
else
    echo -e "${RED}❌ Anomaly detection failed${NC}"
fi

# Test 6: AI Recommendations
echo -e "\n${YELLOW}Test 6: AI Recommendations${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/recommendations" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "recommendations"; then
    echo -e "${GREEN}✅ AI recommendations working${NC}"
else
    echo -e "${RED}❌ AI recommendations failed${NC}"
fi

# Test 7: Savings Opportunities
echo -e "\n${YELLOW}Test 7: Savings Opportunities${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/savings-opportunities" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "opportunities"; then
    echo -e "${GREEN}✅ Savings opportunities working${NC}"
else
    echo -e "${RED}❌ Savings opportunities failed${NC}"
fi

# Test 8: Heatmap Data
echo -e "\n${YELLOW}Test 8: Spending Heatmap${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/heatmap" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "heatmap\|data"; then
    echo -e "${GREEN}✅ Heatmap data working${NC}"
else
    echo -e "${RED}❌ Heatmap failed${NC}"
fi

# Test 9: Trend Lines
echo -e "\n${YELLOW}Test 9: Trend Lines${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/trend-lines" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "trend"; then
    echo -e "${GREEN}✅ Trend lines working${NC}"
else
    echo -e "${RED}❌ Trend lines failed${NC}"
fi

# Test 10: Comparative Analysis
echo -e "\n${YELLOW}Test 10: Comparative Analysis${NC}"
RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/comparison" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "comparison\|current\|previous"; then
    echo -e "${GREEN}✅ Comparative analysis working${NC}"
else
    echo -e "${RED}❌ Comparative analysis failed${NC}"
fi

# Test 11: Create Report
echo -e "\n${YELLOW}Test 11: Create Custom Report${NC}"
REPORT_RESPONSE=$(curl -s -X POST "$API_URL/api/reports" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Report",
    "report_type": "monthly",
    "parameters": {
      "month": "2025-12",
      "categories": ["Food", "Transportation"]
    }
  }')

REPORT_ID=$(echo $REPORT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$REPORT_ID" ]; then
    echo -e "${GREEN}✅ Report created successfully (ID: $REPORT_ID)${NC}"
else
    echo -e "${RED}❌ Report creation failed${NC}"
fi

# Test 12: List Reports
echo -e "\n${YELLOW}Test 12: List Reports${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/reports" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "reports"; then
    echo -e "${GREEN}✅ List reports working${NC}"
else
    echo -e "${RED}❌ List reports failed${NC}"
fi

# Test 13: Generate Report
if [ ! -z "$REPORT_ID" ]; then
    echo -e "\n${YELLOW}Test 13: Generate Report${NC}"
    RESPONSE=$(curl -s -X POST "$API_URL/api/reports/$REPORT_ID/generate" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "success\|file_path\|status"; then
        echo -e "${GREEN}✅ Report generation working${NC}"
    else
        echo -e "${RED}❌ Report generation failed${NC}"
    fi
fi

# Test 14: Create Tax Category
echo -e "\n${YELLOW}Test 14: Create Tax Category${NC}"
TAX_RESPONSE=$(curl -s -X POST "$API_URL/api/tax/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Expenses",
    "description": "Tax deductible business expenses",
    "tax_type": "deduction"
  }')

TAX_CATEGORY_ID=$(echo $TAX_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$TAX_CATEGORY_ID" ]; then
    echo -e "${GREEN}✅ Tax category created (ID: $TAX_CATEGORY_ID)${NC}"
else
    echo -e "${RED}❌ Tax category creation failed${NC}"
fi

# Test 15: List Tax Categories
echo -e "\n${YELLOW}Test 15: List Tax Categories${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/tax/categories" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "categories"; then
    echo -e "${GREEN}✅ List tax categories working${NC}"
else
    echo -e "${RED}❌ List tax categories failed${NC}"
fi

# Test 16: Annual Tax Report
echo -e "\n${YELLOW}Test 16: Annual Tax Report${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/tax/report?year=2025" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "tax_report\|deductions\|income"; then
    echo -e "${GREEN}✅ Tax report generation working${NC}"
else
    echo -e "${RED}❌ Tax report failed${NC}"
fi

# Test 17: Export Tax Data
echo -e "\n${YELLOW}Test 17: Export Tax Data${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/tax/export?year=2025" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "data\|transactions\|categories"; then
    echo -e "${GREEN}✅ Tax export working${NC}"
else
    echo -e "${RED}❌ Tax export failed${NC}"
fi

# Test 18: Goal Analytics - Probability
echo -e "\n${YELLOW}Test 18: Goal Achievement Probability${NC}"
# First, get a goal ID
GOALS_RESPONSE=$(curl -s -X GET "$API_URL/api/goals" \
  -H "Authorization: Bearer $TOKEN")
GOAL_ID=$(echo $GOALS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$GOAL_ID" ]; then
    RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/goals/$GOAL_ID/probability" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "probability\|likelihood"; then
        echo -e "${GREEN}✅ Goal probability calculation working${NC}"
    else
        echo -e "${RED}❌ Goal probability failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No goals found for testing${NC}"
fi

# Test 19: Goal Projections
if [ ! -z "$GOAL_ID" ]; then
    echo -e "\n${YELLOW}Test 19: Goal Timeline Projections${NC}"
    RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/goals/$GOAL_ID/projections" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "projection\|timeline\|estimated_completion"; then
        echo -e "${GREEN}✅ Goal projections working${NC}"
    else
        echo -e "${RED}❌ Goal projections failed${NC}"
    fi
fi

# Test 20: Goal Recommendations
if [ ! -z "$GOAL_ID" ]; then
    echo -e "\n${YELLOW}Test 20: Goal Contribution Recommendations${NC}"
    RESPONSE=$(curl -s -X GET "$ANALYTICS_URL/api/analytics/goals/$GOAL_ID/recommendations" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "recommendation\|suggested"; then
        echo -e "${GREEN}✅ Goal recommendations working${NC}"
    else
        echo -e "${RED}❌ Goal recommendations failed${NC}"
    fi
fi

echo -e "\n${YELLOW}=== Sprint 4 Tests Complete ===${NC}"
echo -e "${GREEN}All Sprint 4 features have been tested!${NC}\n"

echo -e "${YELLOW}Test Coverage:${NC}"
echo "✅ Advanced Analytics Engine (patterns, trends, forecasting)"
echo "✅ AI-Powered Insights (anomalies, recommendations, opportunities)"
echo "✅ Custom Reports (creation, generation, listing)"
echo "✅ Data Visualization (heatmaps, trend lines, comparisons)"
echo "✅ Financial Goals Analytics (probability, projections, recommendations)"
echo "✅ Tax Preparation Support (categories, reports, export)"
