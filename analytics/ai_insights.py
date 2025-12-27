"""
AI Insights Module - Anomaly detection and intelligent recommendations
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from database import load_data_to_dataframe


class AIInsights:
    """AI-powered financial insights and anomaly detection"""

    def __init__(self, db: Session):
        self.db = db

    def detect_anomalies(
        self,
        user_id: int,
        sensitivity: str = "medium",  # low, medium, high
        days: int = 90
    ) -> Dict[str, Any]:
        """
        Detect unusual transactions using statistical methods

        Args:
            user_id: User ID
            sensitivity: Detection sensitivity level
            days: Number of days to analyze

        Returns:
            Dict containing detected anomalies
        """
        start_date = datetime.now() - timedelta(days=days)

        query = f"""
        SELECT
            id,
            amount,
            category,
            type,
            date,
            description
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
        ORDER BY date DESC
        """

        df = load_data_to_dataframe(query)

        if df.empty or len(df) < 10:
            return {
                "anomalies": [],
                "summary": {
                    "total_anomalies": 0,
                    "anomaly_rate": 0
                }
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['amount_abs'] = df['amount'].abs()

        # Set sensitivity thresholds (z-score)
        sensitivity_thresholds = {
            "low": 3.0,
            "medium": 2.5,
            "high": 2.0
        }
        threshold = sensitivity_thresholds.get(sensitivity, 2.5)

        anomalies = []

        # Detect anomalies by category
        for category in df['category'].unique():
            cat_df = df[df['category'] == category]

            if len(cat_df) < 5:
                continue

            # Calculate z-scores
            mean = cat_df['amount_abs'].mean()
            std = cat_df['amount_abs'].std()

            if std == 0:
                continue

            cat_df['z_score'] = (cat_df['amount_abs'] - mean) / std

            # Identify anomalies
            anomaly_transactions = cat_df[abs(cat_df['z_score']) > threshold]

            for _, transaction in anomaly_transactions.iterrows():
                deviation_percent = ((transaction['amount_abs'] - mean) / mean * 100) if mean > 0 else 0

                anomalies.append({
                    "transaction_id": int(transaction['id']),
                    "amount": float(transaction['amount']),
                    "category": transaction['category'],
                    "type": transaction['type'],
                    "date": transaction['date'].isoformat() if pd.notna(transaction['date']) else None,
                    "description": transaction['description'],
                    "z_score": float(transaction['z_score']),
                    "category_average": float(mean),
                    "deviation_percent": float(deviation_percent),
                    "severity": self._calculate_severity(transaction['z_score'], threshold)
                })

        # Sort by severity and z-score
        anomalies.sort(key=lambda x: abs(x['z_score']), reverse=True)

        return {
            "anomalies": anomalies[:50],  # Top 50 anomalies
            "summary": {
                "total_anomalies": len(anomalies),
                "anomaly_rate": (len(anomalies) / len(df) * 100) if len(df) > 0 else 0,
                "sensitivity_level": sensitivity
            }
        }

    def generate_budget_recommendations(
        self,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Generate smart budget recommendations based on historical spending

        Args:
            user_id: User ID

        Returns:
            Dict containing budget recommendations
        """
        # Get 6 months of historical data
        start_date = datetime.now() - timedelta(days=180)

        query = f"""
        SELECT
            amount,
            category,
            type,
            date
        FROM transactions
        WHERE user_id = {user_id}
            AND date >= '{start_date.isoformat()}'
            AND type = 'expense'
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "recommendations": [],
                "message": "Insufficient data for recommendations"
            }

        df['amount'] = df['amount'].abs()
        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')

        # Get existing budgets
        budgets_query = f"""
        SELECT category, amount
        FROM budgets
        WHERE user_id = {user_id}
        """
        budgets_df = load_data_to_dataframe(budgets_query)

        existing_budgets = set(budgets_df['category'].tolist()) if not budgets_df.empty else set()

        # Calculate average monthly spending by category
        df['month'] = df['date'].dt.to_period('M')
        monthly_avg = df.groupby('category')['amount'].sum() / df['month'].nunique()

        recommendations = []

        for category, avg_spending in monthly_avg.items():
            # Calculate recommended budget (average + 15% buffer)
            recommended_amount = float(avg_spending * 1.15)

            # Calculate confidence based on consistency
            category_monthly = df[df['category'] == category].groupby('month')['amount'].sum()
            variance_coefficient = float(category_monthly.std() / category_monthly.mean()) if category_monthly.mean() > 0 else 0

            confidence = "high" if variance_coefficient < 0.2 else "medium" if variance_coefficient < 0.5 else "low"

            recommendation = {
                "category": category,
                "recommended_amount": recommended_amount,
                "average_monthly_spending": float(avg_spending),
                "confidence": confidence,
                "variance": variance_coefficient
            }

            if category in existing_budgets:
                existing_budget = float(budgets_df[budgets_df['category'] == category]['amount'].iloc[0])
                recommendation["existing_budget"] = existing_budget
                recommendation["adjustment_needed"] = abs(existing_budget - recommended_amount) > (existing_budget * 0.1)
                recommendation["adjustment_percent"] = ((recommended_amount - existing_budget) / existing_budget * 100) if existing_budget > 0 else 0
                recommendation["action"] = "adjust"
            else:
                recommendation["action"] = "create"

            recommendations.append(recommendation)

        # Sort by recommended amount
        recommendations.sort(key=lambda x: x['recommended_amount'], reverse=True)

        return {
            "recommendations": recommendations,
            "summary": {
                "total_recommendations": len(recommendations),
                "new_budgets_suggested": sum(1 for r in recommendations if r['action'] == 'create'),
                "adjustments_suggested": sum(1 for r in recommendations if r['action'] == 'adjust')
            }
        }

    def identify_savings_opportunities(
        self,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Identify potential savings opportunities

        Args:
            user_id: User ID

        Returns:
            Dict containing savings opportunities
        """
        # Get 90 days of data
        start_date = datetime.now() - timedelta(days=90)

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
        """

        df = load_data_to_dataframe(query)

        if df.empty:
            return {
                "opportunities": [],
                "potential_monthly_savings": 0
            }

        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['amount_abs'] = df['amount'].abs()

        opportunities = []

        # Calculate income and expenses
        income_df = df[df['type'] == 'income']
        expense_df = df[df['type'] == 'expense']

        if not income_df.empty and not expense_df.empty:
            total_income = income_df['amount'].sum()
            total_expenses = expense_df['amount_abs'].sum()

            # Savings rate analysis
            current_savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0

            if current_savings_rate < 20:
                target_savings_rate = 20
                required_reduction = total_income * (target_savings_rate / 100) - (total_income - total_expenses)

                opportunities.append({
                    "type": "savings_rate",
                    "title": "Increase Savings Rate",
                    "description": f"Your current savings rate is {current_savings_rate:.1f}%. Target 20% by reducing expenses by ${required_reduction:.2f}/month",
                    "potential_savings": float(required_reduction / 3),  # Per month
                    "priority": "high" if current_savings_rate < 10 else "medium"
                })

        # Category-specific opportunities
        if not expense_df.empty:
            category_spending = expense_df.groupby('category')['amount_abs'].sum().sort_values(ascending=False)

            for category, amount in category_spending.head(5).items():
                category_percent = (amount / expense_df['amount_abs'].sum() * 100)

                # High spending categories
                if category_percent > 30:
                    potential_savings = amount * 0.15  # Suggest 15% reduction

                    opportunities.append({
                        "type": "category_optimization",
                        "title": f"Optimize {category} Spending",
                        "description": f"{category} represents {category_percent:.1f}% of your expenses. Reducing by 15% could save ${potential_savings:.2f}",
                        "category": category,
                        "current_spending": float(amount),
                        "potential_savings": float(potential_savings / 3),  # Per month
                        "priority": "high"
                    })

            # Recurring small transactions
            small_recurring = expense_df[expense_df['amount_abs'] < 20].groupby('description').size()
            if len(small_recurring) > 0:
                frequent_small = small_recurring[small_recurring > 10]

                for description, count in frequent_small.head(3).items():
                    desc_spending = expense_df[expense_df['description'] == description]['amount_abs'].sum()

                    opportunities.append({
                        "type": "subscription_alert",
                        "title": f"Review: {description}",
                        "description": f"You have {count} small transactions totaling ${desc_spending:.2f}. Consider if this subscription is necessary.",
                        "potential_savings": float(desc_spending / 3),  # Per month
                        "priority": "medium"
                    })

        # Calculate total potential savings
        total_potential = sum(opp['potential_savings'] for opp in opportunities)

        return {
            "opportunities": opportunities,
            "potential_monthly_savings": float(total_potential),
            "summary": {
                "opportunities_found": len(opportunities),
                "high_priority": sum(1 for o in opportunities if o.get('priority') == 'high')
            }
        }

    def predict_category_spending(
        self,
        user_id: int,
        category: str,
        target_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Predict future spending in a category

        Args:
            user_id: User ID
            category: Category to predict
            target_date: Date to predict for (defaults to next month)

        Returns:
            Dict containing prediction
        """
        if not target_date:
            target_date = datetime.now() + timedelta(days=30)

        # Get historical data
        start_date = datetime.now() - timedelta(days=180)

        query = f"""
        SELECT
            amount,
            date
        FROM transactions
        WHERE user_id = {user_id}
            AND category = '{category}'
            AND type = 'expense'
            AND date >= '{start_date.isoformat()}'
        """

        df = load_data_to_dataframe(query)

        if df.empty or len(df) < 5:
            return {
                "category": category,
                "prediction": 0,
                "confidence": "low",
                "message": "Insufficient data for prediction"
            }

        df['amount'] = df['amount'].abs()
        df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce')
        df['month'] = df['date'].dt.to_period('M')

        # Calculate monthly average
        monthly_spending = df.groupby('month')['amount'].sum()

        if len(monthly_spending) < 2:
            return {
                "category": category,
                "prediction": float(df['amount'].mean()),
                "confidence": "low"
            }

        # Use recent average with trend adjustment
        recent_avg = monthly_spending.tail(3).mean()
        overall_avg = monthly_spending.mean()

        # Calculate trend
        if len(monthly_spending) >= 2:
            x = np.arange(len(monthly_spending))
            y = monthly_spending.values
            coefficients = np.polyfit(x, y, 1)
            trend_slope = coefficients[0]
        else:
            trend_slope = 0

        # Predict with trend
        prediction = recent_avg + trend_slope

        # Calculate confidence
        variance = monthly_spending.std() / monthly_spending.mean() if monthly_spending.mean() > 0 else 1
        confidence = "high" if variance < 0.2 else "medium" if variance < 0.5 else "low"

        return {
            "category": category,
            "predicted_amount": float(max(0, prediction)),
            "historical_average": float(overall_avg),
            "recent_average": float(recent_avg),
            "trend": "increasing" if trend_slope > 0 else "decreasing" if trend_slope < 0 else "stable",
            "confidence": confidence,
            "target_date": target_date.strftime('%Y-%m')
        }

    def _calculate_severity(self, z_score: float, threshold: float) -> str:
        """Calculate anomaly severity"""
        abs_z = abs(z_score)

        if abs_z > threshold * 1.5:
            return "critical"
        elif abs_z > threshold * 1.2:
            return "high"
        elif abs_z > threshold:
            return "medium"
        else:
            return "low"
