package models

import (
	"time"

	"github.com/lib/pq"
)

// Comment represents a comment on a transaction
type Comment struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	TransactionID uint           `gorm:"not null;index:idx_comments_transaction_id" json:"transaction_id"`
	UserID        uint           `gorm:"not null;index:idx_comments_user_id" json:"user_id"`
	Content       string         `gorm:"type:text;not null" json:"content"`
	Mentions      pq.Int64Array  `gorm:"type:integer[]" json:"mentions"` // Array of user IDs
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Transaction *Transaction `gorm:"foreignKey:TransactionID" json:"-"`
	User        *User        `gorm:"foreignKey:UserID" json:"-"`
}

// CommentRequest represents a request to create a comment
type CommentRequest struct {
	Content  string  `json:"content" binding:"required"`
	Mentions []uint  `json:"mentions"`
}

// CommentResponse represents the response for a comment
type CommentResponse struct {
	ID            uint      `json:"id"`
	TransactionID uint      `json:"transaction_id"`
	UserID        uint      `json:"user_id"`
	Username      string    `json:"username"`
	Content       string    `json:"content"`
	Mentions      []uint    `json:"mentions"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// TableName overrides the table name
func (Comment) TableName() string {
	return "comments"
}
