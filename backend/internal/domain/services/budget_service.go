package services

import (
	"errors"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// BudgetService handles business logic for budgets
type BudgetService struct {
	budgetRepo *repository.BudgetRepository
}

// NewBudgetService creates a new budget service
func NewBudgetService(budgetRepo *repository.BudgetRepository) *BudgetService {
	return &BudgetService{
		budgetRepo: budgetRepo,
	}
}

// calculateEndDate calculates the end date based on period and start date
func calculateEndDate(startDate time.Time, period string) time.Time {
	switch period {
	case "monthly":
		return startDate.AddDate(0, 1, 0).Add(-time.Second) // End of month
	case "quarterly":
		return startDate.AddDate(0, 3, 0).Add(-time.Second) // End of quarter
	case "yearly":
		return startDate.AddDate(1, 0, 0).Add(-time.Second) // End of year
	default:
		return startDate.AddDate(0, 1, 0).Add(-time.Second) // Default to monthly
	}
}

// Create creates a new budget
func (s *BudgetService) Create(userID uint, req *models.BudgetRequest) (*models.Budget, error) {
	// Validate mutual exclusivity: budget must belong to either a user, household, or department
	if req.HouseholdID != nil && req.DepartmentID != nil {
		return nil, errors.New("budget cannot belong to both household and department")
	}

	// Calculate end date based on period
	endDate := calculateEndDate(req.StartDate, req.Period)

	// Create budget
	budget := &models.Budget{
		UserID:       userID,
		Name:         req.Name,
		Amount:       req.Amount,
		Spent:        req.Spent,
		Category:     req.Category,
		Period:       req.Period,
		StartDate:    req.StartDate,
		EndDate:      endDate,
		HouseholdID:  req.HouseholdID,
		DepartmentID: req.DepartmentID,
	}

	// Save budget
	if err := s.budgetRepo.Create(budget); err != nil {
		return nil, err
	}

	return budget, nil
}

// GetByID gets a budget by ID
func (s *BudgetService) GetByID(id uint, userID uint) (*models.Budget, error) {
	return s.budgetRepo.GetByID(id, userID)
}

// GetAll gets all budgets for a user
func (s *BudgetService) GetAll(userID uint) ([]models.Budget, error) {
	return s.budgetRepo.GetAll(userID)
}

// Update updates a budget
func (s *BudgetService) Update(id uint, userID uint, req *models.BudgetRequest) (*models.Budget, error) {
	// Get existing budget
	budget, err := s.budgetRepo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	// Validate mutual exclusivity: budget must belong to either a user, household, or department
	if req.HouseholdID != nil && req.DepartmentID != nil {
		return nil, errors.New("budget cannot belong to both household and department")
	}

	// Calculate end date based on period
	endDate := calculateEndDate(req.StartDate, req.Period)

	// Update budget
	budget.Name = req.Name
	budget.Amount = req.Amount
	budget.Spent = req.Spent
	budget.Category = req.Category
	budget.Period = req.Period
	budget.StartDate = req.StartDate
	budget.EndDate = endDate
	budget.HouseholdID = req.HouseholdID
	budget.DepartmentID = req.DepartmentID

	// Save budget
	if err := s.budgetRepo.Update(budget); err != nil {
		return nil, err
	}

	return budget, nil
}

// Delete deletes a budget
func (s *BudgetService) Delete(id uint, userID uint) error {
	return s.budgetRepo.Delete(id, userID)
}

// GetBudgetPeriods gets all budget periods
func (s *BudgetService) GetBudgetPeriods() []models.BudgetPeriod {
	return s.budgetRepo.GetBudgetPeriods()
}

// GetSummary gets a summary of budgets for a user
func (s *BudgetService) GetSummary(userID uint) (*models.BudgetSummary, error) {
	return s.budgetRepo.GetSummary(userID)
}
