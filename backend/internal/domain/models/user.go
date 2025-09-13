package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Username          string    `gorm:"uniqueIndex;not null" json:"username"`
	Email             string    `gorm:"uniqueIndex;not null" json:"email"`
	Password          string    `gorm:"not null" json:"-"` // Don't include in JSON
	FirstName         string    `json:"first_name"`
	LastName          string    `json:"last_name"`
	IsActive          bool      `gorm:"default:true" json:"is_active"`
	IsEmailVerified   bool      `gorm:"default:false" json:"is_email_verified"`
	TwoFactorEnabled  bool      `gorm:"default:false" json:"two_factor_enabled"`
	TwoFactorSecret   string    `json:"-"` // Don't include in JSON
	LastLoginAt       *time.Time `json:"last_login_at"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// UserResponse represents the user data returned in API responses
type UserResponse struct {
	ID               uint       `json:"id"`
	Username         string     `json:"username"`
	Email            string     `json:"email"`
	FirstName        string     `json:"first_name"`
	LastName         string     `json:"last_name"`
	IsActive         bool       `json:"is_active"`
	IsEmailVerified  bool       `json:"is_email_verified"`
	TwoFactorEnabled bool       `json:"two_factor_enabled"`
	LastLoginAt      *time.Time `json:"last_login_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// ToResponse converts a User to a UserResponse
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:               u.ID,
		Username:         u.Username,
		Email:            u.Email,
		FirstName:        u.FirstName,
		LastName:         u.LastName,
		IsActive:         u.IsActive,
		IsEmailVerified:  u.IsEmailVerified,
		TwoFactorEnabled: u.TwoFactorEnabled,
		LastLoginAt:      u.LastLoginAt,
		CreatedAt:        u.CreatedAt,
		UpdatedAt:        u.UpdatedAt,
	}
}
