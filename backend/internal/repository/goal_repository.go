package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// GoalRepository handles database operations for goals
type GoalRepository struct {
	db *gorm.DB
}

// NewGoalRepository creates a new goal repository
func NewGoalRepository(db *gorm.DB) *GoalRepository {
	return &GoalRepository{db: db}
}

// Create creates a new goal
func (r *GoalRepository) Create(goal *models.Goal) error {
	return r.db.Create(goal).Error
}

// GetByID gets a goal by ID
func (r *GoalRepository) GetByID(id uint, userID uint) (*models.Goal, error) {
	var goal models.Goal
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&goal).Error
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

// GetAll gets all goals for a user
func (r *GoalRepository) GetAll(userID uint) ([]models.Goal, error) {
	var goals []models.Goal
	err := r.db.Where("user_id = ?", userID).
		Order("is_completed ASC, priority DESC, target_date ASC").
		Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

// GetActive gets all active (non-completed) goals for a user
func (r *GoalRepository) GetActive(userID uint) ([]models.Goal, error) {
	var goals []models.Goal
	err := r.db.Where("user_id = ? AND is_completed = ?", userID, false).
		Order("priority DESC, target_date ASC").
		Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

// GetCompleted gets all completed goals for a user
func (r *GoalRepository) GetCompleted(userID uint) ([]models.Goal, error) {
	var goals []models.Goal
	err := r.db.Where("user_id = ? AND is_completed = ?", userID, true).
		Order("completed_at DESC").
		Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

// Update updates a goal
func (r *GoalRepository) Update(goal *models.Goal) error {
	return r.db.Save(goal).Error
}

// Delete deletes a goal
func (r *GoalRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Goal{}).Error
}

// GetByHousehold gets all goals for a household
func (r *GoalRepository) GetByHousehold(householdID uint, goals *[]models.Goal) error {
	return r.db.Where("household_id = ?", householdID).
		Order("is_completed ASC, priority DESC, target_date ASC").
		Find(goals).Error
}

// GetSummary gets a summary of all goals for a user
func (r *GoalRepository) GetSummary(userID uint) (*models.GoalSummary, error) {
	goals, err := r.GetAll(userID)
	if err != nil {
		return nil, err
	}

	summary := &models.GoalSummary{
		TotalGoals:        len(goals),
		CompletedGoals:    0,
		InProgressGoals:   0,
		TotalTargetAmount: 0,
		TotalSavedAmount:  0,
		OverallProgress:   0,
	}

	for _, g := range goals {
		summary.TotalTargetAmount += g.TargetAmount
		summary.TotalSavedAmount += g.CurrentAmount

		if g.IsCompleted {
			summary.CompletedGoals++
		} else {
			summary.InProgressGoals++
		}
	}

	if summary.TotalTargetAmount > 0 {
		summary.OverallProgress = (summary.TotalSavedAmount / summary.TotalTargetAmount) * 100
	}

	return summary, nil
}

// GetByCategory gets goals by category for a user
func (r *GoalRepository) GetByCategory(userID uint, category string) ([]models.Goal, error) {
	var goals []models.Goal
	err := r.db.Where("user_id = ? AND category = ?", userID, category).
		Order("priority DESC, target_date ASC").
		Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

