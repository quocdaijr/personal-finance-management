package models

import (
	"time"
)

// Budget represents a budget for a specific category
type Budget struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	Amount    float64   `gorm:"not null" json:"amount"`
	Spent     float64   `gorm:"not null;default:0" json:"spent"`
	Category  string    `gorm:"not null" json:"category"`
	Period    string    `gorm:"not null" json:"period"` // monthly, quarterly, yearly
	StartDate time.Time `gorm:"not null" json:"start_date"`
	EndDate   time.Time `gorm:"not null" json:"end_date"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// BudgetResponse is the response model for a budget
type BudgetResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Amount    float64   `json:"amount"`
	Spent     float64   `json:"spent"`
	Category  string    `json:"category"`
	Period    string    `json:"period"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BudgetRequest is the request model for creating/updating a budget
type BudgetRequest struct {
	Name      string    `json:"name" binding:"required"`
	Amount    float64   `json:"amount" binding:"required"`
	Spent     float64   `json:"spent"`
	Category  string    `json:"category" binding:"required"`
	Period    string    `json:"period" binding:"required,oneof=monthly quarterly yearly"`
	StartDate time.Time `json:"start_date" binding:"required"`
}

// BudgetPeriod represents a budget period
type BudgetPeriod struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// BudgetSummary represents a summary of budgets
type BudgetSummary struct {
	TotalBudgeted     float64 `json:"total_budgeted"`
	TotalSpent        float64 `json:"total_spent"`
	TotalRemaining    float64 `json:"total_remaining"`
	OverallProgress   int     `json:"overall_progress"`
	TotalBudgets      int     `json:"total_budgets"`
	BudgetsNearLimit  int     `json:"budgets_near_limit"`
	BudgetsOverLimit  int     `json:"budgets_over_limit"`
}

// ToResponse converts a Budget to a BudgetResponse
func (b *Budget) ToResponse() *BudgetResponse {
	return &BudgetResponse{
		ID:        string(b.ID),
		Name:      b.Name,
		Amount:    b.Amount,
		Spent:     b.Spent,
		Category:  b.Category,
		Period:    b.Period,
		StartDate: b.StartDate,
		EndDate:   b.EndDate,
		CreatedAt: b.CreatedAt,
		UpdatedAt: b.UpdatedAt,
	}
}
