package models

import (
	"time"
)

// Goal represents a financial savings goal
type Goal struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	UserID        uint       `gorm:"not null;index:idx_goals_user_id" json:"user_id"`
	Name          string     `gorm:"not null" json:"name"`
	Description   string     `json:"description"`
	TargetAmount  float64    `gorm:"not null" json:"target_amount"`
	CurrentAmount float64    `gorm:"default:0" json:"current_amount"`
	Currency      string     `gorm:"default:'USD'" json:"currency"`
	Category      string     `gorm:"index:idx_goals_category" json:"category"` // e.g., vacation, emergency, car, home, education
	Icon          string     `json:"icon"`     // Emoji or icon name
	Color         string     `json:"color"`    // Hex color for UI display
	TargetDate    *time.Time `gorm:"index:idx_goals_target_date" json:"target_date"`
	StartDate     time.Time  `gorm:"not null" json:"start_date"`
	AccountID     *uint      `json:"account_id"` // Optional linked account
	IsCompleted   bool       `gorm:"default:false;index:idx_goals_is_completed" json:"is_completed"`
	CompletedAt   *time.Time `json:"completed_at"`
	Priority      int        `gorm:"default:0;index:idx_goals_priority" json:"priority"` // 0=low, 1=medium, 2=high
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

// GoalRequest is the request model for creating/updating a goal
type GoalRequest struct {
	Name          string     `json:"name" binding:"required"`
	Description   string     `json:"description"`
	TargetAmount  float64    `json:"target_amount" binding:"required,gt=0"`
	CurrentAmount float64    `json:"current_amount"`
	Currency      string     `json:"currency"`
	Category      string     `json:"category"`
	Icon          string     `json:"icon"`
	Color         string     `json:"color"`
	TargetDate    *time.Time `json:"target_date"`
	StartDate     *time.Time `json:"start_date"`
	AccountID     *uint      `json:"account_id"`
	Priority      int        `json:"priority"`
}

// GoalContributionRequest is the request for adding/subtracting from a goal
type GoalContributionRequest struct {
	Amount      float64 `json:"amount" binding:"required"`
	Description string  `json:"description"`
}

// GoalResponse is the response model for a goal
type GoalResponse struct {
	ID              uint       `json:"id"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	TargetAmount    float64    `json:"target_amount"`
	CurrentAmount   float64    `json:"current_amount"`
	Currency        string     `json:"currency"`
	Category        string     `json:"category"`
	Icon            string     `json:"icon"`
	Color           string     `json:"color"`
	TargetDate      *time.Time `json:"target_date"`
	StartDate       time.Time  `json:"start_date"`
	AccountID       *uint      `json:"account_id"`
	IsCompleted     bool       `json:"is_completed"`
	CompletedAt     *time.Time `json:"completed_at"`
	Priority        int        `json:"priority"`
	ProgressPercent float64    `json:"progress_percent"`
	RemainingAmount float64    `json:"remaining_amount"`
	DaysRemaining   *int       `json:"days_remaining"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// GoalSummary provides an overview of all goals
type GoalSummary struct {
	TotalGoals        int     `json:"total_goals"`
	CompletedGoals    int     `json:"completed_goals"`
	InProgressGoals   int     `json:"in_progress_goals"`
	TotalTargetAmount float64 `json:"total_target_amount"`
	TotalSavedAmount  float64 `json:"total_saved_amount"`
	OverallProgress   float64 `json:"overall_progress"`
}

// ToResponse converts a Goal to GoalResponse
func (g *Goal) ToResponse() *GoalResponse {
	// Calculate progress percentage
	progressPercent := float64(0)
	if g.TargetAmount > 0 {
		progressPercent = (g.CurrentAmount / g.TargetAmount) * 100
		if progressPercent > 100 {
			progressPercent = 100
		}
	}

	// Calculate remaining amount
	remaining := g.TargetAmount - g.CurrentAmount
	if remaining < 0 {
		remaining = 0
	}

	// Calculate days remaining
	var daysRemaining *int
	if g.TargetDate != nil && !g.IsCompleted {
		days := int(time.Until(*g.TargetDate).Hours() / 24)
		if days < 0 {
			days = 0
		}
		daysRemaining = &days
	}

	return &GoalResponse{
		ID:              g.ID,
		Name:            g.Name,
		Description:     g.Description,
		TargetAmount:    g.TargetAmount,
		CurrentAmount:   g.CurrentAmount,
		Currency:        g.Currency,
		Category:        g.Category,
		Icon:            g.Icon,
		Color:           g.Color,
		TargetDate:      g.TargetDate,
		StartDate:       g.StartDate,
		AccountID:       g.AccountID,
		IsCompleted:     g.IsCompleted,
		CompletedAt:     g.CompletedAt,
		Priority:        g.Priority,
		ProgressPercent: progressPercent,
		RemainingAmount: remaining,
		DaysRemaining:   daysRemaining,
		CreatedAt:       g.CreatedAt,
		UpdatedAt:       g.UpdatedAt,
	}
}
