package models

import (
	"time"
)

// Household represents a family or group of users sharing budgets
type Household struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	CreatedBy uint      `gorm:"not null" json:"created_by"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Creator *User              `gorm:"foreignKey:CreatedBy" json:"-"`
	Members []HouseholdMember  `gorm:"foreignKey:HouseholdID" json:"members,omitempty"`
}

// HouseholdMember represents a member of a household
type HouseholdMember struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	HouseholdID        uint      `gorm:"not null;index:idx_household_members_household_id" json:"household_id"`
	UserID             uint      `gorm:"not null;index:idx_household_members_user_id" json:"user_id"`
	Relationship       string    `gorm:"not null" json:"relationship"` // parent, child, spouse, other
	IsDependent        bool      `gorm:"default:false" json:"is_dependent"`
	AllowanceAmount    float64   `json:"allowance_amount"`
	AllowanceFrequency string    `json:"allowance_frequency"` // weekly, monthly
	CreatedAt          time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Household *Household `gorm:"foreignKey:HouseholdID" json:"-"`
	User      *User      `gorm:"foreignKey:UserID" json:"-"`
}

// HouseholdRequest represents a request to create a household
type HouseholdRequest struct {
	Name string `json:"name" binding:"required"`
}

// HouseholdMemberRequest represents a request to add a household member
type HouseholdMemberRequest struct {
	UserID             uint    `json:"user_id" binding:"required"`
	Relationship       string  `json:"relationship" binding:"required,oneof=parent child spouse other"`
	IsDependent        bool    `json:"is_dependent"`
	AllowanceAmount    float64 `json:"allowance_amount"`
	AllowanceFrequency string  `json:"allowance_frequency" binding:"omitempty,oneof=daily weekly monthly yearly"`
}

// HouseholdResponse represents the response for a household
type HouseholdResponse struct {
	ID        uint                        `json:"id"`
	Name      string                      `json:"name"`
	CreatedBy uint                        `json:"created_by"`
	Members   []HouseholdMemberResponse   `json:"members,omitempty"`
	CreatedAt time.Time                   `json:"created_at"`
}

// HouseholdMemberResponse represents the response for a household member
type HouseholdMemberResponse struct {
	ID                 uint      `json:"id"`
	HouseholdID        uint      `json:"household_id"`
	UserID             uint      `json:"user_id"`
	Username           string    `json:"username"`
	Email              string    `json:"email"`
	Relationship       string    `json:"relationship"`
	IsDependent        bool      `json:"is_dependent"`
	AllowanceAmount    float64   `json:"allowance_amount,omitempty"`
	AllowanceFrequency string    `json:"allowance_frequency,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
}

// TableName overrides the table name
func (Household) TableName() string {
	return "households"
}

// TableName overrides the table name
func (HouseholdMember) TableName() string {
	return "household_members"
}
