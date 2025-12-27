package models

import (
	"time"
)

// ActivityLog represents an activity log entry for account operations
type ActivityLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	AccountID  uint      `gorm:"not null;index:idx_activity_log_account_id" json:"account_id"`
	UserID     uint      `gorm:"not null;index:idx_activity_log_user_id" json:"user_id"`
	Action     string    `gorm:"not null" json:"action"` // created_transaction, updated_budget, etc.
	EntityType string    `gorm:"not null" json:"entity_type"` // transaction, budget, goal, etc.
	EntityID   uint      `json:"entity_id"`
	Details    string    `gorm:"type:jsonb" json:"details"` // JSON details about the action
	CreatedAt  time.Time `gorm:"autoCreateTime;index:idx_activity_log_created_at" json:"created_at"`

	// Relationships
	Account *Account `gorm:"foreignKey:AccountID" json:"-"`
	User    *User    `gorm:"foreignKey:UserID" json:"-"`
}

// ActivityLogResponse represents the response for an activity log entry
type ActivityLogResponse struct {
	ID         uint      `json:"id"`
	AccountID  uint      `json:"account_id"`
	UserID     uint      `json:"user_id"`
	Username   string    `json:"username"`
	Action     string    `json:"action"`
	EntityType string    `json:"entity_type"`
	EntityID   uint      `json:"entity_id"`
	Details    string    `json:"details"`
	CreatedAt  time.Time `json:"created_at"`
}

// TableName overrides the table name
func (ActivityLog) TableName() string {
	return "activity_log"
}
