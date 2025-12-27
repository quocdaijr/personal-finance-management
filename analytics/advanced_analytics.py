"""
Advanced Analytics Module - Spending pattern analysis and enhanced analytics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from database import load_data_to_dataframe


class AdvancedAnalytics:
    """Advanced analytics for spending patterns and comprehensive analysis"""

    def __init__(self, db: Session):
        self.db = db

    def get_spending_patterns(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        group_by: str = "day"  # day, week, month
    ) -> Dict[str, Any]:
        """
        Analyze detailed spending patterns with time-based grouping

        Args:
            user_id: User ID
            start_date: Analysis start date (defaults to 90 days ago)
            end_date: Analysis end date (defaults to now)
            group_by: Grouping granularity (day, week, month)

        Returns:
            Dict containing spending patterns analysis
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=90)
        if not end_date:
            end_date = datetime.now()

        # Load transactions
        query = f"""
        SELECT
            amount,
            category,
            type,
            date,
            description
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        ORDER BY date
        """
        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "patterns": [],
                "summary": {
                    "total_expenses": 0,
                    "average_daily": 0,
                    "average_weekly": 0,
                    "average_monthly": 0
                },
                "trends": {
                    "direction": "stable",
                    "change_percent": 0
                }
            }

        # Convert date and filter expenses
        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        expenses_df = df[df['type'] == 'expense'].copy()

        if expenses_df.empty:
            return {
                "patterns": [],
                "summary": {
                    "total_expenses": 0,
                    "average_daily": 0,
                    "average_weekly": 0,
                    "average_monthly": 0
                },
                "trends": {
                    "direction": "stable",
                    "change_percent": 0
                }
            }

        # Group by specified period
        if group_by == "day":
            expenses_df['period'] = expenses_df['date'].dt.date
        elif group_by == "week":
            expenses_df['period'] = expenses_df['date'].dt.to_period('W')
        else:  # month
            expenses_df['period'] = expenses_df['date'].dt.to_period('M')

        # Calculate patterns
        period_spending = expenses_df.groupby('period')['amount'].sum().abs()
        category_spending = expenses_df.groupby('category')['amount'].sum().abs().sort_values(ascending=False)

        # Day of week analysis
        expenses_df['day_of_week'] = expenses_df['date'].dt.day_name()
        dow_spending = expenses_df.groupby('day_of_week')['amount'].sum().abs()

        # Calculate summary statistics
        total_expenses = float(expenses_df['amount'].sum())
        days_in_range = (end_date - start_date).days or 1

        patterns = []
        for period, amount in period_spending.items():
            patterns.append({
                "period": str(period),
                "amount": float(amount),
                "transactions_count": int(expenses_df[expenses_df['period'] == period].shape[0])
            })

        # Calculate trend
        if len(period_spending) >= 2:
            first_half = period_spending[:len(period_spending)//2].mean()
            second_half = period_spending[len(period_spending)//2:].mean()
            change_percent = ((second_half - first_half) / first_half * 100) if first_half > 0 else 0

            if change_percent > 10:
                direction = "increasing"
            elif change_percent < -10:
                direction = "decreasing"
            else:
                direction = "stable"
        else:
            direction = "stable"
            change_percent = 0

        return {
            "patterns": patterns,
            "summary": {
                "total_expenses": abs(total_expenses),
                "average_daily": abs(total_expenses) / days_in_range,
                "average_weekly": abs(total_expenses) / (days_in_range / 7),
                "average_monthly": abs(total_expenses) / (days_in_range / 30)
            },
            "by_category": [
                {"category": cat, "amount": float(amount), "percentage": float(amount / abs(total_expenses) * 100)}
                for cat, amount in category_spending.head(10).items()
            ],
            "by_day_of_week": [
                {"day": day, "amount": float(amount)}
                for day, amount in dow_spending.items()
            ],
            "trends": {
                "direction": direction,
                "change_percent": float(change_percent)
            }
        }

    def get_income_expense_trends(
        self,
        user_id: int,
        months: int = 12
    ) -> Dict[str, Any]:
        """
        Compare income vs expense trends over time

        Args:
            user_id: User ID
            months: Number of months to analyze

        Returns:
            Dict containing income/expense comparative analysis
        """
        start_date = datetime.now() - timedelta(days=months * 30)

        query = f"""
        SELECT
            amount,
            type,
            date,
            category
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
        ORDER BY date
        """
        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "trends": [],
                "summary": {
                    "total_income": 0,
                    "total_expenses": 0,
                    "net_income": 0,
                    "savings_rate": 0
                }
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['month'] = df['date'].dt.to_period('M')

        # Group by month and type
        monthly_data = df.groupby(['month', 'type'])['amount'].sum().unstack(fill_value=0)

        trends = []
        for month in monthly_data.index:
            income = float(monthly_data.loc[month, 'income']) if 'income' in monthly_data.columns else 0
            expenses = float(abs(monthly_data.loc[month, 'expense'])) if 'expense' in monthly_data.columns else 0
            net = income - expenses
            savings_rate = (net / income * 100) if income > 0 else 0

            trends.append({
                "period": str(month),
                "income": income,
                "expenses": expenses,
                "net": net,
                "savings_rate": savings_rate
            })

        # Calculate summary
        total_income = float(df[df['type'] == 'income']['amount'].sum())
        total_expenses = float(abs(df[df['type'] == 'expense']['amount'].sum()))
        net_income = total_income - total_expenses
        overall_savings_rate = (net_income / total_income * 100) if total_income > 0 else 0

        return {
            "trends": trends,
            "summary": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_income": net_income,
                "savings_rate": overall_savings_rate,
                "average_monthly_income": total_income / months,
                "average_monthly_expenses": total_expenses / months
            }
        }

    def get_year_over_year_comparison(
        self,
        user_id: int,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Compare current year performance with previous year

        Args:
            user_id: User ID
            category: Optional category filter

        Returns:
            Dict containing year-over-year comparison
        """
        current_year = datetime.now().year
        current_year_start = datetime(current_year, 1, 1)
        last_year_start = datetime(current_year - 1, 1, 1)
        last_year_end = datetime(current_year - 1, 12, 31, 23, 59, 59)

        # Query for both years
        query = f"""
        SELECT
            amount,
            type,
            date,
            category
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{last_year_start.isoformat()}'
        """

        if category:
            query += f" AND category = '{category}'"

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "current_year": {"income": 0, "expenses": 0, "net": 0},
                "last_year": {"income": 0, "expenses": 0, "net": 0},
                "comparison": {"income_change": 0, "expense_change": 0, "net_change": 0}
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')

        # Split into years
        current_year_df = df[df['date'] >= current_year_start]
        last_year_df = df[(df['date'] >= last_year_start) & (df['date'] <= last_year_end)]

        # Calculate metrics for each year
        def calculate_year_metrics(year_df):
            if year_df.empty:
                return {"income": 0, "expenses": 0, "net": 0}

            income = float(year_df[year_df['type'] == 'income']['amount'].sum())
            expenses = float(abs(year_df[year_df['type'] == 'expense']['amount'].sum()))
            return {
                "income": income,
                "expenses": expenses,
                "net": income - expenses
            }

        current_metrics = calculate_year_metrics(current_year_df)
        last_metrics = calculate_year_metrics(last_year_df)

        # Calculate changes
        income_change = ((current_metrics['income'] - last_metrics['income']) / last_metrics['income'] * 100) if last_metrics['income'] > 0 else 0
        expense_change = ((current_metrics['expenses'] - last_metrics['expenses']) / last_metrics['expenses'] * 100) if last_metrics['expenses'] > 0 else 0
        net_change = ((current_metrics['net'] - last_metrics['net']) / abs(last_metrics['net']) * 100) if last_metrics['net'] != 0 else 0

        return {
            "current_year": current_metrics,
            "last_year": last_metrics,
            "comparison": {
                "income_change_percent": float(income_change),
                "expense_change_percent": float(expense_change),
                "net_change_percent": float(net_change)
            }
        }
