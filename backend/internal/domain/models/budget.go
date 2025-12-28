package models

import (
	"fmt"
	"time"
)

// Budget represents a budget for a specific category
type Budget struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"not null;index:idx_budgets_user_id;index:idx_budgets_user_period,priority:1" json:"user_id"`
	Name         string    `gorm:"not null" json:"name"`
	Amount       float64   `gorm:"not null" json:"amount"`
	Spent        float64   `gorm:"not null;default:0" json:"spent"`
	Category     string    `gorm:"not null;index:idx_budgets_category" json:"category"`
	Period       string    `gorm:"not null;index:idx_budgets_period;index:idx_budgets_user_period,priority:2" json:"period"` // monthly, quarterly, yearly
	StartDate    time.Time `gorm:"not null;index:idx_budgets_start_date" json:"start_date"`
	EndDate      time.Time `gorm:"not null;index:idx_budgets_end_date" json:"end_date"`
	HouseholdID  *uint     `gorm:"index:idx_budgets_household_id" json:"household_id"` // For household budgets
	DepartmentID *uint     `gorm:"index:idx_budgets_department_id" json:"department_id"` // For department budgets
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// BudgetResponse is the response model for a budget
type BudgetResponse struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Amount       float64   `json:"amount"`
	Spent        float64   `json:"spent"`
	Category     string    `json:"category"`
	Period       string    `json:"period"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	HouseholdID  *uint     `json:"household_id,omitempty"`  // For household budgets
	DepartmentID *uint     `json:"department_id,omitempty"` // For department budgets
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// BudgetRequest is the request model for creating/updating a budget
type BudgetRequest struct {
	Name         string    `json:"name" binding:"required"`
	Amount       float64   `json:"amount" binding:"required"`
	Spent        float64   `json:"spent"`
	Category     string    `json:"category" binding:"required"`
	Period       string    `json:"period" binding:"required,oneof=monthly quarterly yearly"`
	StartDate    time.Time `json:"start_date" binding:"required"`
	HouseholdID  *uint     `json:"household_id,omitempty"`  // For household budgets
	DepartmentID *uint     `json:"department_id,omitempty"` // For department budgets
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
		ID:           fmt.Sprintf("%d", b.ID),
		Name:         b.Name,
		Amount:       b.Amount,
		Spent:        b.Spent,
		Category:     b.Category,
		Period:       b.Period,
		StartDate:    b.StartDate,
		EndDate:      b.EndDate,
		HouseholdID:  b.HouseholdID,
		DepartmentID: b.DepartmentID,
		CreatedAt:    b.CreatedAt,
		UpdatedAt:    b.UpdatedAt,
	}
}
