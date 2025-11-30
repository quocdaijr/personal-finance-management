package services

import (
	"errors"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// GoalService handles business logic for financial goals
type GoalService struct {
	goalRepo    *repository.GoalRepository
	accountRepo *repository.AccountRepository
}

// NewGoalService creates a new goal service
func NewGoalService(
	goalRepo *repository.GoalRepository,
	accountRepo *repository.AccountRepository,
) *GoalService {
	return &GoalService{
		goalRepo:    goalRepo,
		accountRepo: accountRepo,
	}
}

// Create creates a new financial goal
func (s *GoalService) Create(userID uint, req *models.GoalRequest) (*models.Goal, error) {
	// Validate linked account if provided
	if req.AccountID != nil {
		_, err := s.accountRepo.GetByID(*req.AccountID, userID)
		if err != nil {
			return nil, errors.New("linked account not found")
		}
	}

	// Set default values
	startDate := time.Now()
	if req.StartDate != nil {
		startDate = *req.StartDate
	}

	currency := "USD"
	if req.Currency != "" {
		currency = req.Currency
	}

	goal := &models.Goal{
		UserID:        userID,
		Name:          req.Name,
		Description:   req.Description,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: req.CurrentAmount,
		Currency:      currency,
		Category:      req.Category,
		Icon:          req.Icon,
		Color:         req.Color,
		TargetDate:    req.TargetDate,
		StartDate:     startDate,
		AccountID:     req.AccountID,
		Priority:      req.Priority,
		IsCompleted:   false,
	}

	// Check if already completed
	if goal.CurrentAmount >= goal.TargetAmount {
		goal.IsCompleted = true
		now := time.Now()
		goal.CompletedAt = &now
	}

	if err := s.goalRepo.Create(goal); err != nil {
		return nil, err
	}

	return goal, nil
}

// GetByID gets a goal by ID
func (s *GoalService) GetByID(id uint, userID uint) (*models.Goal, error) {
	return s.goalRepo.GetByID(id, userID)
}

// GetAll gets all goals for a user
func (s *GoalService) GetAll(userID uint) ([]models.Goal, error) {
	return s.goalRepo.GetAll(userID)
}

// GetActive gets all active goals for a user
func (s *GoalService) GetActive(userID uint) ([]models.Goal, error) {
	return s.goalRepo.GetActive(userID)
}

// Update updates a goal
func (s *GoalService) Update(id uint, userID uint, req *models.GoalRequest) (*models.Goal, error) {
	goal, err := s.goalRepo.GetByID(id, userID)
	if err != nil {
		return nil, errors.New("goal not found")
	}

	// Validate linked account if provided
	if req.AccountID != nil {
		_, err := s.accountRepo.GetByID(*req.AccountID, userID)
		if err != nil {
			return nil, errors.New("linked account not found")
		}
	}

	// Update fields
	goal.Name = req.Name
	goal.Description = req.Description
	goal.TargetAmount = req.TargetAmount
	goal.CurrentAmount = req.CurrentAmount
	goal.Category = req.Category
	goal.Icon = req.Icon
	goal.Color = req.Color
	goal.TargetDate = req.TargetDate
	goal.AccountID = req.AccountID
	goal.Priority = req.Priority

	if req.Currency != "" {
		goal.Currency = req.Currency
	}

	// Check completion status
	if goal.CurrentAmount >= goal.TargetAmount && !goal.IsCompleted {
		goal.IsCompleted = true
		now := time.Now()
		goal.CompletedAt = &now
	} else if goal.CurrentAmount < goal.TargetAmount && goal.IsCompleted {
		goal.IsCompleted = false
		goal.CompletedAt = nil
	}

	if err := s.goalRepo.Update(goal); err != nil {
		return nil, err
	}

	return goal, nil
}

// Delete deletes a goal
func (s *GoalService) Delete(id uint, userID uint) error {
	return s.goalRepo.Delete(id, userID)
}

// GetSummary gets a summary of all goals
func (s *GoalService) GetSummary(userID uint) (*models.GoalSummary, error) {
	return s.goalRepo.GetSummary(userID)
}

// Contribute adds or subtracts from a goal's current amount
func (s *GoalService) Contribute(id uint, userID uint, amount float64, description string) (*models.Goal, error) {
	goal, err := s.goalRepo.GetByID(id, userID)
	if err != nil {
		return nil, errors.New("goal not found")
	}

	// Update current amount
	goal.CurrentAmount += amount
	if goal.CurrentAmount < 0 {
		goal.CurrentAmount = 0
	}

	// Check completion status
	if goal.CurrentAmount >= goal.TargetAmount && !goal.IsCompleted {
		goal.IsCompleted = true
		now := time.Now()
		goal.CompletedAt = &now
	} else if goal.CurrentAmount < goal.TargetAmount && goal.IsCompleted {
		goal.IsCompleted = false
		goal.CompletedAt = nil
	}

	if err := s.goalRepo.Update(goal); err != nil {
		return nil, err
	}

	return goal, nil
}

// GetCategories returns available goal categories
func (s *GoalService) GetCategories() []string {
	return []string{
		"Emergency Fund",
		"Vacation",
		"Car",
		"Home",
		"Education",
		"Retirement",
		"Wedding",
		"Investment",
		"Debt Payoff",
		"Technology",
		"Health",
		"Other",
	}
}

