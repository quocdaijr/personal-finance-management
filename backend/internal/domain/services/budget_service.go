package services

import (
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

// Create creates a new budget
func (s *BudgetService) Create(userID uint, req *models.BudgetRequest) (*models.Budget, error) {
	// Create budget
	budget := &models.Budget{
		UserID:    userID,
		Name:      req.Name,
		Amount:    req.Amount,
		Spent:     req.Spent,
		Category:  req.Category,
		Period:    req.Period,
		StartDate: req.StartDate,
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

	// Update budget
	budget.Name = req.Name
	budget.Amount = req.Amount
	budget.Spent = req.Spent
	budget.Category = req.Category
	budget.Period = req.Period
	budget.StartDate = req.StartDate

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
