package models

import (
	"strconv"
	"strings"
	"time"
)

// Transaction represents a financial transaction
type Transaction struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index:idx_transactions_user_id;index:idx_transactions_user_date,priority:1" json:"user_id"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Description string    `json:"description"`
	Category    string    `gorm:"index:idx_transactions_category" json:"category"`
	Type        string    `gorm:"not null;index:idx_transactions_type" json:"type"` // 'income' or 'expense'
	Date        time.Time `gorm:"not null;index:idx_transactions_date;index:idx_transactions_user_date,priority:2" json:"date"`
	AccountID   uint      `gorm:"not null;index:idx_transactions_account_id" json:"account_id"`
	Tags        string    `json:"tags"` // Comma-separated tags
	CreatedAt   time.Time `gorm:"autoCreateTime;index:idx_transactions_created_at" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// TransactionResponse is the response model for a transaction
type TransactionResponse struct {
	ID          uint      `json:"id"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Type        string    `json:"type"`
	Date        time.Time `json:"date"`
	AccountID   string    `json:"account_id"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TransactionRequest is the request model for creating/updating a transaction
type TransactionRequest struct {
	Amount      float64   `json:"amount" binding:"required"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Type        string    `json:"type" binding:"required,oneof=income expense transfer"`
	Date        time.Time `json:"date" binding:"required"`
	AccountID   uint      `json:"account_id" binding:"required"`
	Tags        []string  `json:"tags"`
}

// TransferRequest is the request model for transfer transactions
type TransferRequest struct {
	Amount        float64   `json:"amount" binding:"required,gt=0"`
	Description   string    `json:"description"`
	FromAccountID uint      `json:"from_account_id" binding:"required"`
	ToAccountID   uint      `json:"to_account_id" binding:"required"`
	Date          time.Time `json:"date" binding:"required"`
	Tags          []string  `json:"tags"`
}

// TransferResponse is the response model for a transfer transaction
type TransferResponse struct {
	FromTransaction *TransactionResponse `json:"from_transaction"`
	ToTransaction   *TransactionResponse `json:"to_transaction"`
	Message         string               `json:"message"`
}

// TransactionFilter is the filter model for querying transactions
type TransactionFilter struct {
	Search    string  `form:"search"`
	Category  string  `form:"category"`
	Type      string  `form:"type"`
	AccountID uint    `form:"account_id"`
	StartDate string  `form:"start_date"`
	EndDate   string  `form:"end_date"`
	MinAmount float64 `form:"min_amount"`
	MaxAmount float64 `form:"max_amount"`
	Tags      string  `form:"tags"`
	Page      int     `form:"page"`
	PageSize  int     `form:"page_size"`
	SortBy    string  `form:"sort_by"`
	SortOrder string  `form:"sort_order"`
}

// TransactionFilterRequest represents advanced filter parameters with pagination
type TransactionFilterRequest struct {
	PaginationRequest

	// Date filters
	StartDate *time.Time `form:"start_date" time_format:"2006-01-02"`
	EndDate   *time.Time `form:"end_date" time_format:"2006-01-02"`

	// Amount filters
	MinAmount *float64 `form:"min_amount" binding:"omitempty,min=0"`
	MaxAmount *float64 `form:"max_amount" binding:"omitempty,min=0"`

	// Category filters (support multiple categories)
	Categories []string `form:"categories"`
	Category   string   `form:"category"` // Single category for backward compatibility

	// Type filter
	Type string `form:"type" binding:"omitempty,oneof=income expense transfer"`

	// Account filter
	AccountID *uint `form:"account_id"`

	// Search query
	Search string `form:"search"`

	// Tags filter
	Tags []string `form:"tags"`
}

// PaginatedTransactionResponse is the paginated response for transactions
type PaginatedTransactionResponse struct {
	Data       []*TransactionResponse `json:"data"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"page_size"`
	TotalPages int                    `json:"total_pages"`
}

// TransactionSummary represents a summary of transactions
type TransactionSummary struct {
	Income  float64                `json:"income"`
	Expenses float64               `json:"expenses"`
	Balance float64                `json:"balance"`
	Count   int                    `json:"count"`
	ByCategory []CategorySummary   `json:"by_category"`
}

// CategorySummary represents a summary of transactions by category
type CategorySummary struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Count    int     `json:"count"`
}

// ToResponse converts a Transaction to a TransactionResponse
func (t *Transaction) ToResponse() *TransactionResponse {
	// Convert comma-separated tags to slice
	var tags []string
	if t.Tags != "" {
		tags = parseTags(t.Tags)
	} else {
		tags = []string{}
	}

	return &TransactionResponse{
		ID:          t.ID,
		Amount:      t.Amount,
		Description: t.Description,
		Category:    t.Category,
		Type:        t.Type,
		Date:        t.Date,
		AccountID:   strconv.FormatUint(uint64(t.AccountID), 10),
		Tags:        tags,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}

// Helper function to parse comma-separated tags
func parseTags(tagString string) []string {
	if tagString == "" {
		return []string{}
	}

	// Split by comma and trim spaces
	var tags []string
	for _, tag := range strings.Split(tagString, ",") {
		trimmedTag := strings.TrimSpace(tag)
		if trimmedTag != "" {
			tags = append(tags, trimmedTag)
		}
	}

	return tags
}
