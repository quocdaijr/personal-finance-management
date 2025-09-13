# Database Schema Documentation

## Overview

The Personal Finance Management System uses a relational database design with four core entities: Users, Accounts, Transactions, and Budgets. The schema is designed for data integrity, performance, and scalability.

## Database Support

- **Development**: SQLite (file-based, zero configuration)
- **Production**: PostgreSQL (recommended for scalability)
- **Testing**: In-memory SQLite for unit tests

## Entity Relationship Diagram

```
┌─────────────────┐
│      Users      │
│─────────────────│
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ first_name      │
│ last_name       │
│ is_active       │
│ is_email_verified│
│ two_factor_enabled│
│ last_login_at   │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐    ┌─────────────────┐
│    Accounts     │    │   Transactions  │
│─────────────────│    │─────────────────│
│ id (PK)         │◄──►│ id (PK)         │
│ user_id (FK)    │ N:1│ user_id (FK)    │
│ name            │    │ account_id (FK) │
│ type            │    │ amount          │
│ balance         │    │ description     │
│ currency        │    │ category        │
│ is_default      │    │ type            │
│ created_at      │    │ date            │
│ updated_at      │    │ tags            │
└─────────────────┘    │ created_at      │
         │              │ updated_at      │
         │              └─────────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│     Budgets     │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ name            │
│ amount          │
│ category        │
│ period          │
│ start_date      │
│ end_date        │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Table Definitions

### Users Table

Stores user account information and authentication data.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing |
| `username` | VARCHAR(50) | Unique username for login |
| `email` | VARCHAR(100) | Unique email address |
| `password_hash` | VARCHAR(255) | bcrypt hashed password |
| `first_name` | VARCHAR(50) | User's first name |
| `last_name` | VARCHAR(50) | User's last name |
| `is_active` | BOOLEAN | Account active status |
| `is_email_verified` | BOOLEAN | Email verification status |
| `two_factor_enabled` | BOOLEAN | 2FA enabled status |
| `two_factor_secret` | VARCHAR(255) | TOTP secret for 2FA |
| `last_login_at` | TIMESTAMP | Last successful login |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

### Accounts Table

Stores financial account information for each user.

```sql
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing |
| `user_id` | INTEGER | Foreign key to users table |
| `name` | VARCHAR(100) | Account display name |
| `type` | VARCHAR(50) | Account type (checking, savings, etc.) |
| `balance` | DECIMAL(15,2) | Current account balance |
| `currency` | VARCHAR(3) | Currency code (ISO 4217) |
| `is_default` | BOOLEAN | Primary account flag |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Account Types:**
- `checking` - Checking accounts
- `savings` - Savings accounts
- `credit_card` - Credit card accounts
- `investment` - Investment accounts
- `loan` - Loan accounts
- `other` - Other account types

**Indexes:**
```sql
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_default ON accounts(user_id, is_default);
```

### Transactions Table

Stores all financial transactions for users.

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    type VARCHAR(20) NOT NULL,
    date TIMESTAMP NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing |
| `user_id` | INTEGER | Foreign key to users table |
| `account_id` | INTEGER | Foreign key to accounts table |
| `amount` | DECIMAL(15,2) | Transaction amount (positive/negative) |
| `description` | TEXT | Transaction description |
| `category` | VARCHAR(100) | Transaction category |
| `type` | VARCHAR(20) | Transaction type (income/expense) |
| `date` | TIMESTAMP | Transaction date |
| `tags` | TEXT[] | Array of tags for organization |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Transaction Types:**
- `income` - Money coming in
- `expense` - Money going out
- `transfer` - Money moved between accounts

**Common Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Income
- Other

**Indexes:**
```sql
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
```

### Budgets Table

Stores budget information and spending limits.

```sql
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100),
    period VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing |
| `user_id` | INTEGER | Foreign key to users table |
| `name` | VARCHAR(100) | Budget display name |
| `amount` | DECIMAL(15,2) | Budget limit amount |
| `category` | VARCHAR(100) | Category this budget applies to |
| `period` | VARCHAR(20) | Budget period (monthly, quarterly, yearly) |
| `start_date` | TIMESTAMP | Budget start date |
| `end_date` | TIMESTAMP | Budget end date |
| `created_at` | TIMESTAMP | Budget creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Budget Periods:**
- `monthly` - Monthly budgets
- `quarterly` - Quarterly budgets
- `yearly` - Annual budgets
- `custom` - Custom date range

**Indexes:**
```sql
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);
```

## Relationships

### User → Accounts (1:N)
- Each user can have multiple accounts
- Accounts are deleted when user is deleted (CASCADE)
- One account can be marked as default per user

### User → Transactions (1:N)
- Each user can have multiple transactions
- Transactions are deleted when user is deleted (CASCADE)
- Transactions must belong to user's accounts

### Account → Transactions (1:N)
- Each account can have multiple transactions
- Transactions are deleted when account is deleted (CASCADE)
- Account balance is calculated from transactions

### User → Budgets (1:N)
- Each user can have multiple budgets
- Budgets are deleted when user is deleted (CASCADE)
- Budgets can overlap in time periods

## Data Integrity

### Constraints

```sql
-- Ensure positive budget amounts
ALTER TABLE budgets ADD CONSTRAINT chk_budget_amount_positive 
CHECK (amount > 0);

-- Ensure valid budget periods
ALTER TABLE budgets ADD CONSTRAINT chk_budget_period 
CHECK (period IN ('monthly', 'quarterly', 'yearly', 'custom'));

-- Ensure valid transaction types
ALTER TABLE transactions ADD CONSTRAINT chk_transaction_type 
CHECK (type IN ('income', 'expense', 'transfer'));

-- Ensure valid account types
ALTER TABLE accounts ADD CONSTRAINT chk_account_type 
CHECK (type IN ('checking', 'savings', 'credit_card', 'investment', 'loan', 'other'));

-- Ensure end date is after start date for budgets
ALTER TABLE budgets ADD CONSTRAINT chk_budget_date_order 
CHECK (end_date > start_date);
```

### Triggers

```sql
-- Update account balance when transaction is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE accounts 
        SET balance = balance + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.account_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE accounts 
        SET balance = balance - OLD.amount + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.account_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE accounts 
        SET balance = balance - OLD.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.account_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

### Test User
```sql
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, is_email_verified)
VALUES ('testuser', 'test@example.com', '$2a$10$...', 'Test', 'User', true, true);
```

### Sample Accounts
```sql
INSERT INTO accounts (user_id, name, type, balance, currency, is_default)
VALUES 
    (1, 'Main Checking', 'checking', 2500.00, 'USD', true),
    (1, 'Savings Account', 'savings', 10000.00, 'USD', false),
    (1, 'Credit Card', 'credit_card', -1500.00, 'USD', false),
    (1, 'Investment Account', 'investment', 25000.00, 'USD', false);
```

### Sample Transactions
```sql
INSERT INTO transactions (user_id, account_id, amount, description, category, type, date, tags)
VALUES 
    (1, 1, 3000.00, 'Monthly Salary', 'Income', 'income', '2025-01-01', ARRAY['salary', 'work']),
    (1, 1, -85.50, 'Grocery Shopping', 'Food & Dining', 'expense', '2025-01-02', ARRAY['groceries', 'food']),
    (1, 1, -45.00, 'Gas Station', 'Transportation', 'expense', '2025-01-03', ARRAY['gas', 'car']),
    (1, 2, 500.00, 'Monthly Savings', 'Transfer', 'transfer', '2025-01-01', ARRAY['savings']);
```

### Sample Budgets
```sql
INSERT INTO budgets (user_id, name, amount, category, period, start_date, end_date)
VALUES 
    (1, 'Monthly Food Budget', 500.00, 'Food & Dining', 'monthly', '2025-01-01', '2025-01-31'),
    (1, 'Transportation Budget', 300.00, 'Transportation', 'monthly', '2025-01-01', '2025-01-31'),
    (1, 'Entertainment Budget', 200.00, 'Entertainment', 'monthly', '2025-01-01', '2025-01-31');
```

## Performance Optimization

### Query Optimization

Common queries and their optimizations:

```sql
-- Get user's account summary (optimized with indexes)
SELECT 
    COUNT(*) as total_accounts,
    SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as total_assets,
    SUM(CASE WHEN balance < 0 THEN ABS(balance) ELSE 0 END) as total_liabilities,
    SUM(balance) as net_worth
FROM accounts 
WHERE user_id = $1;

-- Get transactions with pagination (uses composite index)
SELECT * FROM transactions 
WHERE user_id = $1 
ORDER BY date DESC, id DESC 
LIMIT $2 OFFSET $3;

-- Get spending by category (uses category index)
SELECT 
    category,
    SUM(ABS(amount)) as total_spent,
    COUNT(*) as transaction_count
FROM transactions 
WHERE user_id = $1 
    AND type = 'expense' 
    AND date >= $2 
    AND date <= $3
GROUP BY category
ORDER BY total_spent DESC;
```

### Maintenance

Regular maintenance tasks:

```sql
-- Analyze tables for query optimization
ANALYZE users;
ANALYZE accounts;
ANALYZE transactions;
ANALYZE budgets;

-- Vacuum tables to reclaim space
VACUUM ANALYZE transactions;

-- Reindex for performance
REINDEX TABLE transactions;
```

## Migration Strategy

### Version Control

Database migrations are managed through Go migrate tool:

```bash
# Create new migration
migrate create -ext sql -dir migrations -seq add_new_feature

# Apply migrations
migrate -path migrations -database "postgres://user:pass@host/db" up

# Rollback migrations
migrate -path migrations -database "postgres://user:pass@host/db" down 1
```

### Backup and Recovery

```bash
# Backup database
pg_dump -h localhost -U username -d finance_management > backup.sql

# Restore database
psql -h localhost -U username -d finance_management < backup.sql

# SQLite backup
cp finance-management.db finance-management-backup.db
```
