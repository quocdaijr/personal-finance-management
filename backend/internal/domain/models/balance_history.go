package models

import (
	"time"
)

// BalanceHistory represents a snapshot of account balance at a point in time
type BalanceHistory struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"not null;index" json:"user_id"`
	AccountID       uint      `gorm:"not null;index" json:"account_id"`
	Balance         float64   `gorm:"not null" json:"balance"`
	ChangeAmount    float64   `json:"change_amount"`    // Amount changed from previous
	ChangeType      string    `json:"change_type"`      // "income", "expense", "transfer", "adjustment"
	TransactionID   *uint     `json:"transaction_id"`   // Related transaction if any
	Description     string    `json:"description"`
	RecordedAt      time.Time `gorm:"not null;index" json:"recorded_at"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// BalanceHistoryResponse is the API response model
type BalanceHistoryResponse struct {
	ID            uint      `json:"id"`
	AccountID     uint      `json:"account_id"`
	Balance       float64   `json:"balance"`
	ChangeAmount  float64   `json:"change_amount"`
	ChangeType    string    `json:"change_type"`
	Description   string    `json:"description"`
	RecordedAt    time.Time `json:"recorded_at"`
}

// ToResponse converts a BalanceHistory to BalanceHistoryResponse
func (h *BalanceHistory) ToResponse() *BalanceHistoryResponse {
	return &BalanceHistoryResponse{
		ID:           h.ID,
		AccountID:    h.AccountID,
		Balance:      h.Balance,
		ChangeAmount: h.ChangeAmount,
		ChangeType:   h.ChangeType,
		Description:  h.Description,
		RecordedAt:   h.RecordedAt,
	}
}

// DailyBalance represents aggregated daily balance
type DailyBalance struct {
	Date        string  `json:"date"`
	Balance     float64 `json:"balance"`
	Income      float64 `json:"income"`
	Expense     float64 `json:"expense"`
}

// BalanceTrend represents the balance trend over time
type BalanceTrend struct {
	AccountID     uint           `json:"account_id"`
	AccountName   string         `json:"account_name"`
	CurrentBalance float64       `json:"current_balance"`
	StartBalance  float64        `json:"start_balance"`
	Change        float64        `json:"change"`
	ChangePercent float64        `json:"change_percent"`
	DailyBalances []DailyBalance `json:"daily_balances"`
}

