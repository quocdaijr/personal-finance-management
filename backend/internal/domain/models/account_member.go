package models

import (
	"time"
)

// AccountMember represents a user's membership in a shared account
type AccountMember struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	AccountID   uint      `gorm:"not null;index:idx_account_members_account_id" json:"account_id"`
	UserID      uint      `gorm:"not null;index:idx_account_members_user_id" json:"user_id"`
	Role        string    `gorm:"not null" json:"role"` // owner, admin, editor, viewer
	Permissions string    `gorm:"type:jsonb" json:"permissions"` // JSON: {can_edit: true, can_delete: false, can_invite: true}
	InvitedBy   *uint     `json:"invited_by"`
	InvitedAt   *time.Time `json:"invited_at"`
	AcceptedAt  *time.Time `json:"accepted_at"`
	Status      string    `gorm:"not null;default:'active'" json:"status"` // pending, active, revoked
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Account *Account `gorm:"foreignKey:AccountID" json:"-"`
	User    *User    `gorm:"foreignKey:UserID" json:"-"`
}

// AccountMemberPermissions represents the permissions structure
type AccountMemberPermissions struct {
	CanEdit      bool `json:"can_edit"`
	CanDelete    bool `json:"can_delete"`
	CanInvite    bool `json:"can_invite"`
	CanManage    bool `json:"can_manage"`
	CanTransact  bool `json:"can_transact"`
}

// AccountMemberResponse represents the response for an account member
type AccountMemberResponse struct {
	ID         uint                     `json:"id"`
	AccountID  uint                     `json:"account_id"`
	UserID     uint                     `json:"user_id"`
	Username   string                   `json:"username"`
	Email      string                   `json:"email"`
	Role       string                   `json:"role"`
	Permissions AccountMemberPermissions `json:"permissions"`
	Status     string                   `json:"status"`
	InvitedAt  *time.Time               `json:"invited_at"`
	AcceptedAt *time.Time               `json:"accepted_at"`
	CreatedAt  time.Time                `json:"created_at"`
}

// TableName overrides the table name
func (AccountMember) TableName() string {
	return "account_members"
}

// GetDefaultPermissions returns default permissions for a role
func GetDefaultPermissions(role string) AccountMemberPermissions {
	switch role {
	case "owner":
		return AccountMemberPermissions{
			CanEdit:     true,
			CanDelete:   true,
			CanInvite:   true,
			CanManage:   true,
			CanTransact: true,
		}
	case "admin":
		return AccountMemberPermissions{
			CanEdit:     true,
			CanDelete:   true,
			CanInvite:   true,
			CanManage:   true,
			CanTransact: true,
		}
	case "editor":
		return AccountMemberPermissions{
			CanEdit:     true,
			CanDelete:   false,
			CanInvite:   false,
			CanManage:   false,
			CanTransact: true,
		}
	case "viewer":
		return AccountMemberPermissions{
			CanEdit:     false,
			CanDelete:   false,
			CanInvite:   false,
			CanManage:   false,
			CanTransact: false,
		}
	default:
		return AccountMemberPermissions{}
	}
}
