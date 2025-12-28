"""
Goal Analytics Module - Financial goal achievement analytics and predictions
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import load_data_to_dataframe, USE_SQLITE


class GoalAnalytics:
    """Analytics for financial goals"""

    def __init__(self, db: Session):
        self.db = db

    def calculate_achievement_probability(
        self,
        user_id: int,
        goal_id: int
    ) -> Dict[str, Any]:
        """
        Calculate probability of achieving a financial goal

        Args:
            user_id: User ID
            goal_id: Goal ID

        Returns:
            Dict containing probability analysis
        """
        # Get goal details
        goal_query = text("""
        SELECT
            id,
            name,
            target_amount,
            current_amount,
            target_date,
            created_at
        FROM goals
        WHERE id = :goal_id AND user_id = :user_id
        """)

        goal_df = load_data_to_dataframe(goal_query, params={
            'goal_id': goal_id,
            'user_id': user_id
        })

        if goal_df.empty:
            return {
                "error": "Goal not found"
            }

        goal = goal_df.iloc[0]

        target_amount = float(goal['target_amount'])
        current_amount = float(goal['current_amount'])
        target_date = pd.to_datetime(goal['target_date'])
        created_at = pd.to_datetime(goal['created_at'])

        # Calculate required metrics
        remaining_amount = target_amount - current_amount
        days_elapsed = (datetime.now() - created_at).days or 1
        days_remaining = (target_date - datetime.now()).days

        if days_remaining <= 0:
            # Goal deadline has passed
            achievement_rate = (current_amount / target_amount * 100) if target_amount > 0 else 0

            return {
                "goal_id": int(goal_id),
                "goal_name": goal['name'],
                "status": "overdue",
                "achievement_rate": float(achievement_rate),
                "probability": 0 if achievement_rate < 100 else 100,
                "message": "Goal deadline has passed" if achievement_rate < 100 else "Goal achieved!"
            }

        # Calculate historical contribution rate
        historical_rate = current_amount / days_elapsed if days_elapsed > 0 else 0

        # Calculate required daily contribution
        required_daily_rate = remaining_amount / days_remaining if days_remaining > 0 else float('inf')

        # Calculate probability based on historical vs required rate
        if required_daily_rate == 0:
            probability = 100  # Already achieved
        elif historical_rate >= required_daily_rate:
            # On track or ahead
            ratio = historical_rate / required_daily_rate
            probability = min(95, 70 + (ratio - 1) * 25)  # Cap at 95%
        else:
            # Behind schedule
            ratio = historical_rate / required_daily_rate if required_daily_rate > 0 else 0
            probability = max(10, ratio * 70)  # Floor at 10%

        # Adjust for time remaining
        if days_remaining < 30:
            probability *= 0.8  # Reduce confidence for short timeframes

        return {
            "goal_id": int(goal_id),
            "goal_name": goal['name'],
            "status": "on_track" if probability >= 70 else "at_risk" if probability >= 40 else "behind",
            "probability": float(min(95, max(10, probability))),
            "current_amount": current_amount,
            "target_amount": target_amount,
            "remaining_amount": remaining_amount,
            "days_remaining": days_remaining,
            "historical_daily_rate": float(historical_rate),
            "required_daily_rate": float(required_daily_rate),
            "interpretation": self._interpret_probability(probability)
        }

    def get_timeline_projections(
        self,
        user_id: int,
        goal_id: int
    ) -> Dict[str, Any]:
        """
        Project timeline for goal achievement

        Args:
            user_id: User ID
            goal_id: Goal ID

        Returns:
            Dict containing timeline projections
        """
        # Get goal details
        goal_query = text("""
        SELECT
            id,
            name,
            target_amount,
            current_amount,
            target_date,
            created_at
        FROM goals
        WHERE id = :goal_id AND user_id = :user_id
        """)

        goal_df = load_data_to_dataframe(goal_query, params={
            'goal_id': goal_id,
            'user_id': user_id
        })

        if goal_df.empty:
            return {
                "error": "Goal not found"
            }

        goal = goal_df.iloc[0]

        target_amount = float(goal['target_amount'])
        current_amount = float(goal['current_amount'])
        target_date = pd.to_datetime(goal['target_date'])
        created_at = pd.to_datetime(goal['created_at'])

        # Calculate contribution rate
        days_elapsed = (datetime.now() - created_at).days or 1
        daily_rate = current_amount / days_elapsed if days_elapsed > 0 else 0

        # Project completion date based on current rate
        remaining_amount = target_amount - current_amount

        if daily_rate > 0:
            days_to_complete = remaining_amount / daily_rate
            projected_completion = datetime.now() + timedelta(days=days_to_complete)
        else:
            projected_completion = None
            days_to_complete = float('inf')

        # Generate milestone projections
        milestones = []
        milestone_percentages = [25, 50, 75, 90, 100]

        for percentage in milestone_percentages:
            milestone_amount = target_amount * (percentage / 100)

            if milestone_amount <= current_amount:
                # Already achieved
                milestones.append({
                    "percentage": percentage,
                    "amount": milestone_amount,
                    "status": "achieved",
                    "achieved_date": created_at.isoformat()  # Approximate
                })
            else:
                # Project future milestone
                amount_needed = milestone_amount - current_amount
                if daily_rate > 0:
                    days_needed = amount_needed / daily_rate
                    projected_date = datetime.now() + timedelta(days=days_needed)

                    milestones.append({
                        "percentage": percentage,
                        "amount": milestone_amount,
                        "status": "projected",
                        "projected_date": projected_date.isoformat(),
                        "days_from_now": int(days_needed)
                    })
                else:
                    milestones.append({
                        "percentage": percentage,
                        "amount": milestone_amount,
                        "status": "unknown",
                        "message": "No contribution history"
                    })

        return {
            "goal_id": int(goal_id),
            "goal_name": goal['name'],
            "target_date": target_date.isoformat(),
            "projected_completion_date": projected_completion.isoformat() if projected_completion else None,
            "on_schedule": projected_completion <= target_date if projected_completion else False,
            "days_ahead_behind": (target_date - projected_completion).days if projected_completion else None,
            "milestones": milestones,
            "daily_contribution_rate": float(daily_rate)
        }

    def get_contribution_recommendations(
        self,
        user_id: int,
        goal_id: int
    ) -> Dict[str, Any]:
        """
        Generate contribution recommendations to achieve goal

        Args:
            user_id: User ID
            goal_id: Goal ID

        Returns:
            Dict containing contribution recommendations
        """
        # Get goal details
        goal_query = text("""
        SELECT
            id,
            name,
            target_amount,
            current_amount,
            target_date
        FROM goals
        WHERE id = :goal_id AND user_id = :user_id
        """)

        goal_df = load_data_to_dataframe(goal_query, params={
            'goal_id': goal_id,
            'user_id': user_id
        })

        if goal_df.empty:
            return {
                "error": "Goal not found"
            }

        goal = goal_df.iloc[0]

        target_amount = float(goal['target_amount'])
        current_amount = float(goal['current_amount'])
        target_date = pd.to_datetime(goal['target_date'])

        remaining_amount = target_amount - current_amount
        days_remaining = (target_date - datetime.now()).days

        if days_remaining <= 0:
            return {
                "goal_id": int(goal_id),
                "message": "Goal deadline has passed"
            }

        # Calculate required contributions for different frequencies
        recommendations = []

        # Daily
        daily_amount = remaining_amount / days_remaining

        # Weekly
        weeks_remaining = days_remaining / 7
        weekly_amount = remaining_amount / weeks_remaining if weeks_remaining > 0 else remaining_amount

        # Monthly
        months_remaining = days_remaining / 30
        monthly_amount = remaining_amount / months_remaining if months_remaining > 0 else remaining_amount

        recommendations.append({
            "frequency": "daily",
            "amount": float(daily_amount),
            "description": f"Contribute ${daily_amount:.2f} every day"
        })

        recommendations.append({
            "frequency": "weekly",
            "amount": float(weekly_amount),
            "description": f"Contribute ${weekly_amount:.2f} every week"
        })

        recommendations.append({
            "frequency": "monthly",
            "amount": float(monthly_amount),
            "description": f"Contribute ${monthly_amount:.2f} every month"
        })

        # Get user's average monthly income for affordability check
        # Use database-specific date grouping function
        if USE_SQLITE:
            # SQLite uses strftime for date formatting
            date_group_function = "strftime('%Y-%m', date)"
        else:
            # PostgreSQL uses DATE_TRUNC
            date_group_function = "DATE_TRUNC('month', date)"

        income_query = text(f"""
        SELECT AVG(monthly_income) as avg_income
        FROM (
            SELECT SUM(amount) as monthly_income
            FROM transactions
            WHERE user_id = :user_id
                AND type = 'income'
                AND date >= :start_date
            GROUP BY {date_group_function}
        ) AS monthly_totals
        """)

        income_df = load_data_to_dataframe(income_query, params={
            'user_id': user_id,
            'start_date': (datetime.now() - timedelta(days=90)).isoformat()
        })
        avg_monthly_income = float(income_df['avg_income'].iloc[0]) if not income_df.empty and pd.notna(income_df['avg_income'].iloc[0]) else 0

        # Assess affordability
        for rec in recommendations:
            if rec['frequency'] == 'monthly' and avg_monthly_income > 0:
                affordability_percent = (rec['amount'] / avg_monthly_income * 100)
                rec['affordability'] = "easy" if affordability_percent < 10 else "moderate" if affordability_percent < 20 else "challenging"
                rec['income_percentage'] = float(affordability_percent)

        return {
            "goal_id": int(goal_id),
            "goal_name": goal['name'],
            "remaining_amount": remaining_amount,
            "days_remaining": days_remaining,
            "recommendations": recommendations,
            "preferred_recommendation": self._select_preferred_recommendation(recommendations, avg_monthly_income)
        }

    def _interpret_probability(self, probability: float) -> str:
        """Interpret probability score"""
        if probability >= 80:
            return "Very likely to achieve goal on time"
        elif probability >= 60:
            return "Good chance of achieving goal with current pace"
        elif probability >= 40:
            return "May need to increase contributions to stay on track"
        else:
            return "Significant increase in contributions needed"

    def _select_preferred_recommendation(
        self,
        recommendations: List[Dict],
        avg_income: float
    ) -> Dict[str, Any]:
        """Select the most practical recommendation"""
        for rec in recommendations:
            if rec['frequency'] == 'monthly':
                return rec

        # Default to weekly if monthly not available
        for rec in recommendations:
            if rec['frequency'] == 'weekly':
                return rec

        return recommendations[0] if recommendations else {}
