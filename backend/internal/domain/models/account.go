package models

import (
	"strconv"
	"time"
)

// Account represents a financial account
type Account struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index:idx_accounts_user_id" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	Type      string    `gorm:"not null;index:idx_accounts_type" json:"type"` // checking, savings, credit, investment, etc.
	Balance   float64   `gorm:"not null" json:"balance"`
	Currency  string    `gorm:"not null;default:USD" json:"currency"`
	IsDefault bool      `gorm:"not null;default:false;index:idx_accounts_is_default" json:"is_default"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// AccountResponse is the response model for an account
type AccountResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Balance   float64   `json:"balance"`
	Currency  string    `json:"currency"`
	IsDefault bool      `json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// AccountRequest is the request model for creating/updating an account
type AccountRequest struct {
	Name      string  `json:"name" binding:"required"`
	Type      string  `json:"type" binding:"required"`
	Balance   float64 `json:"balance" binding:"required"`
	Currency  string  `json:"currency" binding:"required"`
	IsDefault bool    `json:"is_default"`
}

// AccountType represents an account type
type AccountType struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// AccountSummary represents a summary of accounts
type AccountSummary struct {
	TotalAccounts    int     `json:"total_accounts"`
	TotalAssets      float64 `json:"total_assets"`
	TotalLiabilities float64 `json:"total_liabilities"`
	NetWorth         float64 `json:"net_worth"`
}

// ToResponse converts an Account to an AccountResponse
func (a *Account) ToResponse() *AccountResponse {
	return &AccountResponse{
		ID:        strconv.FormatUint(uint64(a.ID), 10),
		Name:      a.Name,
		Type:      a.Type,
		Balance:   a.Balance,
		Currency:  a.Currency,
		IsDefault: a.IsDefault,
		CreatedAt: a.CreatedAt,
		UpdatedAt: a.UpdatedAt,
	}
}
