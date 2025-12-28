# Sprint 4 & 5 Implementation Plan

**Created:** 2025-12-27
**Sprints:** Sprint 4 (Advanced Analytics & Reporting) + Sprint 5 (Multi-tenancy & Collaboration)
**Implementation Strategy:** Parallel execution with 2 specialized backend-architect agents

---

## Sprint 4: Advanced Analytics & Reporting 📊

### Overview
Enhance analytics service with advanced insights, AI-powered recommendations, custom reports, and data visualization.

### Implementation Tasks

#### Task 1: Advanced Analytics Engine
**Location:** `analytics/` service
**Components:**
- `analytics/advanced_analytics.py` - Spending pattern analysis
- `analytics/trend_forecasting.py` - Time-series forecasting using statistical models
- `analytics/category_breakdown.py` - Enhanced category analytics

**Features:**
1. Spending pattern analysis (daily, weekly, monthly trends)
2. Income vs expense comparative analytics
3. Enhanced category breakdown with subcategory support
4. Time-series forecasting using moving averages and trend lines
5. Year-over-year comparison analytics

**API Endpoints:**
- `GET /api/analytics/spending-patterns` - Detailed spending analysis
- `GET /api/analytics/income-expense-trends` - Income vs expense comparisons
- `GET /api/analytics/category-breakdown` - Enhanced category analytics
- `GET /api/analytics/forecast` - Future spending predictions

#### Task 2: AI-Powered Insights
**Location:** `analytics/` service
**Components:**
- `analytics/ai_insights.py` - ML-based anomaly detection and recommendations
- `analytics/models/` - ML model storage and loading

**Features:**
1. Anomaly detection for unusual spending (statistical thresholds)
2. Smart budget recommendations based on historical data
3. Savings opportunity identification
4. Spending category predictions using historical patterns

**API Endpoints:**
- `GET /api/analytics/anomalies` - Detect unusual transactions
- `GET /api/analytics/recommendations` - AI-powered suggestions
- `GET /api/analytics/savings-opportunities` - Savings suggestions

**ML Approach:**
- Use statistical methods (z-score, IQR) for anomaly detection
- Historical pattern matching for predictions
- Simple regression for budget recommendations

#### Task 3: Custom Reports
**Location:** `backend/` service + `analytics/` service
**Components:**
- `backend/internal/api/handlers/report_handler.go` - Report management
- `backend/internal/domain/services/report_service.go` - Report business logic
- `backend/internal/domain/models/report.go` - Report model
- `analytics/report_generator.py` - PDF/Excel generation

**Features:**
1. Report builder API for custom report definitions
2. PDF export using ReportLab (Python)
3. Excel export using openpyxl (Python)
4. Scheduled reports (cron-based) with email delivery
5. Report templates (monthly summary, yearly review, tax report)

**Database Schema:**
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50), -- monthly, yearly, custom, tax
    parameters JSONB, -- date_range, categories, accounts
    schedule VARCHAR(50), -- daily, weekly, monthly, null
    last_generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE report_executions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id),
    status VARCHAR(50), -- pending, success, failed
    file_path VARCHAR(500),
    executed_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- `POST /api/reports` - Create report definition
- `GET /api/reports` - List user reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports/:id/generate` - Generate report on-demand
- `GET /api/reports/:id/download` - Download generated report
- `DELETE /api/reports/:id` - Delete report

#### Task 4: Data Visualization Enhancements
**Location:** `analytics/` service
**Components:**
- `analytics/visualization_data.py` - Chart data preparation

**Features:**
1. Enhanced chart data endpoints for frontend visualization
2. Heatmap data for spending patterns (day-of-week, time-of-day)
3. Trend lines with linear regression
4. Comparative analysis views (this month vs last month)

**API Endpoints:**
- `GET /api/analytics/heatmap` - Spending heatmap data
- `GET /api/analytics/trend-lines` - Trend line calculations
- `GET /api/analytics/comparison` - Comparative analysis

#### Task 5: Financial Goals Analytics
**Location:** `analytics/` service
**Components:**
- `analytics/goal_analytics.py` - Goal achievement analytics

**Features:**
1. Goal achievement probability calculation
2. Timeline projections based on current savings rate
3. Contribution recommendations
4. Progress tracking dashboards with milestones

**API Endpoints:**
- `GET /api/analytics/goals/:id/probability` - Achievement probability
- `GET /api/analytics/goals/:id/projections` - Timeline projections
- `GET /api/analytics/goals/:id/recommendations` - Contribution suggestions

#### Task 6: Tax Preparation Support
**Location:** `backend/` service
**Components:**
- `backend/internal/api/handlers/tax_handler.go`
- `backend/internal/domain/services/tax_service.go`
- `backend/internal/domain/models/tax_category.go`

**Features:**
1. Tax category tagging system (deductible, income, etc.)
2. Annual tax report generation
3. Deduction tracking
4. Tax document export (CSV for tax software)

**Database Schema:**
```sql
CREATE TABLE tax_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    description TEXT,
    tax_type VARCHAR(50), -- deduction, income, capital_gain
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE transactions ADD COLUMN tax_category_id INTEGER REFERENCES tax_categories(id);
```

**API Endpoints:**
- `POST /api/tax/categories` - Create tax category
- `GET /api/tax/categories` - List tax categories
- `GET /api/tax/report?year=2025` - Annual tax report
- `GET /api/tax/export?year=2025` - Export tax data

---

## Sprint 5: Multi-tenancy & Collaboration 👥

### Overview
Implement shared accounts, family budgeting, RBAC, and collaboration features.

### Implementation Tasks

#### Task 1: Shared Accounts
**Location:** `backend/` service
**Components:**
- `backend/internal/api/handlers/sharing_handler.go`
- `backend/internal/domain/services/sharing_service.go`
- `backend/internal/domain/models/account_member.go`

**Features:**
1. Multi-user account access
2. Permission levels (owner, admin, editor, viewer)
3. Invitation system with email notifications
4. Access control management

**Database Schema:**
```sql
CREATE TABLE account_members (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50), -- owner, admin, editor, viewer
    permissions JSONB, -- {can_edit: true, can_delete: false, can_invite: true}
    invited_by INTEGER REFERENCES users(id),
    invited_at TIMESTAMP,
    accepted_at TIMESTAMP,
    status VARCHAR(50), -- pending, active, revoked
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, user_id)
);

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    email VARCHAR(255),
    role VARCHAR(50),
    token VARCHAR(255) UNIQUE,
    invited_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP,
    status VARCHAR(50), -- pending, accepted, expired, revoked
    created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- `POST /api/accounts/:id/invite` - Invite user to account
- `GET /api/accounts/:id/members` - List account members
- `PUT /api/accounts/:id/members/:userId/role` - Update member role
- `DELETE /api/accounts/:id/members/:userId` - Remove member
- `POST /api/invitations/:token/accept` - Accept invitation
- `DELETE /api/invitations/:id` - Revoke invitation

#### Task 2: Family Budgeting
**Location:** `backend/` service
**Components:**
- `backend/internal/api/handlers/family_budget_handler.go`
- `backend/internal/domain/services/family_budget_service.go`
- `backend/internal/domain/models/household.go`

**Features:**
1. Household budget management
2. Dependent tracking (children, family members)
3. Allowance management
4. Shared financial goals

**Database Schema:**
```sql
CREATE TABLE households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE household_members (
    id SERIAL PRIMARY KEY,
    household_id INTEGER REFERENCES households(id),
    user_id INTEGER REFERENCES users(id),
    relationship VARCHAR(50), -- parent, child, spouse, other
    is_dependent BOOLEAN DEFAULT false,
    allowance_amount DECIMAL(15,2),
    allowance_frequency VARCHAR(50), -- weekly, monthly
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE budgets ADD COLUMN household_id INTEGER REFERENCES households(id);
ALTER TABLE goals ADD COLUMN household_id INTEGER REFERENCES households(id);
```

**API Endpoints:**
- `POST /api/households` - Create household
- `GET /api/households` - List user households
- `POST /api/households/:id/members` - Add household member
- `PUT /api/households/:id/members/:memberId/allowance` - Set allowance
- `GET /api/households/:id/budgets` - Household budgets
- `GET /api/households/:id/goals` - Shared goals

#### Task 3: Collaboration Features
**Location:** `backend/` service
**Components:**
- `backend/internal/api/handlers/comment_handler.go`
- `backend/internal/domain/services/comment_service.go`
- `backend/internal/domain/models/comment.go`

**Features:**
1. Transaction comments
2. @mentions with notifications
3. Activity history per user
4. Approval workflows for large transactions

**Database Schema:**
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT,
    mentions INTEGER[], -- array of user_ids
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100), -- created_transaction, updated_budget, etc.
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE approval_workflows (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    transaction_id INTEGER REFERENCES transactions(id),
    requested_by INTEGER REFERENCES users(id),
    status VARCHAR(50), -- pending, approved, rejected
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    threshold_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- `POST /api/transactions/:id/comments` - Add comment
- `GET /api/transactions/:id/comments` - List comments
- `GET /api/activity` - Activity feed
- `POST /api/approvals` - Request approval
- `PUT /api/approvals/:id/approve` - Approve transaction
- `PUT /api/approvals/:id/reject` - Reject transaction

#### Task 4: Role-Based Access Control (RBAC)
**Location:** `backend/` service
**Components:**
- `backend/internal/api/middleware/rbac_middleware.go`
- `backend/internal/domain/services/permission_service.go`
- `backend/internal/domain/models/role.go`

**Features:**
1. Fine-grained permissions system
2. Custom role creation
3. Resource-level access control
4. Audit logging for permission changes

**Database Schema:**
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    name VARCHAR(100),
    description TEXT,
    permissions JSONB, -- {transactions: {read: true, write: true, delete: false}}
    is_system_role BOOLEAN DEFAULT false, -- owner, admin, editor, viewer
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_id INTEGER REFERENCES accounts(id),
    role_id INTEGER REFERENCES roles(id),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, account_id, role_id)
);

CREATE TABLE permission_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100),
    resource_type VARCHAR(50),
    resource_id INTEGER,
    permission_checked VARCHAR(100),
    granted BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**RBAC Middleware:**
- Check user roles for each protected endpoint
- Validate permissions before allowing operations
- Log all permission checks for audit

**API Endpoints:**
- `POST /api/accounts/:id/roles` - Create custom role
- `GET /api/accounts/:id/roles` - List roles
- `PUT /api/accounts/:id/roles/:roleId` - Update role
- `POST /api/accounts/:id/members/:userId/roles` - Assign role
- `GET /api/audit/permissions` - Permission audit log

#### Task 5: Team/Organization Mode
**Location:** `backend/` service
**Components:**
- `backend/internal/api/handlers/organization_handler.go`
- `backend/internal/domain/services/organization_service.go`
- `backend/internal/domain/models/organization.go`

**Features:**
1. Business expense tracking
2. Department budgets
3. Employee reimbursements
4. Expense approval workflows

**Database Schema:**
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    owner_id INTEGER REFERENCES users(id),
    settings JSONB, -- approval_threshold, expense_policies
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    name VARCHAR(255),
    budget_amount DECIMAL(15,2),
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reimbursements (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    employee_id INTEGER REFERENCES users(id),
    transaction_id INTEGER REFERENCES transactions(id),
    amount DECIMAL(15,2),
    status VARCHAR(50), -- pending, approved, rejected, paid
    receipt_url VARCHAR(500),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE transactions ADD COLUMN organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE transactions ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE budgets ADD COLUMN department_id INTEGER REFERENCES departments(id);
```

**API Endpoints:**
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id/departments` - List departments
- `POST /api/organizations/:id/departments` - Create department
- `POST /api/reimbursements` - Submit reimbursement
- `GET /api/reimbursements` - List reimbursements
- `PUT /api/reimbursements/:id/approve` - Approve reimbursement
- `GET /api/organizations/:id/expenses` - Organization expenses

---

## Testing Strategy

### Sprint 4 Testing
1. **Unit Tests:**
   - Analytics engine calculations
   - Anomaly detection algorithms
   - Report generation logic

2. **Integration Tests:**
   - API endpoint tests for all new analytics endpoints
   - Report generation and download
   - Forecast accuracy validation

3. **Performance Tests:**
   - Analytics query response time < 2s
   - Report generation < 5s
   - Large dataset handling

### Sprint 5 Testing
1. **Unit Tests:**
   - Permission validation logic
   - RBAC middleware
   - Invitation token generation

2. **Integration Tests:**
   - Multi-user account access
   - Permission enforcement
   - Collaboration workflow

3. **Security Tests:**
   - Permission bypass attempts
   - Unauthorized access prevention
   - Invitation token security

### Test Scripts
- `scripts/test-sprint4-analytics.sh` - Sprint 4 API tests
- `scripts/test-sprint5-collaboration.sh` - Sprint 5 API tests
- `backend/internal/domain/services/*_test.go` - Go unit tests
- `analytics/tests/test_*.py` - Python unit tests

---

## Implementation Timeline

**Total Estimated Time:** 4-6 weeks

### Sprint 4: 2-3 weeks
- Week 1: Advanced Analytics Engine + AI Insights
- Week 2: Custom Reports + Data Visualization
- Week 3: Goals Analytics + Tax Support + Testing

### Sprint 5: 2-3 weeks
- Week 1: Shared Accounts + RBAC
- Week 2: Family Budgeting + Collaboration
- Week 3: Organization Mode + Testing

---

## Success Criteria

### Sprint 4
- ✅ All analytics endpoints return data in < 2s
- ✅ Anomaly detection identifies unusual transactions
- ✅ Reports generate in < 5s
- ✅ AI recommendations are actionable
- ✅ 100% test coverage for new services

### Sprint 5
- ✅ Multi-user account sharing works correctly
- ✅ RBAC prevents unauthorized access
- ✅ Permission checks complete in < 10ms
- ✅ Invitation system delivers emails
- ✅ Collaboration features work across users
- ✅ 100% test coverage for RBAC logic

---

## Deployment Considerations

### Database Migrations
- All new tables and columns documented
- Migration scripts tested on staging
- Rollback scripts prepared

### Backward Compatibility
- Existing APIs remain functional
- New features are opt-in
- No breaking changes to current functionality

### Environment Variables
```bash
# Sprint 4
ENABLE_AI_INSIGHTS=true
REPORT_STORAGE_PATH=/var/reports
SMTP_SERVER=smtp.example.com # for report delivery

# Sprint 5
ENABLE_MULTITENANCY=true
MAX_ACCOUNT_MEMBERS=10
INVITATION_EXPIRY_HOURS=48
```

---

## Documentation Updates

### API Documentation
- Update `docs/API.md` with new endpoints
- Add examples for all new features
- Document permission requirements

### User Guide
- Update `docs/USER_GUIDE.md` with:
  - Advanced analytics features
  - How to share accounts
  - How to set up family budgets
  - How to use collaboration features

### Architecture Guide
- Update `docs/ARCHITECTURE.md` with:
  - RBAC system design
  - Multi-tenancy architecture
  - Report generation flow

---

**Implementation Start:** 2025-12-27
**Target Completion:** 2026-02-07
**Implemented By:** Backend Architect Agents (Parallel Execution)
