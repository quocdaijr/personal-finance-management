import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import load_data_to_dataframe

def get_financial_overview(user_id: int):
    """
    Get financial overview with key metrics
    """
    # Get current date and date ranges
    now = datetime.now()
    this_month_start = datetime(now.year, now.month, 1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = this_month_start - timedelta(days=1)
    
    # Format dates for SQL queries
    this_month_start_str = this_month_start.strftime('%Y-%m-%d')
    last_month_start_str = last_month_start.strftime('%Y-%m-%d')
    last_month_end_str = last_month_end.strftime('%Y-%m-%d')
    
    # SQL query to get accounts
    accounts_query = f"""
    SELECT 
        id, name, type, balance, currency, is_default
    FROM 
        accounts
    WHERE 
        user_id = {user_id}
    """
    
    # SQL query to get transactions for this month
    this_month_query = f"""
    SELECT 
        id, amount, type, category, date
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date >= '{this_month_start_str}'
    """
    
    # SQL query to get transactions for last month
    last_month_query = f"""
    SELECT 
        id, amount, type, category, date
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date BETWEEN '{last_month_start_str}' AND '{last_month_end_str}'
    """
    
    # SQL query to get budgets
    budgets_query = f"""
    SELECT 
        id, name, amount, spent, category, period
    FROM 
        budgets
    WHERE 
        user_id = {user_id}
    """
    
    # Load data into DataFrames
    accounts_df = load_data_to_dataframe(accounts_query)
    this_month_df = load_data_to_dataframe(this_month_query)
    last_month_df = load_data_to_dataframe(last_month_query)
    budgets_df = load_data_to_dataframe(budgets_query)
    
    # Calculate account metrics
    total_accounts = len(accounts_df) if not accounts_df.empty else 0
    total_balance = accounts_df['balance'].sum() if not accounts_df.empty else 0
    
    # Calculate this month's metrics
    this_month_income = this_month_df[this_month_df['type'] == 'income']['amount'].sum() if not this_month_df.empty else 0
    this_month_expenses = this_month_df[this_month_df['type'] == 'expense']['amount'].sum() if not this_month_df.empty else 0
    this_month_net = this_month_income - this_month_expenses
    
    # Calculate last month's metrics
    last_month_income = last_month_df[last_month_df['type'] == 'income']['amount'].sum() if not last_month_df.empty else 0
    last_month_expenses = last_month_df[last_month_df['type'] == 'expense']['amount'].sum() if not last_month_df.empty else 0
    last_month_net = last_month_income - last_month_expenses
    
    # Calculate budget metrics
    total_budgeted = budgets_df['amount'].sum() if not budgets_df.empty else 0
    total_spent = budgets_df['spent'].sum() if not budgets_df.empty else 0
    budget_remaining = total_budgeted - total_spent
    budget_progress = (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0
    
    # Calculate month-over-month changes
    income_change = ((this_month_income - last_month_income) / last_month_income * 100) if last_month_income > 0 else 0
    expenses_change = ((this_month_expenses - last_month_expenses) / last_month_expenses * 100) if last_month_expenses > 0 else 0
    net_change = ((this_month_net - last_month_net) / abs(last_month_net) * 100) if last_month_net != 0 else 0
    
    # Get top expense categories for this month
    top_expenses = []
    if not this_month_df.empty:
        expenses_by_category = this_month_df[this_month_df['type'] == 'expense'].groupby('category')['amount'].sum()
        for category, amount in expenses_by_category.nlargest(5).items():
            top_expenses.append({
                "category": category,
                "amount": float(amount),
                "percentage": float(amount / this_month_expenses * 100) if this_month_expenses > 0 else 0
            })
    
    # Get budgets nearing limit
    budgets_at_risk = []
    if not budgets_df.empty:
        for _, row in budgets_df.iterrows():
            progress = (row['spent'] / row['amount'] * 100) if row['amount'] > 0 else 0
            if progress >= 80:
                budgets_at_risk.append({
                    "id": int(row['id']),
                    "name": row['name'],
                    "category": row['category'],
                    "amount": float(row['amount']),
                    "spent": float(row['spent']),
                    "remaining": float(row['amount'] - row['spent']),
                    "progress": float(progress)
                })
    
    # Sort budgets at risk by progress
    budgets_at_risk.sort(key=lambda x: x['progress'], reverse=True)
    
    return {
        "accounts": {
            "total_accounts": total_accounts,
            "total_balance": float(total_balance)
        },
        "this_month": {
            "income": float(this_month_income),
            "expenses": float(this_month_expenses),
            "net": float(this_month_net),
            "top_expenses": top_expenses
        },
        "last_month": {
            "income": float(last_month_income),
            "expenses": float(last_month_expenses),
            "net": float(last_month_net)
        },
        "month_over_month": {
            "income_change": float(income_change),
            "expenses_change": float(expenses_change),
            "net_change": float(net_change)
        },
        "budgets": {
            "total_budgeted": float(total_budgeted),
            "total_spent": float(total_spent),
            "remaining": float(budget_remaining),
            "progress": float(budget_progress),
            "at_risk": budgets_at_risk
        }
    }

def get_financial_insights(user_id: int):
    """
    Get financial insights and recommendations
    """
    # Get financial overview
    overview = get_financial_overview(user_id)
    
    # Initialize insights and recommendations
    insights = []
    recommendations = []
    
    # Analyze income vs expenses
    this_month_income = overview['this_month']['income']
    this_month_expenses = overview['this_month']['expenses']
    this_month_net = overview['this_month']['net']
    
    if this_month_net < 0:
        insights.append({
            "type": "warning",
            "category": "cash_flow",
            "message": "You're spending more than you earn this month."
        })
        recommendations.append({
            "category": "cash_flow",
            "message": "Review your expenses and identify areas where you can cut back."
        })
    elif this_month_net > 0:
        insights.append({
            "type": "positive",
            "category": "cash_flow",
            "message": "You're earning more than you spend this month."
        })
        
        # If saving rate is low
        saving_rate = (this_month_net / this_month_income * 100) if this_month_income > 0 else 0
        if saving_rate < 20 and this_month_income > 0:
            recommendations.append({
                "category": "savings",
                "message": "Consider increasing your savings rate to at least 20% of your income."
            })
    
    # Analyze month-over-month changes
    income_change = overview['month_over_month']['income_change']
    expenses_change = overview['month_over_month']['expenses_change']
    
    if income_change < -10:
        insights.append({
            "type": "warning",
            "category": "income",
            "message": f"Your income has decreased by {abs(income_change):.1f}% compared to last month."
        })
    elif income_change > 10:
        insights.append({
            "type": "positive",
            "category": "income",
            "message": f"Your income has increased by {income_change:.1f}% compared to last month."
        })
    
    if expenses_change > 20:
        insights.append({
            "type": "warning",
            "category": "expenses",
            "message": f"Your expenses have increased by {expenses_change:.1f}% compared to last month."
        })
        recommendations.append({
            "category": "expenses",
            "message": "Review your spending categories to identify where expenses have increased significantly."
        })
    elif expenses_change < -10:
        insights.append({
            "type": "positive",
            "category": "expenses",
            "message": f"Your expenses have decreased by {abs(expenses_change):.1f}% compared to last month."
        })
    
    # Analyze budget status
    budgets_at_risk = overview['budgets']['at_risk']
    if budgets_at_risk:
        over_budget = [b for b in budgets_at_risk if b['progress'] > 100]
        near_limit = [b for b in budgets_at_risk if 80 <= b['progress'] <= 100]
        
        if over_budget:
            insights.append({
                "type": "warning",
                "category": "budget",
                "message": f"You have {len(over_budget)} budget(s) that are over the limit."
            })
            
            # Add specific recommendations for top 3 over-budget categories
            for i, budget in enumerate(over_budget[:3]):
                recommendations.append({
                    "category": "budget",
                    "message": f"Your {budget['category']} budget is over by {budget['progress'] - 100:.1f}%. Consider adjusting your spending or increasing the budget."
                })
        
        if near_limit:
            insights.append({
                "type": "warning",
                "category": "budget",
                "message": f"You have {len(near_limit)} budget(s) that are near the limit (80-100%)."
            })
    
    # Analyze top expense categories
    top_expenses = overview['this_month']['top_expenses']
    if top_expenses:
        # Check if any category is taking up a large percentage of expenses
        for expense in top_expenses:
            if expense['percentage'] > 40:
                insights.append({
                    "type": "info",
                    "category": "expenses",
                    "message": f"Your {expense['category']} expenses account for {expense['percentage']:.1f}% of your total expenses."
                })
                recommendations.append({
                    "category": "expenses",
                    "message": f"Look for ways to reduce your {expense['category']} expenses, as they make up a significant portion of your spending."
                })
    
    # Analyze account balances
    total_balance = overview['accounts']['total_balance']
    monthly_expenses = this_month_expenses
    
    # Check if emergency fund is adequate (3-6 months of expenses)
    if monthly_expenses > 0:
        months_of_expenses = total_balance / monthly_expenses
        if months_of_expenses < 3:
            insights.append({
                "type": "warning",
                "category": "emergency_fund",
                "message": f"Your total balance covers only {months_of_expenses:.1f} months of expenses."
            })
            recommendations.append({
                "category": "emergency_fund",
                "message": "Aim to build an emergency fund that covers 3-6 months of expenses."
            })
        elif months_of_expenses >= 3 and months_of_expenses < 6:
            insights.append({
                "type": "info",
                "category": "emergency_fund",
                "message": f"Your total balance covers {months_of_expenses:.1f} months of expenses."
            })
        else:
            insights.append({
                "type": "positive",
                "category": "emergency_fund",
                "message": f"Your total balance covers {months_of_expenses:.1f} months of expenses, which is a good emergency fund."
            })
    
    # Add general recommendations if we don't have many specific ones
    if len(recommendations) < 3:
        if this_month_income > 0 and this_month_net > 0:
            recommendations.append({
                "category": "investment",
                "message": "Consider investing your surplus income to grow your wealth over time."
            })
        
        recommendations.append({
            "category": "tracking",
            "message": "Regularly track your expenses to identify patterns and areas for improvement."
        })
        
        recommendations.append({
            "category": "planning",
            "message": "Set clear financial goals and create a plan to achieve them."
        })
    
    return {
        "insights": insights,
        "recommendations": recommendations,
        "summary": {
            "insight_count": len(insights),
            "positive_count": len([i for i in insights if i['type'] == 'positive']),
            "warning_count": len([i for i in insights if i['type'] == 'warning']),
            "info_count": len([i for i in insights if i['type'] == 'info']),
            "recommendation_count": len(recommendations)
        }
    }
