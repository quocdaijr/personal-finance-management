import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import load_data_to_dataframe

def get_budget_analytics(user_id: int):
    """
    Get budget analytics
    """
    # SQL query to get budgets
    query = f"""
    SELECT 
        id, name, amount, spent, category, period, start_date, end_date, created_at, updated_at
    FROM 
        budgets
    WHERE 
        user_id = {user_id}
    """
    
    # Load data into DataFrame
    budgets_df = load_data_to_dataframe(query)
    
    # If no data, return empty analytics
    if budgets_df.empty:
        return {
            "total_budgets": 0,
            "total_budgeted": 0,
            "total_spent": 0,
            "total_remaining": 0,
            "overall_progress": 0,
            "budget_periods": [],
            "budget_categories": [],
            "budget_performance": []
        }
    
    # Calculate basic metrics
    total_budgets = len(budgets_df)
    total_budgeted = budgets_df['amount'].sum()
    total_spent = budgets_df['spent'].sum()
    total_remaining = total_budgeted - total_spent
    overall_progress = (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0
    
    # Budget periods breakdown
    budget_periods = []
    for period, group in budgets_df.groupby('period'):
        budget_periods.append({
            "period": period,
            "count": len(group),
            "total_budgeted": float(group['amount'].sum()),
            "total_spent": float(group['spent'].sum()),
            "total_remaining": float(group['amount'].sum() - group['spent'].sum()),
            "progress": float((group['spent'].sum() / group['amount'].sum() * 100) if group['amount'].sum() > 0 else 0)
        })
    
    # Sort by count
    budget_periods.sort(key=lambda x: x['count'], reverse=True)
    
    # Budget categories breakdown
    budget_categories = []
    for category, group in budgets_df.groupby('category'):
        budget_categories.append({
            "category": category,
            "count": len(group),
            "total_budgeted": float(group['amount'].sum()),
            "total_spent": float(group['spent'].sum()),
            "total_remaining": float(group['amount'].sum() - group['spent'].sum()),
            "progress": float((group['spent'].sum() / group['amount'].sum() * 100) if group['amount'].sum() > 0 else 0)
        })
    
    # Sort by total budgeted
    budget_categories.sort(key=lambda x: x['total_budgeted'], reverse=True)
    
    # Budget performance
    budget_performance = []
    for _, row in budgets_df.iterrows():
        progress = (row['spent'] / row['amount'] * 100) if row['amount'] > 0 else 0
        status = "over_budget" if progress > 100 else "on_track" if progress <= 80 else "warning"
        
        budget_performance.append({
            "id": int(row['id']),
            "name": row['name'],
            "category": row['category'],
            "period": row['period'],
            "amount": float(row['amount']),
            "spent": float(row['spent']),
            "remaining": float(row['amount'] - row['spent']),
            "progress": float(progress),
            "status": status,
            "start_date": row['start_date'].strftime('%Y-%m-%d') if isinstance(row['start_date'], datetime) else row['start_date'],
            "end_date": row['end_date'].strftime('%Y-%m-%d') if isinstance(row['end_date'], datetime) else row['end_date']
        })
    
    # Sort by progress (highest first)
    budget_performance.sort(key=lambda x: x['progress'], reverse=True)
    
    return {
        "total_budgets": total_budgets,
        "total_budgeted": float(total_budgeted),
        "total_spent": float(total_spent),
        "total_remaining": float(total_remaining),
        "overall_progress": float(overall_progress),
        "budget_periods": budget_periods,
        "budget_categories": budget_categories,
        "budget_performance": budget_performance
    }

def get_budget_performance(user_id: int):
    """
    Get detailed budget performance analytics
    """
    # SQL query to get budgets
    budgets_query = f"""
    SELECT 
        id, name, amount, spent, category, period, start_date, end_date
    FROM 
        budgets
    WHERE 
        user_id = {user_id}
    """
    
    # Load budgets data
    budgets_df = load_data_to_dataframe(budgets_query)
    
    # If no budgets, return empty performance
    if budgets_df.empty:
        return {
            "budgets": [],
            "categories": [],
            "overall": {
                "total_budgeted": 0,
                "total_spent": 0,
                "total_remaining": 0,
                "overall_progress": 0
            }
        }
    
    # SQL query to get transactions
    transactions_query = f"""
    SELECT 
        id, amount, category, type, date
    FROM 
        transactions
    WHERE 
        user_id = {user_id} AND
        type = 'expense'
    ORDER BY 
        date DESC
    """
    
    # Load transactions data
    transactions_df = load_data_to_dataframe(transactions_query)
    
    # Calculate budget performance
    budgets = []
    for _, row in budgets_df.iterrows():
        # Calculate progress
        progress = (row['spent'] / row['amount'] * 100) if row['amount'] > 0 else 0
        status = "over_budget" if progress > 100 else "on_track" if progress <= 80 else "warning"
        
        # Get recent transactions for this category
        if not transactions_df.empty:
            category_transactions = transactions_df[transactions_df['category'] == row['category']]
            recent_transactions = category_transactions.head(5)
            
            recent = []
            for _, t_row in recent_transactions.iterrows():
                recent.append({
                    "id": int(t_row['id']),
                    "amount": float(t_row['amount']),
                    "date": t_row['date'].strftime('%Y-%m-%d') if isinstance(t_row['date'], datetime) else t_row['date']
                })
        else:
            recent = []
        
        budgets.append({
            "id": int(row['id']),
            "name": row['name'],
            "category": row['category'],
            "period": row['period'],
            "amount": float(row['amount']),
            "spent": float(row['spent']),
            "remaining": float(row['amount'] - row['spent']),
            "progress": float(progress),
            "status": status,
            "start_date": row['start_date'].strftime('%Y-%m-%d') if isinstance(row['start_date'], datetime) else row['start_date'],
            "end_date": row['end_date'].strftime('%Y-%m-%d') if isinstance(row['end_date'], datetime) else row['end_date'],
            "recent_transactions": recent
        })
    
    # Sort by progress (highest first)
    budgets.sort(key=lambda x: x['progress'], reverse=True)
    
    # Category performance
    categories = []
    for category, group in budgets_df.groupby('category'):
        total_budgeted = group['amount'].sum()
        total_spent = group['spent'].sum()
        progress = (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0
        
        categories.append({
            "category": category,
            "total_budgeted": float(total_budgeted),
            "total_spent": float(total_spent),
            "remaining": float(total_budgeted - total_spent),
            "progress": float(progress),
            "budget_count": len(group)
        })
    
    # Sort by progress (highest first)
    categories.sort(key=lambda x: x['progress'], reverse=True)
    
    # Overall performance
    total_budgeted = budgets_df['amount'].sum()
    total_spent = budgets_df['spent'].sum()
    overall_progress = (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0
    
    overall = {
        "total_budgeted": float(total_budgeted),
        "total_spent": float(total_spent),
        "total_remaining": float(total_budgeted - total_spent),
        "overall_progress": float(overall_progress),
        "budgets_over_limit": len([b for b in budgets if b['progress'] > 100]),
        "budgets_near_limit": len([b for b in budgets if 80 <= b['progress'] <= 100]),
        "budgets_on_track": len([b for b in budgets if b['progress'] < 80])
    }
    
    return {
        "budgets": budgets,
        "categories": categories,
        "overall": overall
    }
