"""
Trend Forecasting Module - Time-series analysis and predictions
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from database import load_data_to_dataframe


class TrendForecasting:
    """Time-series forecasting for financial trends"""

    def __init__(self, db: Session):
        self.db = db

    def forecast_spending(
        self,
        user_id: int,
        forecast_months: int = 3,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Forecast future spending based on historical patterns

        Args:
            user_id: User ID
            forecast_months: Number of months to forecast
            category: Optional category to forecast

        Returns:
            Dict containing forecast data and confidence metrics
        """
        # Get historical data (12 months)
        start_date = datetime.now() - timedelta(days=365)

        query = f"""
        SELECT
            amount,
            type,
            date,
            category
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND type = 'expense'
        """

        if category:
            query += f" AND category = '{category}'"

        df = load_data_to_dataframe(query)

        if df.empty or len(df) < 3:
            return {
                "forecast": [],
                "confidence": "low",
                "message": "Insufficient data for forecasting"
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['month'] = df['date'].dt.to_period('M')

        # Group by month
        monthly_spending = df.groupby('month')['amount'].sum().abs()

        if len(monthly_spending) < 3:
            return {
                "forecast": [],
                "confidence": "low",
                "message": "Insufficient historical data"
            }

        # Calculate moving average and trend
        values = monthly_spending.values
        moving_avg = pd.Series(values).rolling(window=3, min_periods=1).mean()

        # Simple linear trend calculation
        x = np.arange(len(values))
        y = values
        coefficients = np.polyfit(x, y, 1)
        trend_slope = coefficients[0]

        # Generate forecast
        last_value = moving_avg.iloc[-1]
        forecast = []

        for i in range(1, forecast_months + 1):
            predicted_value = last_value + (trend_slope * i)
            # Add some variance based on historical std
            std_dev = float(np.std(values))
            confidence_interval = 1.96 * std_dev  # 95% confidence

            forecast.append({
                "period": str((monthly_spending.index[-1] + i).to_timestamp().strftime('%Y-%m')),
                "predicted_amount": float(max(0, predicted_value)),
                "lower_bound": float(max(0, predicted_value - confidence_interval)),
                "upper_bound": float(predicted_value + confidence_interval)
            })

        # Determine confidence level
        variance_coefficient = std_dev / np.mean(values) if np.mean(values) > 0 else 1
        if variance_coefficient < 0.2:
            confidence = "high"
        elif variance_coefficient < 0.5:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "historical_data": [
                {
                    "period": str(period),
                    "amount": float(amount)
                }
                for period, amount in monthly_spending.items()
            ],
            "forecast": forecast,
            "confidence": confidence,
            "trend": "increasing" if trend_slope > 0 else "decreasing" if trend_slope < 0 else "stable",
            "variance": float(variance_coefficient)
        }

    def calculate_trend_lines(
        self,
        user_id: int,
        months: int = 12,
        metric: str = "expenses"  # expenses, income, net
    ) -> Dict[str, Any]:
        """
        Calculate trend lines with linear regression

        Args:
            user_id: User ID
            months: Number of months of historical data
            metric: Metric to calculate trend for

        Returns:
            Dict containing trend line data
        """
        start_date = datetime.now() - timedelta(days=months * 30)

        query = f"""
        SELECT
            amount,
            type,
            date
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
        ORDER BY date
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "data_points": [],
                "trend_line": [],
                "slope": 0,
                "r_squared": 0
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['month'] = df['date'].dt.to_period('M')

        # Calculate monthly values based on metric
        if metric == "expenses":
            monthly_values = df[df['type'] == 'expense'].groupby('month')['amount'].sum().abs()
        elif metric == "income":
            monthly_values = df[df['type'] == 'income'].groupby('month')['amount'].sum()
        else:  # net
            income = df[df['type'] == 'income'].groupby('month')['amount'].sum()
            expenses = df[df['type'] == 'expense'].groupby('month')['amount'].sum().abs()
            monthly_values = income - expenses

        if len(monthly_values) < 2:
            return {
                "data_points": [],
                "trend_line": [],
                "slope": 0,
                "r_squared": 0
            }

        # Perform linear regression
        x = np.arange(len(monthly_values))
        y = monthly_values.values

        coefficients = np.polyfit(x, y, 1)
        slope, intercept = coefficients

        # Calculate R-squared
        y_pred = slope * x + intercept
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        # Prepare data points and trend line
        data_points = []
        trend_line = []

        for i, (period, value) in enumerate(monthly_values.items()):
            data_points.append({
                "period": str(period),
                "value": float(value)
            })
            trend_line.append({
                "period": str(period),
                "trend_value": float(y_pred[i])
            })

        return {
            "data_points": data_points,
            "trend_line": trend_line,
            "slope": float(slope),
            "r_squared": float(r_squared),
            "interpretation": self._interpret_trend(slope, r_squared)
        }

    def _interpret_trend(self, slope: float, r_squared: float) -> str:
        """Interpret trend line results"""
        if r_squared < 0.3:
            return "No clear trend (high variability)"
        elif slope > 0:
            strength = "strong" if r_squared > 0.7 else "moderate"
            return f"Clear {strength} increasing trend"
        elif slope < 0:
            strength = "strong" if r_squared > 0.7 else "moderate"
            return f"Clear {strength} decreasing trend"
        else:
            return "Stable trend"

    def detect_seasonality(
        self,
        user_id: int,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Detect seasonal patterns in spending

        Args:
            user_id: User ID
            category: Optional category filter

        Returns:
            Dict containing seasonality analysis
        """
        # Get 2 years of data for seasonality detection
        start_date = datetime.now() - timedelta(days=730)

        query = f"""
        SELECT
            amount,
            type,
            date,
            category
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND type = 'expense'
        """

        if category:
            query += f" AND category = '{category}'"

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "has_seasonality": False,
                "message": "Insufficient data"
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter

        # Monthly seasonality
        monthly_avg = df.groupby('month')['amount'].mean().abs()
        overall_avg = df['amount'].mean()

        monthly_pattern = []
        for month in range(1, 13):
            if month in monthly_avg.index:
                deviation = ((monthly_avg[month] - abs(overall_avg)) / abs(overall_avg) * 100) if overall_avg != 0 else 0
                monthly_pattern.append({
                    "month": month,
                    "month_name": datetime(2000, month, 1).strftime('%B'),
                    "average_amount": float(monthly_avg[month]),
                    "deviation_percent": float(deviation)
                })

        # Quarterly pattern
        quarterly_avg = df.groupby('quarter')['amount'].mean().abs()
        quarterly_pattern = [
            {
                "quarter": int(q),
                "average_amount": float(amt)
            }
            for q, amt in quarterly_avg.items()
        ]

        # Determine if there's significant seasonality
        variance = float(monthly_avg.std() / monthly_avg.mean()) if monthly_avg.mean() > 0 else 0
        has_seasonality = variance > 0.2

        return {
            "has_seasonality": has_seasonality,
            "monthly_pattern": monthly_pattern,
            "quarterly_pattern": quarterly_pattern,
            "variance_coefficient": variance,
            "interpretation": "Strong seasonal pattern" if variance > 0.4 else "Moderate seasonal pattern" if variance > 0.2 else "No significant seasonality"
        }
