"""
Visualization Data Module - Enhanced data preparation for charts and visualizations
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from database import load_data_to_dataframe


class VisualizationData:
    """Prepare data for various visualization types"""

    def __init__(self, db: Session):
        self.db = db

    def get_spending_heatmap(
        self,
        user_id: int,
        months: int = 6
    ) -> Dict[str, Any]:
        """
        Generate heatmap data for spending patterns

        Args:
            user_id: User ID
            months: Number of months to analyze

        Returns:
            Dict containing heatmap data
        """
        start_date = datetime.now() - timedelta(days=months * 30)

        query = f"""
        SELECT
            amount,
            date,
            type
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND type = 'expense'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "heatmap_data": [],
                "max_value": 0
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['amount'] = df['amount'].abs()

        # Extract day of week and hour
        df['day_of_week'] = df['date'].dt.day_name()
        df['hour'] = df['date'].dt.hour

        # Create heatmap data (day of week x hour)
        heatmap = df.groupby(['day_of_week', 'hour'])['amount'].sum().reset_index()

        # Create full grid
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        hours = list(range(24))

        heatmap_data = []
        max_value = 0

        for day in days:
            for hour in hours:
                value = float(heatmap[(heatmap['day_of_week'] == day) & (heatmap['hour'] == hour)]['amount'].sum())
                if value > max_value:
                    max_value = value

                heatmap_data.append({
                    "day": day,
                    "hour": hour,
                    "value": value
                })

        return {
            "heatmap_data": heatmap_data,
            "max_value": max_value,
            "interpretation": self._interpret_heatmap(heatmap_data, max_value)
        }

    def get_comparison_data(
        self,
        user_id: int,
        comparison_type: str = "month_over_month"  # month_over_month, year_over_year
    ) -> Dict[str, Any]:
        """
        Generate comparative analysis data

        Args:
            user_id: User ID
            comparison_type: Type of comparison

        Returns:
            Dict containing comparison data
        """
        if comparison_type == "month_over_month":
            # Current month vs last month
            current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
            last_month_end = current_month_start - timedelta(seconds=1)

            current_data = self._get_period_data(user_id, current_month_start, datetime.now())
            last_data = self._get_period_data(user_id, last_month_start, last_month_end)

            return {
                "current_period": {
                    "label": "This Month",
                    **current_data
                },
                "comparison_period": {
                    "label": "Last Month",
                    **last_data
                },
                "changes": self._calculate_changes(current_data, last_data)
            }

        else:  # year_over_year
            current_year = datetime.now().year
            current_year_start = datetime(current_year, 1, 1)
            last_year_start = datetime(current_year - 1, 1, 1)
            last_year_end = datetime(current_year - 1, 12, 31, 23, 59, 59)

            current_data = self._get_period_data(user_id, current_year_start, datetime.now())
            last_data = self._get_period_data(user_id, last_year_start, last_year_end)

            return {
                "current_period": {
                    "label": f"Year {current_year}",
                    **current_data
                },
                "comparison_period": {
                    "label": f"Year {current_year - 1}",
                    **last_data
                },
                "changes": self._calculate_changes(current_data, last_data)
            }

    def get_waterfall_data(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Generate waterfall chart data for cash flow

        Args:
            user_id: User ID
            start_date: Period start
            end_date: Period end

        Returns:
            Dict containing waterfall data
        """
        if not start_date:
            start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if not end_date:
            end_date = datetime.now()

        # Get starting balance
        balance_query = f"""
        SELECT COALESCE(SUM(balance), 0) as starting_balance
        FROM accounts
        WHERE user_id = {user_id}
        """
        balance_df = load_data_to_dataframe(balance_query)
        starting_balance = float(balance_df['starting_balance'].iloc[0]) if not balance_df.empty else 0

        # Get transactions
        query = f"""
        SELECT
            amount,
            type,
            category,
            date
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        waterfall_items = [
            {
                "category": "Starting Balance",
                "value": starting_balance,
                "type": "start"
            }
        ]

        if not df.empty:
            # Income by category
            income_by_category = df[df['type'] == 'income'].groupby('category')['amount'].sum()
            for category, amount in income_by_category.items():
                waterfall_items.append({
                    "category": f"Income: {category}",
                    "value": float(amount),
                    "type": "increase"
                })

            # Expenses by category
            expense_by_category = df[df['type'] == 'expense'].groupby('category')['amount'].sum()
            for category, amount in expense_by_category.items():
                waterfall_items.append({
                    "category": f"Expense: {category}",
                    "value": float(amount),
                    "type": "decrease"
                })

        # Calculate ending balance
        total_income = sum(item['value'] for item in waterfall_items if item['type'] == 'increase')
        total_expenses = abs(sum(item['value'] for item in waterfall_items if item['type'] == 'decrease'))
        ending_balance = starting_balance + total_income - total_expenses

        waterfall_items.append({
            "category": "Ending Balance",
            "value": ending_balance,
            "type": "end"
        })

        return {
            "waterfall_data": waterfall_items,
            "summary": {
                "starting_balance": starting_balance,
                "total_income": total_income,
                "total_expenses": total_expenses,
                "ending_balance": ending_balance,
                "net_change": ending_balance - starting_balance
            }
        }

    def get_sankey_data(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Generate Sankey diagram data for money flow

        Args:
            user_id: User ID
            start_date: Period start
            end_date: Period end

        Returns:
            Dict containing Sankey diagram data
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        query = f"""
        SELECT
            amount,
            type,
            category,
            account_id
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "nodes": [],
                "links": []
            }

        # Create nodes and links for Sankey
        nodes = []
        links = []
        node_map = {}

        def get_node_index(name, node_type):
            key = f"{node_type}:{name}"
            if key not in node_map:
                node_map[key] = len(nodes)
                nodes.append({"name": name, "type": node_type})
            return node_map[key]

        # Process income
        income_df = df[df['type'] == 'income']
        for category in income_df['category'].unique():
            source_idx = get_node_index(category, "income_source")
            target_idx = get_node_index("Available Funds", "intermediate")
            value = float(income_df[income_df['category'] == category]['amount'].sum())

            links.append({
                "source": source_idx,
                "target": target_idx,
                "value": value
            })

        # Process expenses
        expense_df = df[df['type'] == 'expense']
        for category in expense_df['category'].unique():
            source_idx = get_node_index("Available Funds", "intermediate")
            target_idx = get_node_index(category, "expense_category")
            value = float(abs(expense_df[expense_df['category'] == category]['amount'].sum()))

            links.append({
                "source": source_idx,
                "target": target_idx,
                "value": value
            })

        return {
            "nodes": nodes,
            "links": links
        }

    def _get_period_data(
        self,
        user_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get financial data for a period"""
        query = f"""
        SELECT
            amount,
            type,
            category
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND date <= '{end_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "income": 0,
                "expenses": 0,
                "net": 0,
                "transaction_count": 0
            }

        income = float(df[df['type'] == 'income']['amount'].sum())
        expenses = float(abs(df[df['type'] == 'expense']['amount'].sum()))

        return {
            "income": income,
            "expenses": expenses,
            "net": income - expenses,
            "transaction_count": len(df),
            "by_category": df.groupby('category')['amount'].sum().abs().to_dict()
        }

    def _calculate_changes(
        self,
        current: Dict[str, Any],
        previous: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate percentage changes between periods"""
        changes = {}

        for key in ['income', 'expenses', 'net']:
            if key in current and key in previous:
                curr_val = current[key]
                prev_val = previous[key]

                if prev_val != 0:
                    change_percent = ((curr_val - prev_val) / abs(prev_val) * 100)
                else:
                    change_percent = 100 if curr_val > 0 else 0

                changes[f"{key}_change_percent"] = float(change_percent)
                changes[f"{key}_change_amount"] = float(curr_val - prev_val)

        return changes

    def _interpret_heatmap(self, data: List[Dict], max_value: float) -> str:
        """Interpret heatmap patterns"""
        if max_value == 0:
            return "No spending data available"

        # Find peak spending time
        peak_entry = max(data, key=lambda x: x['value'])

        return f"Peak spending occurs on {peak_entry['day']} at {peak_entry['hour']:02d}:00 with ${peak_entry['value']:.2f}"
