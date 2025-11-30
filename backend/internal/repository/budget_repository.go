package repository

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// BudgetRepository handles database operations for budgets
type BudgetRepository struct {
	db *gorm.DB
}

// NewBudgetRepository creates a new budget repository
func NewBudgetRepository(db *gorm.DB) *BudgetRepository {
	return &BudgetRepository{db: db}
}

// Create creates a new budget
func (r *BudgetRepository) Create(budget *models.Budget) error {
	// Calculate end date based on period and start date
	budget.EndDate = calculateEndDate(budget.StartDate, budget.Period)
	return r.db.Create(budget).Error
}

// GetByID gets a budget by ID
func (r *BudgetRepository) GetByID(id uint, userID uint) (*models.Budget, error) {
	var budget models.Budget
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&budget).Error
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

// GetAll gets all budgets for a user
func (r *BudgetRepository) GetAll(userID uint) ([]models.Budget, error) {
	var budgets []models.Budget
	err := r.db.Where("user_id = ?", userID).Find(&budgets).Error
	if err != nil {
		return nil, err
	}
	return budgets, nil
}

// GetActive gets all active budgets for a user (budgets where current date is within start and end date)
func (r *BudgetRepository) GetActive(userID uint) ([]models.Budget, error) {
	var budgets []models.Budget
	now := time.Now()
	err := r.db.Where("user_id = ? AND start_date <= ? AND end_date >= ?", userID, now, now).Find(&budgets).Error
	if err != nil {
		return nil, err
	}
	return budgets, nil
}

// Update updates a budget
func (r *BudgetRepository) Update(budget *models.Budget) error {
	// Calculate end date based on period and start date
	budget.EndDate = calculateEndDate(budget.StartDate, budget.Period)
	return r.db.Save(budget).Error
}

// Delete deletes a budget
func (r *BudgetRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Budget{}).Error
}

// GetBudgetPeriods gets all budget periods
func (r *BudgetRepository) GetBudgetPeriods() []models.BudgetPeriod {
	return []models.BudgetPeriod{
		{ID: "monthly", Name: "Monthly"},
		{ID: "quarterly", Name: "Quarterly"},
		{ID: "yearly", Name: "Yearly"},
	}
}

// GetSummary gets a summary of budgets for a user
func (r *BudgetRepository) GetSummary(userID uint) (*models.BudgetSummary, error) {
	// Get all budgets for the user
	budgets, err := r.GetAll(userID)
	if err != nil {
		return nil, err
	}

	// Calculate summary
	summary := &models.BudgetSummary{
		TotalBudgeted:    0,
		TotalSpent:       0,
		TotalRemaining:   0,
		OverallProgress:  0,
		TotalBudgets:     len(budgets),
		BudgetsNearLimit: 0,
		BudgetsOverLimit: 0,
	}

	// Calculate totals
	for _, b := range budgets {
		summary.TotalBudgeted += b.Amount
		summary.TotalSpent += b.Spent

		// Check if budget is near or over limit
		percentSpent := 0
		if b.Amount > 0 {
			percentSpent = int((b.Spent / b.Amount) * 100)
		}

		if percentSpent >= 100 {
			summary.BudgetsOverLimit++
		} else if percentSpent >= 80 {
			summary.BudgetsNearLimit++
		}
	}

	// Calculate remaining and overall progress
	summary.TotalRemaining = summary.TotalBudgeted - summary.TotalSpent
	if summary.TotalBudgeted > 0 {
		summary.OverallProgress = int((summary.TotalSpent / summary.TotalBudgeted) * 100)
		if summary.OverallProgress > 100 {
			summary.OverallProgress = 100
		}
	}

	return summary, nil
}

// Helper function to calculate end date based on period and start date
func calculateEndDate(startDate time.Time, period string) time.Time {
	endDate := startDate
	
	switch period {
	case "monthly":
		endDate = endDate.AddDate(0, 1, 0)
	case "quarterly":
		endDate = endDate.AddDate(0, 3, 0)
	case "yearly":
		endDate = endDate.AddDate(1, 0, 0)
	default:
		endDate = endDate.AddDate(0, 1, 0)
	}
	
	// Subtract 1 second to make it inclusive
	endDate = endDate.Add(-time.Second)
	
	return endDate
}
