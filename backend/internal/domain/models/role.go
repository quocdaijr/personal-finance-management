package models

import (
	"time"
)

// Role represents a custom role with specific permissions
type Role struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	AccountID    *uint     `gorm:"index:idx_roles_account_id" json:"account_id"` // NULL for system roles
	Name         string    `gorm:"not null" json:"name"`
	Description  string    `json:"description"`
	Permissions  string    `gorm:"type:text;not null" json:"permissions"` // JSON: {transactions: {read: true, write: true, delete: false}}
	IsSystemRole bool      `gorm:"default:false" json:"is_system_role"` // owner, admin, editor, viewer
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Account *Account `gorm:"foreignKey:AccountID" json:"-"`
}

// UserRole represents a user's role assignment
type UserRole struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index:idx_user_roles_user_id" json:"user_id"`
	AccountID  uint      `gorm:"not null;index:idx_user_roles_account_id" json:"account_id"`
	RoleID     uint      `gorm:"not null;index:idx_user_roles_role_id" json:"role_id"`
	AssignedBy uint      `gorm:"not null" json:"assigned_by"`
	AssignedAt time.Time `gorm:"autoCreateTime" json:"assigned_at"`

	// Relationships
	User     *User    `gorm:"foreignKey:UserID" json:"-"`
	Account  *Account `gorm:"foreignKey:AccountID" json:"-"`
	Role     *Role    `gorm:"foreignKey:RoleID" json:"-"`
	Assigner *User    `gorm:"foreignKey:AssignedBy" json:"-"`
}

// PermissionAuditLog represents a log entry for permission checks
type PermissionAuditLog struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `gorm:"not null;index:idx_permission_audit_user_id" json:"user_id"`
	Action             string    `gorm:"not null" json:"action"`
	ResourceType       string    `gorm:"not null" json:"resource_type"`
	ResourceID         uint      `json:"resource_id"`
	PermissionChecked  string    `gorm:"not null" json:"permission_checked"`
	Granted            bool      `gorm:"not null" json:"granted"`
	CreatedAt          time.Time `gorm:"autoCreateTime;index:idx_permission_audit_created_at" json:"created_at"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

// RolePermissions represents the permissions structure
type RolePermissions struct {
	Transactions  ResourcePermissions `json:"transactions"`
	Budgets       ResourcePermissions `json:"budgets"`
	Goals         ResourcePermissions `json:"goals"`
	Accounts      ResourcePermissions `json:"accounts"`
	Reports       ResourcePermissions `json:"reports"`
}

// ResourcePermissions represents permissions for a specific resource
type ResourcePermissions struct {
	Read   bool `json:"read"`
	Write  bool `json:"write"`
	Delete bool `json:"delete"`
}

// RoleRequest represents a request to create a custom role
type RoleRequest struct {
	Name        string          `json:"name" binding:"required"`
	Description string          `json:"description"`
	Permissions RolePermissions `json:"permissions" binding:"required"`
}

// UpdateRoleRequest represents a request to update a user's role assignment
type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=owner admin editor viewer"`
}

// RoleResponse represents the response for a role
type RoleResponse struct {
	ID           uint            `json:"id"`
	AccountID    *uint           `json:"account_id,omitempty"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	Permissions  RolePermissions `json:"permissions"`
	IsSystemRole bool            `json:"is_system_role"`
	CreatedAt    time.Time       `json:"created_at"`
}

// UserRoleResponse represents the response for a user role assignment
type UserRoleResponse struct {
	ID         uint      `json:"id"`
	UserID     uint      `json:"user_id"`
	Username   string    `json:"username"`
	AccountID  uint      `json:"account_id"`
	RoleID     uint      `json:"role_id"`
	RoleName   string    `json:"role_name"`
	AssignedBy uint      `json:"assigned_by"`
	AssignedAt time.Time `json:"assigned_at"`
}

// TableName overrides the table name
func (Role) TableName() string {
	return "roles"
}

// TableName overrides the table name
func (UserRole) TableName() string {
	return "user_roles"
}

// TableName overrides the table name
func (PermissionAuditLog) TableName() string {
	return "permission_audit_log"
}

// GetSystemRolePermissions returns default permissions for system roles
func GetSystemRolePermissions(roleName string) RolePermissions {
	fullAccess := ResourcePermissions{Read: true, Write: true, Delete: true}
	readWrite := ResourcePermissions{Read: true, Write: true, Delete: false}
	readOnly := ResourcePermissions{Read: true, Write: false, Delete: false}

	switch roleName {
	case "owner", "admin":
		return RolePermissions{
			Transactions: fullAccess,
			Budgets:      fullAccess,
			Goals:        fullAccess,
			Accounts:     fullAccess,
			Reports:      fullAccess,
		}
	case "editor":
		return RolePermissions{
			Transactions: readWrite,
			Budgets:      readWrite,
			Goals:        readWrite,
			Accounts:     readOnly,
			Reports:      readOnly,
		}
	case "viewer":
		return RolePermissions{
			Transactions: readOnly,
			Budgets:      readOnly,
			Goals:        readOnly,
			Accounts:     readOnly,
			Reports:      readOnly,
		}
	default:
		return RolePermissions{}
	}
}
