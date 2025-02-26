import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import load_data_to_dataframe

def get_transaction_analytics(user_id: int, period: str = 'month'):
    """
    Get transaction analytics for a specific period
    """
    # Calculate date range based on period
    end_date = datetime.now()
    if period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Format dates for SQL query
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    # SQL query to get transactions for the period
    query = f"""
    SELECT 
        id, amount, description, category, type, date, account_id, tags, created_at, updated_at
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date BETWEEN '{start_date_str}' AND '{end_date_str}'
    ORDER BY 
        date DESC
    """
    
    # Load data into DataFrame
    df = load_data_to_dataframe(query)
    
    # If no data, return empty analytics
    if df.empty:
        return {
            "period": period,
            "total_transactions": 0,
            "total_income": 0,
            "total_expenses": 0,
            "net_cash_flow": 0,
            "average_transaction": 0,
            "category_breakdown": [],
            "daily_totals": [],
            "transaction_types": {"income": 0, "expense": 0}
        }
    
    # Calculate basic metrics
    income_df = df[df['type'] == 'income']
    expense_df = df[df['type'] == 'expense']
    
    total_income = income_df['amount'].sum() if not income_df.empty else 0
    total_expenses = expense_df['amount'].sum() if not expense_df.empty else 0
    net_cash_flow = total_income - total_expenses
    avg_transaction = df['amount'].mean()
    
    # Category breakdown
    category_breakdown = []
    for category, group in df.groupby('category'):
        income = group[group['type'] == 'income']['amount'].sum()
        expense = group[group['type'] == 'expense']['amount'].sum()
        category_breakdown.append({
            "category": category,
            "income": float(income),
            "expense": float(expense),
            "net": float(income - expense),
            "count": len(group)
        })
    
    # Sort by absolute net value
    category_breakdown.sort(key=lambda x: abs(x['net']), reverse=True)
    
    # Daily totals for trend analysis
    df['date'] = pd.to_datetime(df['date'])
    df['date_only'] = df['date'].dt.date
    
    daily_totals = []
    for date, group in df.groupby('date_only'):
        income = group[group['type'] == 'income']['amount'].sum()
        expense = group[group['type'] == 'expense']['amount'].sum()
        daily_totals.append({
            "date": date.strftime('%Y-%m-%d'),
            "income": float(income),
            "expense": float(expense),
            "net": float(income - expense)
        })
    
    # Sort by date
    daily_totals.sort(key=lambda x: x['date'])
    
    # Transaction types
    transaction_types = {
        "income": len(income_df),
        "expense": len(expense_df)
    }
    
    # Return analytics
    return {
        "period": period,
        "total_transactions": len(df),
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net_cash_flow": float(net_cash_flow),
        "average_transaction": float(avg_transaction),
        "category_breakdown": category_breakdown,
        "daily_totals": daily_totals,
        "transaction_types": transaction_types
    }

def get_spending_trends(user_id: int, period: str = 'month'):
    """
    Get spending trends over time
    """
    # Calculate date range based on period
    end_date = datetime.now()
    if period == 'week':
        start_date = end_date - timedelta(days=7)
        group_by = 'day'
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
        group_by = 'day'
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
        group_by = 'month'
    else:
        start_date = end_date - timedelta(days=30)
        group_by = 'day'
    
    # Format dates for SQL query
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    # SQL query to get transactions for the period
    query = f"""
    SELECT 
        id, amount, type, date, category
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date BETWEEN '{start_date_str}' AND '{end_date_str}'
    ORDER BY 
        date
    """
    
    # Load data into DataFrame
    df = load_data_to_dataframe(query)
    
    # If no data, return empty trends
    if df.empty:
        return {
            "period": period,
            "trends": []
        }
    
    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by time period
    if group_by == 'day':
        df['period'] = df['date'].dt.date
    elif group_by == 'month':
        df['period'] = df['date'].dt.strftime('%Y-%m')
    
    # Calculate trends
    trends = []
    for period_val, group in df.groupby('period'):
        income = group[group['type'] == 'income']['amount'].sum()
        expense = group[group['type'] == 'expense']['amount'].sum()
        
        # Get top expense categories
        if not group[group['type'] == 'expense'].empty:
            top_categories = group[group['type'] == 'expense'].groupby('category')['amount'].sum().sort_values(ascending=False).head(3)
            top_categories_list = [{"category": cat, "amount": float(amt)} for cat, amt in top_categories.items()]
        else:
            top_categories_list = []
        
        trends.append({
            "period": str(period_val),
            "income": float(income),
            "expense": float(expense),
            "net": float(income - expense),
            "top_expense_categories": top_categories_list
        })
    
    # Sort by period
    trends.sort(key=lambda x: x['period'])
    
    return {
        "period": period,
        "group_by": group_by,
        "trends": trends
    }

def get_category_breakdown(user_id: int, type: str = 'expense', period: str = 'month'):
    """
    Get breakdown of transactions by category
    """
    # Calculate date range based on period
    end_date = datetime.now()
    if period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Format dates for SQL query
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    # SQL query to get transactions for the period and type
    type_filter = f"AND type = '{type}'" if type != 'all' else ""
    query = f"""
    SELECT 
        category, amount, type, date
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date BETWEEN '{start_date_str}' AND '{end_date_str}'
        {type_filter}
    ORDER BY 
        date
    """
    
    # Load data into DataFrame
    df = load_data_to_dataframe(query)
    
    # If no data, return empty breakdown
    if df.empty:
        return {
            "period": period,
            "type": type,
            "categories": []
        }
    
    # Group by category
    category_totals = df.groupby('category')['amount'].agg(['sum', 'count']).reset_index()
    
    # Calculate percentage of total
    total_amount = category_totals['sum'].sum()
    category_totals['percentage'] = (category_totals['sum'] / total_amount * 100).round(2)
    
    # Sort by amount
    category_totals = category_totals.sort_values('sum', ascending=False)
    
    # Convert to list of dictionaries
    categories = []
    for _, row in category_totals.iterrows():
        categories.append({
            "category": row['category'],
            "amount": float(row['sum']),
            "count": int(row['count']),
            "percentage": float(row['percentage'])
        })
    
    return {
        "period": period,
        "type": type,
        "total_amount": float(total_amount),
        "categories": categories
    }

def get_income_vs_expenses(user_id: int, period: str = 'month'):
    """
    Get income vs expenses comparison
    """
    # Calculate date range based on period
    end_date = datetime.now()
    if period == 'week':
        start_date = end_date - timedelta(days=7)
        group_by = 'day'
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
        group_by = 'day'
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
        group_by = 'month'
    else:
        start_date = end_date - timedelta(days=30)
        group_by = 'day'
    
    # Format dates for SQL query
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    # SQL query to get transactions for the period
    query = f"""
    SELECT 
        amount, type, date
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date BETWEEN '{start_date_str}' AND '{end_date_str}'
    ORDER BY 
        date
    """
    
    # Load data into DataFrame
    df = load_data_to_dataframe(query)
    
    # If no data, return empty comparison
    if df.empty:
        return {
            "period": period,
            "total_income": 0,
            "total_expenses": 0,
            "net": 0,
            "income_expense_ratio": 0,
            "comparison": []
        }
    
    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by time period
    if group_by == 'day':
        df['period'] = df['date'].dt.date
    elif group_by == 'month':
        df['period'] = df['date'].dt.strftime('%Y-%m')
    
    # Calculate totals
    total_income = df[df['type'] == 'income']['amount'].sum()
    total_expenses = df[df['type'] == 'expense']['amount'].sum()
    net = total_income - total_expenses
    income_expense_ratio = float(total_income / total_expenses) if total_expenses > 0 else 0
    
    # Calculate comparison by period
    comparison = []
    for period_val, group in df.groupby('period'):
        income = group[group['type'] == 'income']['amount'].sum()
        expense = group[group['type'] == 'expense']['amount'].sum()
        ratio = float(income / expense) if expense > 0 else 0
        
        comparison.append({
            "period": str(period_val),
            "income": float(income),
            "expense": float(expense),
            "net": float(income - expense),
            "income_expense_ratio": ratio
        })
    
    # Sort by period
    comparison.sort(key=lambda x: x['period'])
    
    return {
        "period": period,
        "group_by": group_by,
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net": float(net),
        "income_expense_ratio": income_expense_ratio,
        "comparison": comparison
    }
