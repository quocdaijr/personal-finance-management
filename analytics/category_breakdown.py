"""
Category Breakdown Module - Enhanced category analytics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from database import load_data_to_dataframe


class CategoryBreakdown:
    """Enhanced category analytics with detailed breakdowns"""

    def __init__(self, db: Session):
        self.db = db

    def get_category_breakdown(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        transaction_type: str = "expense"
    ) -> Dict[str, Any]:
        """
        Get detailed category breakdown with analytics

        Args:
            user_id: User ID
            start_date: Analysis start date
            end_date: Analysis end date
            transaction_type: Type of transactions (expense, income)

        Returns:
            Dict containing detailed category analysis
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        query = f"""
        SELECT
            amount,
            category,
            type,
            date,
            description
        FROM transactions
        WHERE user_id = {user_id}
            AND type = '{transaction_type}'
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "categories": [],
                "total": 0,
                "summary": {
                    "top_category": None,
                    "category_count": 0
                }
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['amount'] = df['amount'].abs()

        # Category analysis
        category_stats = df.groupby('category').agg({
            'amount': ['sum', 'mean', 'count', 'std'],
            'date': ['min', 'max']
        }).reset_index()

        category_stats.columns = ['category', 'total', 'average', 'count', 'std_dev', 'first_transaction', 'last_transaction']

        total_amount = float(df['amount'].sum())

        categories = []
        for _, row in category_stats.iterrows():
            percentage = (row['total'] / total_amount * 100) if total_amount > 0 else 0

            categories.append({
                "category": row['category'],
                "total_amount": float(row['total']),
                "percentage": float(percentage),
                "transaction_count": int(row['count']),
                "average_transaction": float(row['average']),
                "std_deviation": float(row['std_dev']) if pd.notna(row['std_dev']) else 0,
                "first_transaction": row['first_transaction'].isoformat() if pd.notna(row['first_transaction']) else None,
                "last_transaction": row['last_transaction'].isoformat() if pd.notna(row['last_transaction']) else None
            })

        # Sort by total amount descending
        categories.sort(key=lambda x: x['total_amount'], reverse=True)

        return {
            "categories": categories,
            "total": total_amount,
            "summary": {
                "top_category": categories[0]['category'] if categories else None,
                "category_count": len(categories),
                "average_per_category": total_amount / len(categories) if categories else 0
            }
        }

    def get_category_trends(
        self,
        user_id: int,
        category: str,
        months: int = 6
    ) -> Dict[str, Any]:
        """
        Get spending trends for a specific category

        Args:
            user_id: User ID
            category: Category name
            months: Number of months to analyze

        Returns:
            Dict containing category trend data
        """
        start_date = datetime.now() - timedelta(days=months * 30)

        query = f"""
        SELECT
            amount,
            date,
            description
        FROM transactions
        WHERE user_id = {user_id}
            AND category = '{category}'
            AND date >= '{start_date.isoformat()}'
        ORDER BY date
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "category": category,
                "trends": [],
                "summary": {
                    "total": 0,
                    "average_monthly": 0,
                    "trend_direction": "stable"
                }
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['amount'] = df['amount'].abs()
        df['month'] = df['date'].dt.to_period('M')

        # Monthly aggregation
        monthly_data = df.groupby('month').agg({
            'amount': ['sum', 'count', 'mean']
        }).reset_index()

        monthly_data.columns = ['month', 'total', 'count', 'average']

        trends = []
        for _, row in monthly_data.iterrows():
            trends.append({
                "period": str(row['month']),
                "total_amount": float(row['total']),
                "transaction_count": int(row['count']),
                "average_amount": float(row['average'])
            })

        # Calculate trend direction
        if len(trends) >= 2:
            first_half_avg = sum([t['total_amount'] for t in trends[:len(trends)//2]]) / (len(trends)//2)
            second_half_avg = sum([t['total_amount'] for t in trends[len(trends)//2:]]) / (len(trends) - len(trends)//2)

            change_percent = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0

            if change_percent > 10:
                trend_direction = "increasing"
            elif change_percent < -10:
                trend_direction = "decreasing"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "stable"
            change_percent = 0

        total = float(df['amount'].sum())
        average_monthly = total / months if months > 0 else 0

        return {
            "category": category,
            "trends": trends,
            "summary": {
                "total": total,
                "average_monthly": average_monthly,
                "trend_direction": trend_direction,
                "change_percent": float(change_percent)
            }
        }

    def compare_categories(
        self,
        user_id: int,
        categories: List[str],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Compare spending across multiple categories

        Args:
            user_id: User ID
            categories: List of category names
            start_date: Comparison start date
            end_date: Comparison end date

        Returns:
            Dict containing category comparison
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=90)
        if not end_date:
            end_date = datetime.now()

        categories_str = "','".join(categories)

        query = f"""
        SELECT
            amount,
            category,
            date
        FROM transactions
        WHERE user_id = {user_id}
            AND category IN ('{categories_str}')
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "comparison": [],
                "winner": None
            }

        df['amount'] = df['amount'].abs()

        # Category comparison
        comparison = []
        for category in categories:
            cat_df = df[df['category'] == category]
            if not cat_df.empty:
                comparison.append({
                    "category": category,
                    "total": float(cat_df['amount'].sum()),
                    "average": float(cat_df['amount'].mean()),
                    "count": int(len(cat_df))
                })

        # Sort by total
        comparison.sort(key=lambda x: x['total'], reverse=True)

        return {
            "comparison": comparison,
            "highest_spending": comparison[0]['category'] if comparison else None,
            "lowest_spending": comparison[-1]['category'] if comparison else None
        }

    def get_subcategory_breakdown(
        self,
        user_id: int,
        parent_category: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get breakdown by analyzing transaction descriptions for subcategories

        Args:
            user_id: User ID
            parent_category: Parent category name
            start_date: Analysis start date
            end_date: Analysis end date

        Returns:
            Dict containing subcategory analysis
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=90)
        if not end_date:
            end_date = datetime.now()

        query = f"""
        SELECT
            amount,
            description,
            date
        FROM transactions
        WHERE user_id = {user_id}
            AND category = '{parent_category}'
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "category": parent_category,
                "subcategories": [],
                "total": 0
            }

        df['amount'] = df['amount'].abs()

        # Group by description (treating it as subcategory)
        subcategory_stats = df.groupby('description').agg({
            'amount': ['sum', 'count']
        }).reset_index()

        subcategory_stats.columns = ['subcategory', 'total', 'count']

        total = float(df['amount'].sum())

        subcategories = []
        for _, row in subcategory_stats.iterrows():
            percentage = (row['total'] / total * 100) if total > 0 else 0
            subcategories.append({
                "subcategory": row['subcategory'],
                "total": float(row['total']),
                "count": int(row['count']),
                "percentage": float(percentage)
            })

        # Sort by total
        subcategories.sort(key=lambda x: x['total'], reverse=True)

        return {
            "category": parent_category,
            "subcategories": subcategories[:20],  # Top 20
            "total": total,
            "subcategory_count": len(subcategories)
        }
