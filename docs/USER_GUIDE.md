# User Guide

## Getting Started

Welcome to the Personal Finance Management System! This guide will help you understand and use all the features available to manage your finances effectively.

## Account Setup

### Creating Your Account

1. **Registration**: Navigate to the registration page and provide:
   - Username (unique identifier)
   - Email address
   - Password (minimum 8 characters)
   - First and last name

2. **Email Verification**: Check your email for a verification link (if enabled)

3. **Login**: Use your username and password to access the system

### Test Account

For demonstration purposes, you can use the pre-configured test account:
- **Username**: `testuser`
- **Password**: `password123`

## Dashboard Overview

The main dashboard provides a comprehensive view of your financial status:

### Financial Summary
- **Total Assets**: Sum of all positive account balances
- **Total Liabilities**: Sum of all negative account balances (credit cards, loans)
- **Net Worth**: Assets minus liabilities
- **Monthly Income/Expenses**: Current month's financial activity

### Quick Stats
- Number of accounts
- Recent transactions
- Budget utilization
- Spending by category

## Account Management

### Account Types

The system supports various account types:

| Type | Description | Examples |
|------|-------------|----------|
| **Checking** | Daily transaction accounts | Primary checking, business checking |
| **Savings** | Interest-bearing savings | Emergency fund, vacation savings |
| **Credit Card** | Credit accounts (negative balances) | Visa, MasterCard, store cards |
| **Investment** | Investment and retirement accounts | 401k, IRA, brokerage |
| **Loan** | Debt accounts | Mortgage, auto loan, personal loan |

### Adding Accounts

1. Navigate to **Accounts** section
2. Click **Add Account**
3. Fill in account details:
   - **Name**: Descriptive name (e.g., "Chase Checking")
   - **Type**: Select appropriate account type
   - **Initial Balance**: Current account balance
   - **Currency**: Account currency (default: USD)
   - **Default Account**: Mark as primary account (optional)

### Managing Accounts

- **View Balance**: See current balance and account details
- **Edit Account**: Update name, type, or other details
- **Set Default**: Mark an account as your primary account
- **Delete Account**: Remove account (only if no transactions exist)

## Transaction Management

### Recording Transactions

#### Manual Entry

1. Go to **Transactions** section
2. Click **Add Transaction**
3. Enter transaction details:
   - **Amount**: Transaction amount (positive for income, negative for expenses)
   - **Description**: What the transaction was for
   - **Category**: Select from predefined categories
   - **Account**: Which account the transaction affects
   - **Date**: When the transaction occurred
   - **Tags**: Optional tags for better organization

#### Transaction Categories

**Income Categories:**
- Salary
- Freelance
- Investment Returns
- Other Income

**Expense Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Other

### Transaction Features

#### Filtering and Search
- **Date Range**: Filter by specific date periods
- **Category**: View transactions by category
- **Account**: Filter by specific account
- **Amount Range**: Filter by transaction amount
- **Search**: Find transactions by description or tags

#### Bulk Operations
- **Export**: Download transactions as CSV
- **Import**: Upload transactions from bank files (future feature)
- **Bulk Edit**: Modify multiple transactions at once

### Transaction Types

#### Income Transactions
Record money coming into your accounts:
```
Amount: +2500.00
Description: Monthly Salary
Category: Salary
Account: Main Checking
```

#### Expense Transactions
Record money going out of your accounts:
```
Amount: -85.50
Description: Grocery shopping
Category: Food & Dining
Account: Main Checking
```

#### Transfer Transactions
Move money between your accounts:
```
From Account: Checking
To Account: Savings
Amount: 500.00
Description: Monthly savings transfer
```

## Budget Management

### Creating Budgets

1. Navigate to **Budgets** section
2. Click **Create Budget**
3. Set budget parameters:
   - **Name**: Descriptive budget name
   - **Category**: Which spending category to track
   - **Amount**: Budget limit for the period
   - **Period**: Monthly, quarterly, or yearly
   - **Start/End Dates**: Budget timeframe

### Budget Types

#### Category Budgets
Track spending in specific categories:
- Food & Dining: $500/month
- Entertainment: $200/month
- Transportation: $300/month

#### Account Budgets
Set spending limits for specific accounts:
- Credit Card: $1000/month maximum
- Checking Account: Maintain $500 minimum

### Budget Monitoring

#### Real-time Tracking
- **Spent Amount**: How much you've spent in the category
- **Remaining**: How much budget is left
- **Utilization**: Percentage of budget used
- **Days Remaining**: Time left in budget period

#### Budget Alerts
The system provides automatic alerts when:
- 75% of budget is reached
- 90% of budget is reached
- Budget is exceeded
- Budget period is ending

### Budget Analysis

#### Performance Metrics
- **Average Monthly Spending**: Historical spending patterns
- **Budget Variance**: How actual spending compares to budgets
- **Trend Analysis**: Whether spending is increasing or decreasing
- **Category Breakdown**: Which categories consume most budget

## Financial Analytics

### Overview Dashboard

The analytics dashboard provides insights into your financial health:

#### Key Metrics
- **Net Worth Trend**: How your wealth changes over time
- **Income vs Expenses**: Monthly comparison
- **Savings Rate**: Percentage of income saved
- **Debt-to-Income Ratio**: Financial health indicator

#### Visual Charts
- **Spending by Category**: Pie chart of expense distribution
- **Income/Expense Trends**: Line chart over time
- **Account Balance History**: Track account growth
- **Budget Performance**: Visual budget utilization

### Spending Analysis

#### Category Analysis
- **Top Spending Categories**: Where most money goes
- **Category Trends**: How spending patterns change
- **Seasonal Patterns**: Identify seasonal spending variations
- **Unusual Spending**: Detect spending anomalies

#### Time-based Analysis
- **Monthly Trends**: Compare month-to-month spending
- **Quarterly Reports**: Seasonal financial patterns
- **Year-over-Year**: Annual financial growth
- **Weekly Patterns**: Identify weekly spending habits

### Financial Insights

The system provides AI-powered insights and recommendations:

#### Spending Insights
- "Your food spending increased 15% this month"
- "You're spending 20% more on entertainment than budgeted"
- "Transportation costs are trending upward"

#### Savings Opportunities
- "You could save $200/month by reducing dining out"
- "Consider increasing your emergency fund"
- "You're on track to meet your savings goal"

#### Budget Recommendations
- "Your food budget might be too restrictive"
- "Consider creating a budget for miscellaneous expenses"
- "Your entertainment budget has room for increase"

## Security Features

### Authentication

#### Password Security
- Minimum 8 characters required
- Passwords are encrypted using bcrypt
- Regular password changes recommended

#### Two-Factor Authentication (2FA)
1. Enable 2FA in **Profile Settings**
2. Scan QR code with authenticator app
3. Enter verification code to confirm
4. Use authenticator code for each login

### Data Protection

#### Encryption
- All data transmitted over HTTPS
- Passwords stored with strong encryption
- JWT tokens for secure API access

#### Privacy
- Personal data is never shared with third parties
- Financial data remains private and secure
- Regular security audits and updates

### Session Management

#### Token Security
- Access tokens expire after 24 hours
- Refresh tokens for seamless experience
- Automatic logout after inactivity
- Secure token storage

## Tips and Best Practices

### Financial Management

#### Regular Updates
- Record transactions daily or weekly
- Review budgets monthly
- Update account balances regularly
- Reconcile with bank statements

#### Organization
- Use consistent transaction descriptions
- Apply relevant tags for easy searching
- Create meaningful budget names
- Categorize transactions accurately

#### Goal Setting
- Set realistic budget amounts
- Create specific savings goals
- Track progress regularly
- Adjust budgets based on actual spending

### System Usage

#### Data Entry
- Be consistent with naming conventions
- Use descriptive transaction descriptions
- Tag transactions for better organization
- Regular data backup (export features)

#### Security
- Use strong, unique passwords
- Enable two-factor authentication
- Log out when using shared computers
- Monitor account activity regularly

## Troubleshooting

### Common Issues

#### Login Problems
- **Forgot Password**: Use password reset feature
- **Account Locked**: Contact support after multiple failed attempts
- **2FA Issues**: Use backup codes or disable/re-enable 2FA

#### Data Issues
- **Missing Transactions**: Check date filters and account selection
- **Incorrect Balances**: Verify all transactions are recorded
- **Budget Not Updating**: Ensure transactions are properly categorized

#### Performance Issues
- **Slow Loading**: Check internet connection
- **Sync Issues**: Refresh page or log out/in
- **Mobile Issues**: Use latest browser version

### Getting Help

#### Documentation
- Review this user guide
- Check API documentation for developers
- Read setup instructions for technical issues

#### Support Channels
- GitHub Issues for bug reports
- Email support for account issues
- Community forums for general questions

## Advanced Features

### API Access

For developers and advanced users, the system provides full API access:
- RESTful API endpoints
- JWT authentication
- Comprehensive documentation
- Rate limiting for security

### Data Export

Export your financial data in various formats:
- **CSV**: For spreadsheet analysis
- **JSON**: For programmatic access
- **PDF**: For reports and records
- **Backup**: Complete data backup

### Integrations

Future integrations planned:
- Bank account synchronization
- Credit card automatic imports
- Investment account tracking
- Tax preparation software export

## Conclusion

The Personal Finance Management System provides comprehensive tools for managing your financial life. Regular use of these features will help you:

- Track spending patterns
- Stay within budgets
- Achieve savings goals
- Make informed financial decisions
- Build long-term wealth

For additional help or feature requests, please refer to the project documentation or contact support.
