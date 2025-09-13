from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
import jwt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import get_db, load_data_to_dataframe
from models import User, Account, Transaction, Budget
from auth import AuthHandler

app = FastAPI(title="Finance Management Analytics API", version="1.0.0")
security = HTTPBearer()
auth_handler = AuthHandler()

@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.get("/api/analytics/overview")
def get_financial_overview(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get financial overview analytics for the authenticated user"""
    try:
        # Decode and validate token
        payload = auth_handler.decode_token(auth.credentials)
        user_id = payload.get('user_id')

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get user's accounts
        accounts_query = f"""
        SELECT id, name, type, balance, currency, is_default
        FROM accounts
        WHERE user_id = {user_id}
        """
        accounts_df = load_data_to_dataframe(accounts_query)

        # Get user's transactions for the last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        transactions_query = f"""
        SELECT amount, description, category, type, date, account_id
        FROM transactions
        WHERE user_id = {user_id} AND date >= '{thirty_days_ago.isoformat()}'
        ORDER BY date DESC
        """
        transactions_df = load_data_to_dataframe(transactions_query)

        # Calculate overview metrics
        total_assets = accounts_df[accounts_df['balance'] > 0]['balance'].sum() if not accounts_df.empty else 0
        total_liabilities = abs(accounts_df[accounts_df['balance'] < 0]['balance'].sum()) if not accounts_df.empty else 0
        net_worth = total_assets - total_liabilities

        # Calculate income and expenses for the last 30 days
        if not transactions_df.empty:
            income_30d = transactions_df[transactions_df['type'] == 'income']['amount'].sum()
            expenses_30d = abs(transactions_df[transactions_df['type'] == 'expense']['amount'].sum())
        else:
            income_30d = 0
            expenses_30d = 0

        # Calculate spending by category
        spending_by_category = []
        if not transactions_df.empty:
            expense_transactions = transactions_df[transactions_df['type'] == 'expense']
            if not expense_transactions.empty:
                category_spending = expense_transactions.groupby('category')['amount'].sum().abs()
                spending_by_category = [
                    {"category": cat, "amount": float(amount)}
                    for cat, amount in category_spending.items()
                ]

        return {
            "total_assets": float(total_assets),
            "total_liabilities": float(total_liabilities),
            "net_worth": float(net_worth),
            "income_30d": float(income_30d),
            "expenses_30d": float(expenses_30d),
            "balance_30d": float(income_30d - expenses_30d),
            "spending_by_category": spending_by_category,
            "total_accounts": len(accounts_df) if not accounts_df.empty else 0
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating overview: {str(e)}")

@app.get("/api/analytics/transactions/trends")
def get_transaction_trends(
    period: str = "month",
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get transaction trends analysis"""
    try:
        # Decode and validate token
        payload = auth_handler.decode_token(auth.credentials)
        user_id = payload.get('user_id')

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Calculate date range based on period
        if period == "week":
            start_date = datetime.now() - timedelta(weeks=12)  # 12 weeks
        elif period == "month":
            start_date = datetime.now() - timedelta(days=365)  # 12 months
        else:
            start_date = datetime.now() - timedelta(days=365)  # Default to year

        # Get transactions for the period
        transactions_query = f"""
        SELECT amount, description, category, type, date
        FROM transactions
        WHERE user_id = {user_id} AND date >= '{start_date.isoformat()}'
        ORDER BY date
        """
        transactions_df = load_data_to_dataframe(transactions_query)

        if transactions_df.empty:
            return {
                "trends": [],
                "total_income": 0,
                "total_expenses": 0,
                "average_monthly_income": 0,
                "average_monthly_expenses": 0
            }

        # Convert date column to datetime
        transactions_df['date'] = pd.to_datetime(transactions_df['date'])

        # Group by month and calculate totals
        transactions_df['month'] = transactions_df['date'].dt.to_period('M')
        monthly_data = transactions_df.groupby(['month', 'type'])['amount'].sum().unstack(fill_value=0)

        # Prepare trends data
        trends = []
        for month in monthly_data.index:
            income = monthly_data.loc[month, 'income'] if 'income' in monthly_data.columns else 0
            expenses = abs(monthly_data.loc[month, 'expense']) if 'expense' in monthly_data.columns else 0

            trends.append({
                "period": str(month),
                "income": float(income),
                "expenses": float(expenses),
                "net": float(income - expenses)
            })

        # Calculate totals and averages
        total_income = float(transactions_df[transactions_df['type'] == 'income']['amount'].sum())
        total_expenses = float(abs(transactions_df[transactions_df['type'] == 'expense']['amount'].sum()))

        months_count = len(monthly_data) if len(monthly_data) > 0 else 1
        avg_monthly_income = total_income / months_count
        avg_monthly_expenses = total_expenses / months_count

        return {
            "trends": trends,
            "total_income": total_income,
            "total_expenses": total_expenses,
            "average_monthly_income": float(avg_monthly_income),
            "average_monthly_expenses": float(avg_monthly_expenses)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating trends: {str(e)}")

@app.get("/api/analytics/insights")
def get_financial_insights(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get financial insights and recommendations"""
    try:
        # Decode and validate token
        payload = auth_handler.decode_token(auth.credentials)
        user_id = payload.get('user_id')

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        insights = []

        # Get recent transactions (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        transactions_query = f"""
        SELECT amount, category, type, date
        FROM transactions
        WHERE user_id = {user_id} AND date >= '{thirty_days_ago.isoformat()}'
        """
        transactions_df = load_data_to_dataframe(transactions_query)

        if not transactions_df.empty:
            # Analyze spending patterns
            expense_transactions = transactions_df[transactions_df['type'] == 'expense']

            if not expense_transactions.empty:
                # Find highest spending category
                category_spending = expense_transactions.groupby('category')['amount'].sum().abs()
                highest_category = category_spending.idxmax()
                highest_amount = category_spending.max()

                insights.append({
                    "type": "spending_pattern",
                    "title": "Highest Spending Category",
                    "description": f"You spent ${highest_amount:.2f} on {highest_category} in the last 30 days",
                    "category": "spending",
                    "priority": "medium"
                })

                # Check for unusual spending
                avg_daily_spending = abs(expense_transactions['amount'].sum()) / 30
                if avg_daily_spending > 100:  # Threshold for high spending
                    insights.append({
                        "type": "spending_alert",
                        "title": "High Daily Spending",
                        "description": f"Your average daily spending is ${avg_daily_spending:.2f}. Consider reviewing your expenses.",
                        "category": "alert",
                        "priority": "high"
                    })

        # Get budget information
        budgets_query = f"""
        SELECT name, amount, spent, category
        FROM budgets
        WHERE user_id = {user_id}
        """
        budgets_df = load_data_to_dataframe(budgets_query)

        if not budgets_df.empty:
            # Check budget utilization
            for _, budget in budgets_df.iterrows():
                utilization = (budget['spent'] / budget['amount']) * 100 if budget['amount'] > 0 else 0

                if utilization > 90:
                    insights.append({
                        "type": "budget_alert",
                        "title": f"Budget Alert: {budget['name']}",
                        "description": f"You've used {utilization:.1f}% of your {budget['name']} budget",
                        "category": "budget",
                        "priority": "high"
                    })
                elif utilization > 75:
                    insights.append({
                        "type": "budget_warning",
                        "title": f"Budget Warning: {budget['name']}",
                        "description": f"You've used {utilization:.1f}% of your {budget['name']} budget",
                        "category": "budget",
                        "priority": "medium"
                    })

        return {
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)