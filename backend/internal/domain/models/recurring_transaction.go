package models

import (
	"time"
)

// RecurringTransaction represents a recurring/scheduled transaction
type RecurringTransaction struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Type        string    `gorm:"not null" json:"type"` // 'income' or 'expense'
	AccountID   uint      `gorm:"not null" json:"account_id"`
	Tags        string    `json:"tags"`

	// Recurrence settings
	Frequency     string    `gorm:"not null" json:"frequency"` // daily, weekly, monthly, yearly
	Interval      int       `gorm:"default:1" json:"interval"` // Every X frequency units
	DayOfWeek     int       `json:"day_of_week"`               // 0-6 for weekly (0=Sunday)
	DayOfMonth    int       `json:"day_of_month"`              // 1-31 for monthly
	MonthOfYear   int       `json:"month_of_year"`             // 1-12 for yearly
	StartDate     time.Time `gorm:"not null" json:"start_date"`
	EndDate       *time.Time `json:"end_date"`                  // Optional end date
	NextRunDate   time.Time `gorm:"not null" json:"next_run_date"`
	LastRunDate   *time.Time `json:"last_run_date"`

	// Status
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	TotalRuns     int       `gorm:"default:0" json:"total_runs"`
	MaxRuns       int       `json:"max_runs"` // 0 = unlimited

	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// RecurringTransactionRequest is the request model for creating/updating a recurring transaction
type RecurringTransactionRequest struct {
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Type        string    `json:"type" binding:"required,oneof=income expense"`
	AccountID   uint      `json:"account_id" binding:"required"`
	Tags        []string  `json:"tags"`
	Frequency   string    `json:"frequency" binding:"required,oneof=daily weekly monthly yearly"`
	Interval    int       `json:"interval"`
	DayOfWeek   int       `json:"day_of_week"`
	DayOfMonth  int       `json:"day_of_month"`
	MonthOfYear int       `json:"month_of_year"`
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     *time.Time `json:"end_date"`
	MaxRuns     int       `json:"max_runs"`
}

// RecurringTransactionResponse is the response model for a recurring transaction
type RecurringTransactionResponse struct {
	ID            uint       `json:"id"`
	Amount        float64    `json:"amount"`
	Description   string     `json:"description"`
	Category      string     `json:"category"`
	Type          string     `json:"type"`
	AccountID     uint       `json:"account_id"`
	Tags          []string   `json:"tags"`
	Frequency     string     `json:"frequency"`
	Interval      int        `json:"interval"`
	DayOfWeek     int        `json:"day_of_week"`
	DayOfMonth    int        `json:"day_of_month"`
	MonthOfYear   int        `json:"month_of_year"`
	StartDate     time.Time  `json:"start_date"`
	EndDate       *time.Time `json:"end_date"`
	NextRunDate   time.Time  `json:"next_run_date"`
	LastRunDate   *time.Time `json:"last_run_date"`
	IsActive      bool       `json:"is_active"`
	TotalRuns     int        `json:"total_runs"`
	MaxRuns       int        `json:"max_runs"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// ToResponse converts a RecurringTransaction to RecurringTransactionResponse
func (r *RecurringTransaction) ToResponse() *RecurringTransactionResponse {
	var tags []string
	if r.Tags != "" {
		tags = parseTags(r.Tags)
	} else {
		tags = []string{}
	}

	return &RecurringTransactionResponse{
		ID:          r.ID,
		Amount:      r.Amount,
		Description: r.Description,
		Category:    r.Category,
		Type:        r.Type,
		AccountID:   r.AccountID,
		Tags:        tags,
		Frequency:   r.Frequency,
		Interval:    r.Interval,
		DayOfWeek:   r.DayOfWeek,
		DayOfMonth:  r.DayOfMonth,
		MonthOfYear: r.MonthOfYear,
		StartDate:   r.StartDate,
		EndDate:     r.EndDate,
		NextRunDate: r.NextRunDate,
		LastRunDate: r.LastRunDate,
		IsActive:    r.IsActive,
		TotalRuns:   r.TotalRuns,
		MaxRuns:     r.MaxRuns,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}

// CalculateNextRunDate calculates the next run date based on frequency and interval
func (r *RecurringTransaction) CalculateNextRunDate() time.Time {
	baseDate := r.NextRunDate
	if r.LastRunDate != nil {
		baseDate = *r.LastRunDate
	}

	interval := r.Interval
	if interval < 1 {
		interval = 1
	}

	switch r.Frequency {
	case "daily":
		return baseDate.AddDate(0, 0, interval)
	case "weekly":
		return baseDate.AddDate(0, 0, 7*interval)
	case "monthly":
		return baseDate.AddDate(0, interval, 0)
	case "yearly":
		return baseDate.AddDate(interval, 0, 0)
	default:
		return baseDate.AddDate(0, 1, 0) // Default monthly
	}
}

