package models

import (
	"time"
)

// Invitation represents an invitation to join a shared account
type Invitation struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	AccountID  uint      `gorm:"not null;index:idx_invitations_account_id" json:"account_id"`
	Email      string    `gorm:"not null" json:"email"`
	Role       string    `gorm:"not null" json:"role"` // admin, editor, viewer
	Token      string    `gorm:"uniqueIndex;not null" json:"token"`
	InvitedBy  uint      `gorm:"not null" json:"invited_by"`
	ExpiresAt  time.Time `gorm:"not null" json:"expires_at"`
	Status     string    `gorm:"not null;default:'pending'" json:"status"` // pending, accepted, expired, revoked
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Account *Account `gorm:"foreignKey:AccountID" json:"-"`
	Inviter *User    `gorm:"foreignKey:InvitedBy" json:"-"`
}

// InvitationRequest represents a request to create an invitation
type InvitationRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required,oneof=admin editor viewer"`
}

// InvitationResponse represents the response for an invitation
type InvitationResponse struct {
	ID          uint      `json:"id"`
	AccountID   uint      `json:"account_id"`
	AccountName string    `json:"account_name"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	InvitedBy   uint      `json:"invited_by"`
	InviterName string    `json:"inviter_name"`
	ExpiresAt   time.Time `json:"expires_at"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName overrides the table name
func (Invitation) TableName() string {
	return "invitations"
}

// IsExpired checks if the invitation is expired
func (i *Invitation) IsExpired() bool {
	return time.Now().After(i.ExpiresAt)
}

// IsValid checks if the invitation is valid
func (i *Invitation) IsValid() bool {
	return i.Status == "pending" && !i.IsExpired()
}
