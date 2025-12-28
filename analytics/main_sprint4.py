"""
Sprint 4 Analytics API Endpoints
This module contains all new Sprint 4 analytics endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Security, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import os

from database import get_db
from auth import AuthHandler
from advanced_analytics import AdvancedAnalytics
from trend_forecasting import TrendForecasting
from category_breakdown import CategoryBreakdown
from ai_insights import AIInsights
from visualization_data import VisualizationData
from goal_analytics import GoalAnalytics
from report_generator import ReportGenerator

router = APIRouter()
security = HTTPBearer()
auth_handler = AuthHandler()


def get_user_id(auth: HTTPAuthorizationCredentials) -> int:
    """Extract user ID from JWT token"""
    payload = auth_handler.decode_token(auth.credentials)
    user_id = payload.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


# ============================================================================
# TASK 1: Advanced Analytics Engine
# ============================================================================

@router.get("/api/analytics/spending-patterns")
def get_spending_patterns(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: str = Query("month", regex="^(day|week|month)$")
):
    """Get detailed spending pattern analysis"""
    try:
        user_id = get_user_id(auth)
        analytics = AdvancedAnalytics(db)

        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None

        result = analytics.get_spending_patterns(user_id, start, end, group_by)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing spending patterns: {str(e)}")


@router.get("/api/analytics/income-expense-trends")
def get_income_expense_trends(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    months: int = Query(12, ge=1, le=24)
):
    """Get income vs expense comparative trends"""
    try:
        user_id = get_user_id(auth)
        analytics = AdvancedAnalytics(db)

        result = analytics.get_income_expense_trends(user_id, months)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing trends: {str(e)}")


@router.get("/api/analytics/category-breakdown")
def get_category_breakdown(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: str = Query("expense", regex="^(expense|income)$")
):
    """Get enhanced category breakdown with analytics"""
    try:
        user_id = get_user_id(auth)
        breakdown = CategoryBreakdown(db)

        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None

        result = breakdown.get_category_breakdown(user_id, start, end, transaction_type)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing categories: {str(e)}")


@router.get("/api/analytics/forecast")
def get_spending_forecast(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    forecast_months: int = Query(3, ge=1, le=12),
    category: Optional[str] = None
):
    """Get future spending predictions"""
    try:
        user_id = get_user_id(auth)
        forecasting = TrendForecasting(db)

        result = forecasting.forecast_spending(user_id, forecast_months, category)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")


@router.get("/api/analytics/year-over-year")
def get_year_over_year_comparison(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    category: Optional[str] = None
):
    """Get year-over-year comparison"""
    try:
        user_id = get_user_id(auth)
        analytics = AdvancedAnalytics(db)

        result = analytics.get_year_over_year_comparison(user_id, category)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing years: {str(e)}")


# ============================================================================
# TASK 2: AI-Powered Insights
# ============================================================================

@router.get("/api/analytics/anomalies")
def detect_anomalies(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    sensitivity: str = Query("medium", regex="^(low|medium|high)$"),
    days: int = Query(90, ge=30, le=365)
):
    """Detect unusual transactions"""
    try:
        user_id = get_user_id(auth)
        ai = AIInsights(db)

        result = ai.detect_anomalies(user_id, sensitivity, days)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")


@router.get("/api/analytics/recommendations")
def get_budget_recommendations(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get AI-powered budget recommendations"""
    try:
        user_id = get_user_id(auth)
        ai = AIInsights(db)

        result = ai.generate_budget_recommendations(user_id)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@router.get("/api/analytics/savings-opportunities")
def identify_savings_opportunities(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Identify potential savings opportunities"""
    try:
        user_id = get_user_id(auth)
        ai = AIInsights(db)

        result = ai.identify_savings_opportunities(user_id)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error identifying savings: {str(e)}")


# ============================================================================
# TASK 4: Data Visualization Enhancements
# ============================================================================

@router.get("/api/analytics/heatmap")
def get_spending_heatmap(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    months: int = Query(6, ge=1, le=12)
):
    """Get spending heatmap data (day of week x hour)"""
    try:
        user_id = get_user_id(auth)
        viz = VisualizationData(db)

        result = viz.get_spending_heatmap(user_id, months)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating heatmap: {str(e)}")


@router.get("/api/analytics/trend-lines")
def get_trend_lines(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    months: int = Query(12, ge=3, le=24),
    metric: str = Query("expenses", regex="^(expenses|income|net)$")
):
    """Get trend line calculations with linear regression"""
    try:
        user_id = get_user_id(auth)
        forecasting = TrendForecasting(db)

        result = forecasting.calculate_trend_lines(user_id, months, metric)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating trends: {str(e)}")


@router.get("/api/analytics/comparison")
def get_comparative_analysis(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    comparison_type: str = Query("month_over_month", regex="^(month_over_month|year_over_year)$")
):
    """Get comparative analysis between periods"""
    try:
        user_id = get_user_id(auth)
        viz = VisualizationData(db)

        result = viz.get_comparison_data(user_id, comparison_type)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating comparison: {str(e)}")


@router.get("/api/analytics/waterfall")
def get_waterfall_chart_data(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get waterfall chart data for cash flow"""
    try:
        user_id = get_user_id(auth)
        viz = VisualizationData(db)

        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None

        result = viz.get_waterfall_data(user_id, start, end)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating waterfall data: {str(e)}")


@router.get("/api/analytics/seasonality")
def detect_seasonality(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    category: Optional[str] = None
):
    """Detect seasonal spending patterns"""
    try:
        user_id = get_user_id(auth)
        forecasting = TrendForecasting(db)

        result = forecasting.detect_seasonality(user_id, category)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting seasonality: {str(e)}")


# ============================================================================
# TASK 5: Financial Goals Analytics
# ============================================================================

@router.get("/api/analytics/goals/{goal_id}/probability")
def get_goal_achievement_probability(
    goal_id: int,
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Calculate probability of achieving a financial goal"""
    try:
        user_id = get_user_id(auth)
        goal_analytics = GoalAnalytics()

        result = goal_analytics.calculate_achievement_probability(user_id, goal_id)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating probability: {str(e)}")


@router.get("/api/analytics/goals/{goal_id}/projections")
def get_goal_timeline_projections(
    goal_id: int,
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get timeline projections for goal achievement"""
    try:
        user_id = get_user_id(auth)
        goal_analytics = GoalAnalytics()

        result = goal_analytics.get_timeline_projections(user_id, goal_id)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating projections: {str(e)}")


@router.get("/api/analytics/goals/{goal_id}/recommendations")
def get_goal_contribution_recommendations(
    goal_id: int,
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get contribution recommendations for a goal"""
    try:
        user_id = get_user_id(auth)
        goal_analytics = GoalAnalytics()

        result = goal_analytics.get_contribution_recommendations(user_id, goal_id)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


# ============================================================================
# TASK 3: Custom Reports (PDF/Excel Generation)
# ============================================================================

@router.post("/api/analytics/reports/generate")
def generate_report(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    report_type: str = Query("monthly", regex="^(monthly|yearly|custom)$"),
    format: str = Query("pdf", regex="^(pdf|excel)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Generate a financial report (PDF or Excel)"""
    try:
        user_id = get_user_id(auth)
        generator = ReportGenerator(db)

        # Parse dates
        if start_date:
            start = datetime.fromisoformat(start_date)
        elif report_type == "monthly":
            start = datetime.now().replace(day=1)
        else:  # yearly
            start = datetime.now().replace(month=1, day=1)

        if end_date:
            end = datetime.fromisoformat(end_date)
        else:
            end = datetime.now()

        # Create reports directory if it doesn't exist
        reports_dir = os.getenv('REPORT_STORAGE_PATH', '/tmp/reports')
        os.makedirs(reports_dir, exist_ok=True)

        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"report_{report_type}_{user_id}_{timestamp}.{format if format == 'pdf' else 'xlsx'}"
        output_path = os.path.join(reports_dir, filename)

        # Generate report
        if format == "pdf":
            result = generator.generate_pdf_report(user_id, report_type, start, end, output_path)
        else:
            result = generator.generate_excel_report(user_id, report_type, start, end, output_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")


# ============================================================================
# Additional Category Analytics
# ============================================================================

@router.get("/api/analytics/category/{category}/trends")
def get_category_trends(
    category: str,
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
    months: int = Query(6, ge=1, le=24)
):
    """Get spending trends for a specific category"""
    try:
        user_id = get_user_id(auth)
        breakdown = CategoryBreakdown(db)

        result = breakdown.get_category_trends(user_id, category, months)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing category trends: {str(e)}")
