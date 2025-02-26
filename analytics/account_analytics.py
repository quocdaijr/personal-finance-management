import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import load_data_to_dataframe

def get_account_analytics(user_id: int):
    """
    Get account analytics
    """
    # SQL query to get accounts
    query = f"""
    SELECT 
        id, name, type, balance, currency, is_default, created_at, updated_at
    FROM 
        accounts
    WHERE 
        user_id = {user_id}
    """
    
    # Load data into DataFrame
    accounts_df = load_data_to_dataframe(query)
    
    # If no data, return empty analytics
    if accounts_df.empty:
        return {
            "total_accounts": 0,
            "total_balance": 0,
            "account_types": [],
            "currencies": [],
            "accounts_by_balance": []
        }
    
    # SQL query to get transactions
    query = f"""
    SELECT 
        id, amount, type, date, account_id
    FROM 
        transactions
    WHERE 
        user_id = {user_id}
    ORDER BY 
        date DESC
    """
    
    # Load data into DataFrame
    transactions_df = load_data_to_dataframe(query)
    
    # Calculate basic metrics
    total_accounts = len(accounts_df)
    total_balance = accounts_df['balance'].sum()
    
    # Account types breakdown
    account_types = []
    for type_name, group in accounts_df.groupby('type'):
        account_types.append({
            "type": type_name,
            "count": len(group),
            "total_balance": float(group['balance'].sum()),
            "average_balance": float(group['balance'].mean())
        })
    
    # Sort by total balance
    account_types.sort(key=lambda x: abs(x['total_balance']), reverse=True)
    
    # Currencies breakdown
    currencies = []
    for currency, group in accounts_df.groupby('currency'):
        currencies.append({
            "currency": currency,
            "count": len(group),
            "total_balance": float(group['balance'].sum())
        })
    
    # Accounts by balance
    accounts_by_balance = []
    for _, row in accounts_df.iterrows():
        # Get transaction count for this account
        if not transactions_df.empty:
            transaction_count = len(transactions_df[transactions_df['account_id'] == row['id']])
        else:
            transaction_count = 0
        
        accounts_by_balance.append({
            "id": int(row['id']),
            "name": row['name'],
            "type": row['type'],
            "balance": float(row['balance']),
            "currency": row['currency'],
            "is_default": bool(row['is_default']),
            "transaction_count": transaction_count
        })
    
    # Sort by absolute balance
    accounts_by_balance.sort(key=lambda x: abs(x['balance']), reverse=True)
    
    return {
        "total_accounts": total_accounts,
        "total_balance": float(total_balance),
        "account_types": account_types,
        "currencies": currencies,
        "accounts_by_balance": accounts_by_balance
    }

def get_account_balance_history(user_id: int, account_id: int = None, period: str = 'month'):
    """
    Get account balance history over time
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
    
    # SQL query to get accounts
    accounts_query = f"""
    SELECT 
        id, name, type, balance, currency, is_default
    FROM 
        accounts
    WHERE 
        user_id = {user_id}
    """
    
    if account_id is not None:
        accounts_query += f" AND id = {account_id}"
    
    # Load accounts data
    accounts_df = load_data_to_dataframe(accounts_query)
    
    # If no accounts, return empty history
    if accounts_df.empty:
        return {
            "period": period,
            "accounts": []
        }
    
    # SQL query to get transactions
    transactions_query = f"""
    SELECT 
        id, amount, type, date, account_id
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        date BETWEEN '{start_date_str}' AND '{end_date_str}'
    """
    
    if account_id is not None:
        transactions_query += f" AND account_id = {account_id}"
    
    transactions_query += " ORDER BY date"
    
    # Load transactions data
    transactions_df = load_data_to_dataframe(transactions_query)
    
    # If no transactions, return current balances only
    if transactions_df.empty:
        accounts = []
        for _, row in accounts_df.iterrows():
            accounts.append({
                "id": int(row['id']),
                "name": row['name'],
                "type": row['type'],
                "current_balance": float(row['balance']),
                "currency": row['currency'],
                "history": []
            })
        
        return {
            "period": period,
            "accounts": accounts
        }
    
    # Convert date to datetime
    transactions_df['date'] = pd.to_datetime(transactions_df['date'])
    
    # Group by time period
    if group_by == 'day':
        transactions_df['period'] = transactions_df['date'].dt.date
    elif group_by == 'month':
        transactions_df['period'] = transactions_df['date'].dt.strftime('%Y-%m')
    
    # Calculate balance history for each account
    accounts_history = []
    for _, account_row in accounts_df.iterrows():
        account_id = account_row['id']
        current_balance = account_row['balance']
        
        # Get transactions for this account
        account_transactions = transactions_df[transactions_df['account_id'] == account_id]
        
        if account_transactions.empty:
            accounts_history.append({
                "id": int(account_id),
                "name": account_row['name'],
                "type": account_row['type'],
                "current_balance": float(current_balance),
                "currency": account_row['currency'],
                "history": []
            })
            continue
        
        # Calculate running balance backwards from current balance
        history = []
        periods = sorted(account_transactions['period'].unique())
        
        # Group transactions by period
        for period_val in periods:
            period_transactions = account_transactions[account_transactions['period'] == period_val]
            
            # Calculate net change for this period
            income = period_transactions[period_transactions['type'] == 'income']['amount'].sum()
            expense = period_transactions[period_transactions['type'] == 'expense']['amount'].sum()
            net_change = income - expense
            
            history.append({
                "period": str(period_val),
                "income": float(income),
                "expense": float(expense),
                "net_change": float(net_change)
            })
        
        accounts_history.append({
            "id": int(account_id),
            "name": account_row['name'],
            "type": account_row['type'],
            "current_balance": float(current_balance),
            "currency": account_row['currency'],
            "history": history
        })
    
    return {
        "period": period,
        "group_by": group_by,
        "accounts": accounts_history
    }
