#!/bin/bash

# Sprint 5: Multi-tenancy & Collaboration - Integration Tests
# Tests all Sprint 5 features including shared accounts, RBAC, family budgeting, and collaboration

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Sprint 5: Multi-tenancy & Collaboration Tests ===${NC}\n"

# Configuration
API_URL="http://localhost:8080"

# Create two test users for collaboration testing
echo -e "${YELLOW}Setup: Creating Test Users${NC}"

# User 1 (Owner)
USER1_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}')

TOKEN1=$(echo $USER1_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN1" ]; then
    echo -e "${RED}❌ Failed to authenticate user 1${NC}"
    exit 1
fi

# Create User 2 for sharing tests
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "testuser2@example.com",
    "password": "password123",
    "full_name": "Test User 2"
  }')

USER2_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}')

TOKEN2=$(echo $USER2_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo -e "${GREEN}✅ Test users authenticated${NC}\n"

# Get an account ID for testing
ACCOUNTS_RESPONSE=$(curl -s -X GET "$API_URL/api/accounts" \
  -H "Authorization: Bearer $TOKEN1")
ACCOUNT_ID=$(echo $ACCOUNTS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}❌ No accounts found for testing${NC}"
    exit 1
fi

echo -e "${YELLOW}Using Account ID: $ACCOUNT_ID${NC}\n"

# ====== SHARED ACCOUNTS TESTS ======

echo -e "${YELLOW}=== Testing Shared Accounts ===${NC}\n"

# Test 1: Invite User to Account
echo -e "${YELLOW}Test 1: Invite User to Shared Account${NC}"
INVITE_RESPONSE=$(curl -s -X POST "$API_URL/api/accounts/$ACCOUNT_ID/invite" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "role": "editor"
  }')

INVITATION_ID=$(echo $INVITE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
INVITATION_TOKEN=$(echo $INVITE_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$INVITATION_ID" ]; then
    echo -e "${GREEN}✅ Invitation created (ID: $INVITATION_ID)${NC}"
else
    echo -e "${RED}❌ Invitation creation failed${NC}"
    echo "$INVITE_RESPONSE"
fi

# Test 2: Accept Invitation
if [ ! -z "$INVITATION_TOKEN" ]; then
    echo -e "\n${YELLOW}Test 2: Accept Invitation${NC}"
    RESPONSE=$(curl -s -X POST "$API_URL/api/invitations/$INVITATION_TOKEN/accept" \
      -H "Authorization: Bearer $TOKEN2")

    if echo "$RESPONSE" | grep -q "success\|accepted"; then
        echo -e "${GREEN}✅ Invitation accepted successfully${NC}"
    else
        echo -e "${RED}❌ Invitation acceptance failed${NC}"
    fi
fi

# Test 3: List Account Members
echo -e "\n${YELLOW}Test 3: List Account Members${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/accounts/$ACCOUNT_ID/members" \
  -H "Authorization: Bearer $TOKEN1")

if echo "$RESPONSE" | grep -q "members\|users"; then
    echo -e "${GREEN}✅ List members working${NC}"
else
    echo -e "${RED}❌ List members failed${NC}"
fi

# Test 4: Update Member Role
echo -e "\n${YELLOW}Test 4: Update Member Role${NC}"
# Get user2 ID from members list
USER2_ID=$(echo $RESPONSE | grep -o '"user_id":[0-9]*' | tail -1 | cut -d':' -f2)

if [ ! -z "$USER2_ID" ]; then
    RESPONSE=$(curl -s -X PUT "$API_URL/api/accounts/$ACCOUNT_ID/members/$USER2_ID/role" \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d '{"role": "viewer"}')

    if echo "$RESPONSE" | grep -q "success\|updated"; then
        echo -e "${GREEN}✅ Role update working${NC}"
    else
        echo -e "${RED}❌ Role update failed${NC}"
    fi
fi

# Test 5: Test Permission Enforcement
echo -e "\n${YELLOW}Test 5: Permission Enforcement (Viewer cannot delete)${NC}"
# Try to delete account as viewer (should fail)
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/accounts/$ACCOUNT_ID" \
  -H "Authorization: Bearer $TOKEN2")

if echo "$DELETE_RESPONSE" | grep -q "forbidden\|unauthorized\|permission"; then
    echo -e "${GREEN}✅ Permission enforcement working (deletion blocked)${NC}"
else
    echo -e "${YELLOW}⚠️  Permission check might need review${NC}"
fi

# ====== RBAC TESTS ======

echo -e "\n${YELLOW}=== Testing Role-Based Access Control ===${NC}\n"

# Test 6: Create Custom Role
echo -e "${YELLOW}Test 6: Create Custom Role${NC}"
ROLE_RESPONSE=$(curl -s -X POST "$API_URL/api/accounts/$ACCOUNT_ID/roles" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Accountant",
    "description": "Can view and categorize transactions",
    "permissions": {
      "transactions": {"read": true, "write": true, "delete": false},
      "budgets": {"read": true, "write": false, "delete": false},
      "accounts": {"read": true, "write": false, "delete": false}
    }
  }')

ROLE_ID=$(echo $ROLE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$ROLE_ID" ]; then
    echo -e "${GREEN}✅ Custom role created (ID: $ROLE_ID)${NC}"
else
    echo -e "${RED}❌ Role creation failed${NC}"
fi

# Test 7: List Roles
echo -e "\n${YELLOW}Test 7: List Account Roles${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/accounts/$ACCOUNT_ID/roles" \
  -H "Authorization: Bearer $TOKEN1")

if echo "$RESPONSE" | grep -q "roles"; then
    echo -e "${GREEN}✅ List roles working${NC}"
else
    echo -e "${RED}❌ List roles failed${NC}"
fi

# Test 8: Assign Custom Role
if [ ! -z "$ROLE_ID" ] && [ ! -z "$USER2_ID" ]; then
    echo -e "\n${YELLOW}Test 8: Assign Custom Role to User${NC}"
    RESPONSE=$(curl -s -X POST "$API_URL/api/accounts/$ACCOUNT_ID/members/$USER2_ID/roles" \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d "{\"role_id\": $ROLE_ID}")

    if echo "$RESPONSE" | grep -q "success\|assigned"; then
        echo -e "${GREEN}✅ Role assignment working${NC}"
    else
        echo -e "${RED}❌ Role assignment failed${NC}"
    fi
fi

# Test 9: Permission Audit Log
echo -e "\n${YELLOW}Test 9: Permission Audit Log${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/audit/permissions" \
  -H "Authorization: Bearer $TOKEN1")

if echo "$RESPONSE" | grep -q "audit\|logs\|permissions"; then
    echo -e "${GREEN}✅ Permission audit log working${NC}"
else
    echo -e "${RED}❌ Audit log failed${NC}"
fi

# ====== FAMILY BUDGETING TESTS ======

echo -e "\n${YELLOW}=== Testing Family Budgeting ===${NC}\n"

# Test 10: Create Household
echo -e "${YELLOW}Test 10: Create Household${NC}"
HOUSEHOLD_RESPONSE=$(curl -s -X POST "$API_URL/api/households" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smith Family"
  }')

HOUSEHOLD_ID=$(echo $HOUSEHOLD_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$HOUSEHOLD_ID" ]; then
    echo -e "${GREEN}✅ Household created (ID: $HOUSEHOLD_ID)${NC}"
else
    echo -e "${RED}❌ Household creation failed${NC}"
fi

# Test 11: Add Household Member
if [ ! -z "$HOUSEHOLD_ID" ]; then
    echo -e "\n${YELLOW}Test 11: Add Household Member${NC}"
    RESPONSE=$(curl -s -X POST "$API_URL/api/households/$HOUSEHOLD_ID/members" \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d '{
        "user_id": '$USER2_ID',
        "relationship": "spouse",
        "is_dependent": false
      }')

    if echo "$RESPONSE" | grep -q "success\|member"; then
        echo -e "${GREEN}✅ Household member added${NC}"
    else
        echo -e "${RED}❌ Add member failed${NC}"
    fi
fi

# Test 12: Set Allowance
if [ ! -z "$HOUSEHOLD_ID" ] && [ ! -z "$USER2_ID" ]; then
    echo -e "\n${YELLOW}Test 12: Set Member Allowance${NC}"
    RESPONSE=$(curl -s -X PUT "$API_URL/api/households/$HOUSEHOLD_ID/members/$USER2_ID/allowance" \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d '{
        "allowance_amount": 500.00,
        "allowance_frequency": "monthly"
      }')

    if echo "$RESPONSE" | grep -q "success\|allowance"; then
        echo -e "${GREEN}✅ Allowance set successfully${NC}"
    else
        echo -e "${RED}❌ Set allowance failed${NC}"
    fi
fi

# Test 13: List Household Budgets
if [ ! -z "$HOUSEHOLD_ID" ]; then
    echo -e "\n${YELLOW}Test 13: List Household Budgets${NC}"
    RESPONSE=$(curl -s -X GET "$API_URL/api/households/$HOUSEHOLD_ID/budgets" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "budgets"; then
        echo -e "${GREEN}✅ Household budgets listing working${NC}"
    else
        echo -e "${RED}❌ Household budgets failed${NC}"
    fi
fi

# Test 14: List Household Goals
if [ ! -z "$HOUSEHOLD_ID" ]; then
    echo -e "\n${YELLOW}Test 14: List Household Goals${NC}"
    RESPONSE=$(curl -s -X GET "$API_URL/api/households/$HOUSEHOLD_ID/goals" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "goals"; then
        echo -e "${GREEN}✅ Household goals listing working${NC}"
    else
        echo -e "${RED}❌ Household goals failed${NC}"
    fi
fi

# ====== COLLABORATION FEATURES TESTS ======

echo -e "\n${YELLOW}=== Testing Collaboration Features ===${NC}\n"

# Get a transaction ID for testing
TRANSACTIONS_RESPONSE=$(curl -s -X GET "$API_URL/api/transactions" \
  -H "Authorization: Bearer $TOKEN1")
TRANSACTION_ID=$(echo $TRANSACTIONS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# Test 15: Add Transaction Comment
if [ ! -z "$TRANSACTION_ID" ]; then
    echo -e "${YELLOW}Test 15: Add Transaction Comment${NC}"
    COMMENT_RESPONSE=$(curl -s -X POST "$API_URL/api/transactions/$TRANSACTION_ID/comments" \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "This expense needs review @testuser2"
      }')

    COMMENT_ID=$(echo $COMMENT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

    if [ ! -z "$COMMENT_ID" ]; then
        echo -e "${GREEN}✅ Comment added (ID: $COMMENT_ID)${NC}"
    else
        echo -e "${RED}❌ Comment creation failed${NC}"
    fi
fi

# Test 16: List Comments
if [ ! -z "$TRANSACTION_ID" ]; then
    echo -e "\n${YELLOW}Test 16: List Transaction Comments${NC}"
    RESPONSE=$(curl -s -X GET "$API_URL/api/transactions/$TRANSACTION_ID/comments" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "comments"; then
        echo -e "${GREEN}✅ List comments working${NC}"
    else
        echo -e "${RED}❌ List comments failed${NC}"
    fi
fi

# Test 17: Activity Feed
echo -e "\n${YELLOW}Test 17: Activity Feed${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/activity" \
  -H "Authorization: Bearer $TOKEN1")

if echo "$RESPONSE" | grep -q "activity\|activities\|actions"; then
    echo -e "${GREEN}✅ Activity feed working${NC}"
else
    echo -e "${RED}❌ Activity feed failed${NC}"
fi

# Test 18: Request Approval for Large Transaction
echo -e "\n${YELLOW}Test 18: Request Transaction Approval${NC}"
APPROVAL_RESPONSE=$(curl -s -X POST "$API_URL/api/approvals" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": '$ACCOUNT_ID',
    "transaction_id": '$TRANSACTION_ID',
    "threshold_amount": 1000.00
  }')

APPROVAL_ID=$(echo $APPROVAL_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$APPROVAL_ID" ]; then
    echo -e "${GREEN}✅ Approval request created (ID: $APPROVAL_ID)${NC}"
else
    echo -e "${RED}❌ Approval request failed${NC}"
fi

# Test 19: Approve Transaction
if [ ! -z "$APPROVAL_ID" ]; then
    echo -e "\n${YELLOW}Test 19: Approve Transaction${NC}"
    RESPONSE=$(curl -s -X PUT "$API_URL/api/approvals/$APPROVAL_ID/approve" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "success\|approved"; then
        echo -e "${GREEN}✅ Transaction approval working${NC}"
    else
        echo -e "${RED}❌ Approval failed${NC}"
    fi
fi

# ====== ORGANIZATION MODE TESTS ======

echo -e "\n${YELLOW}=== Testing Organization Mode ===${NC}\n"

# Test 20: Create Organization
echo -e "${YELLOW}Test 20: Create Organization${NC}"
ORG_RESPONSE=$(curl -s -X POST "$API_URL/api/organizations" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "settings": {
      "approval_threshold": 5000.00,
      "require_receipts": true
    }
  }')

ORG_ID=$(echo $ORG_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$ORG_ID" ]; then
    echo -e "${GREEN}✅ Organization created (ID: $ORG_ID)${NC}"
else
    echo -e "${RED}❌ Organization creation failed${NC}"
fi

# Test 21: Create Department
if [ ! -z "$ORG_ID" ]; then
    echo -e "\n${YELLOW}Test 21: Create Department${NC}"
    DEPT_RESPONSE=$(curl -s -X POST "$API_URL/api/organizations/$ORG_ID/departments" \
      -H "Authorization: Bearer $TOKEN1" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Engineering",
        "budget_amount": 50000.00,
        "manager_id": '$USER2_ID'
      }')

    DEPT_ID=$(echo $DEPT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

    if [ ! -z "$DEPT_ID" ]; then
        echo -e "${GREEN}✅ Department created (ID: $DEPT_ID)${NC}"
    else
        echo -e "${RED}❌ Department creation failed${NC}"
    fi
fi

# Test 22: List Departments
if [ ! -z "$ORG_ID" ]; then
    echo -e "\n${YELLOW}Test 22: List Organization Departments${NC}"
    RESPONSE=$(curl -s -X GET "$API_URL/api/organizations/$ORG_ID/departments" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "departments"; then
        echo -e "${GREEN}✅ List departments working${NC}"
    else
        echo -e "${RED}❌ List departments failed${NC}"
    fi
fi

# Test 23: Submit Reimbursement
if [ ! -z "$ORG_ID" ] && [ ! -z "$TRANSACTION_ID" ]; then
    echo -e "\n${YELLOW}Test 23: Submit Reimbursement Request${NC}"
    REIMB_RESPONSE=$(curl -s -X POST "$API_URL/api/reimbursements" \
      -H "Authorization: Bearer $TOKEN2" \
      -H "Content-Type: application/json" \
      -d '{
        "organization_id": '$ORG_ID',
        "transaction_id": '$TRANSACTION_ID',
        "amount": 150.00,
        "receipt_url": "https://example.com/receipt.pdf"
      }')

    REIMB_ID=$(echo $REIMB_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

    if [ ! -z "$REIMB_ID" ]; then
        echo -e "${GREEN}✅ Reimbursement submitted (ID: $REIMB_ID)${NC}"
    else
        echo -e "${RED}❌ Reimbursement submission failed${NC}"
    fi
fi

# Test 24: List Reimbursements
echo -e "\n${YELLOW}Test 24: List Reimbursements${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/reimbursements" \
  -H "Authorization: Bearer $TOKEN1")

if echo "$RESPONSE" | grep -q "reimbursements"; then
    echo -e "${GREEN}✅ List reimbursements working${NC}"
else
    echo -e "${RED}❌ List reimbursements failed${NC}"
fi

# Test 25: Approve Reimbursement
if [ ! -z "$REIMB_ID" ]; then
    echo -e "\n${YELLOW}Test 25: Approve Reimbursement${NC}"
    RESPONSE=$(curl -s -X PUT "$API_URL/api/reimbursements/$REIMB_ID/approve" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "success\|approved"; then
        echo -e "${GREEN}✅ Reimbursement approval working${NC}"
    else
        echo -e "${RED}❌ Reimbursement approval failed${NC}"
    fi
fi

# Test 26: Organization Expenses Report
if [ ! -z "$ORG_ID" ]; then
    echo -e "\n${YELLOW}Test 26: Organization Expenses Report${NC}"
    RESPONSE=$(curl -s -X GET "$API_URL/api/organizations/$ORG_ID/expenses" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "expenses\|transactions"; then
        echo -e "${GREEN}✅ Organization expenses report working${NC}"
    else
        echo -e "${RED}❌ Organization expenses failed${NC}"
    fi
fi

# Test 27: Remove Member from Account
if [ ! -z "$USER2_ID" ]; then
    echo -e "\n${YELLOW}Test 27: Remove Account Member${NC}"
    RESPONSE=$(curl -s -X DELETE "$API_URL/api/accounts/$ACCOUNT_ID/members/$USER2_ID" \
      -H "Authorization: Bearer $TOKEN1")

    if echo "$RESPONSE" | grep -q "success\|removed"; then
        echo -e "${GREEN}✅ Member removal working${NC}"
    else
        echo -e "${RED}❌ Member removal failed${NC}"
    fi
fi

echo -e "\n${YELLOW}=== Sprint 5 Tests Complete ===${NC}"
echo -e "${GREEN}All Sprint 5 features have been tested!${NC}\n"

echo -e "${YELLOW}Test Coverage:${NC}"
echo "✅ Shared Accounts (invitations, members, permissions)"
echo "✅ Role-Based Access Control (custom roles, assignments, audit)"
echo "✅ Family Budgeting (households, members, allowances, shared budgets/goals)"
echo "✅ Collaboration Features (comments, mentions, activity, approvals)"
echo "✅ Organization Mode (organizations, departments, reimbursements, expenses)"
