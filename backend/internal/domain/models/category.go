package models

import (
	"time"
)

// CategoryType represents the type of category (income or expense)
type CategoryType string

const (
	CategoryTypeIncome  CategoryType = "income"
	CategoryTypeExpense CategoryType = "expense"
	CategoryTypeBoth    CategoryType = "both"
)

// Category represents a transaction category
type Category struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	UserID      uint         `gorm:"not null;index" json:"user_id"`
	Name        string       `gorm:"not null" json:"name"`
	Type        CategoryType `gorm:"not null;default:'both'" json:"type"`
	Icon        string       `json:"icon"`         // Icon identifier or emoji
	Color       string       `json:"color"`        // Hex color code
	ParentID    *uint        `json:"parent_id"`    // For subcategories
	IsSystem    bool         `gorm:"default:false" json:"is_system"` // System categories can't be deleted
	IsActive    bool         `gorm:"default:true" json:"is_active"`
	SortOrder   int          `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time    `gorm:"autoUpdateTime" json:"updated_at"`

	// Relations
	Parent      *Category   `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children    []Category  `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// CategoryResponse is the API response model
type CategoryResponse struct {
	ID        uint         `json:"id"`
	Name      string       `json:"name"`
	Type      string       `json:"type"`
	Icon      string       `json:"icon"`
	Color     string       `json:"color"`
	ParentID  *uint        `json:"parent_id"`
	IsSystem  bool         `json:"is_system"`
	IsActive  bool         `json:"is_active"`
	SortOrder int          `json:"sort_order"`
	Children  []CategoryResponse `json:"children,omitempty"`
}

// ToResponse converts a Category to CategoryResponse
func (c *Category) ToResponse() *CategoryResponse {
	response := &CategoryResponse{
		ID:        c.ID,
		Name:      c.Name,
		Type:      string(c.Type),
		Icon:      c.Icon,
		Color:     c.Color,
		ParentID:  c.ParentID,
		IsSystem:  c.IsSystem,
		IsActive:  c.IsActive,
		SortOrder: c.SortOrder,
		Children:  []CategoryResponse{},
	}

	for _, child := range c.Children {
		response.Children = append(response.Children, *child.ToResponse())
	}

	return response
}

// CreateCategoryRequest is the request model for creating a category
type CreateCategoryRequest struct {
	Name     string `json:"name" binding:"required"`
	Type     string `json:"type"`
	Icon     string `json:"icon"`
	Color    string `json:"color"`
	ParentID *uint  `json:"parent_id"`
}

// UpdateCategoryRequest is the request model for updating a category
type UpdateCategoryRequest struct {
	Name      *string `json:"name"`
	Type      *string `json:"type"`
	Icon      *string `json:"icon"`
	Color     *string `json:"color"`
	ParentID  *uint   `json:"parent_id"`
	IsActive  *bool   `json:"is_active"`
	SortOrder *int    `json:"sort_order"`
}

// DefaultCategories returns the default system categories
func DefaultCategories() []Category {
	return []Category{
		// Income categories
		{Name: "Salary", Type: CategoryTypeIncome, Icon: "💰", Color: "#10B981", IsSystem: true, SortOrder: 1},
		{Name: "Freelance", Type: CategoryTypeIncome, Icon: "💻", Color: "#3B82F6", IsSystem: true, SortOrder: 2},
		{Name: "Investments", Type: CategoryTypeIncome, Icon: "📈", Color: "#8B5CF6", IsSystem: true, SortOrder: 3},
		{Name: "Gifts", Type: CategoryTypeIncome, Icon: "🎁", Color: "#EC4899", IsSystem: true, SortOrder: 4},
		{Name: "Other Income", Type: CategoryTypeIncome, Icon: "💵", Color: "#6B7280", IsSystem: true, SortOrder: 5},

		// Expense categories
		{Name: "Food & Dining", Type: CategoryTypeExpense, Icon: "🍔", Color: "#F59E0B", IsSystem: true, SortOrder: 10},
		{Name: "Transportation", Type: CategoryTypeExpense, Icon: "🚗", Color: "#3B82F6", IsSystem: true, SortOrder: 11},
		{Name: "Shopping", Type: CategoryTypeExpense, Icon: "🛍️", Color: "#EC4899", IsSystem: true, SortOrder: 12},
		{Name: "Entertainment", Type: CategoryTypeExpense, Icon: "🎬", Color: "#8B5CF6", IsSystem: true, SortOrder: 13},
		{Name: "Bills & Utilities", Type: CategoryTypeExpense, Icon: "📱", Color: "#EF4444", IsSystem: true, SortOrder: 14},
		{Name: "Healthcare", Type: CategoryTypeExpense, Icon: "🏥", Color: "#10B981", IsSystem: true, SortOrder: 15},
		{Name: "Education", Type: CategoryTypeExpense, Icon: "📚", Color: "#6366F1", IsSystem: true, SortOrder: 16},
		{Name: "Travel", Type: CategoryTypeExpense, Icon: "✈️", Color: "#14B8A6", IsSystem: true, SortOrder: 17},
		{Name: "Personal Care", Type: CategoryTypeExpense, Icon: "💅", Color: "#F472B6", IsSystem: true, SortOrder: 18},
		{Name: "Home", Type: CategoryTypeExpense, Icon: "🏠", Color: "#84CC16", IsSystem: true, SortOrder: 19},
		{Name: "Other Expense", Type: CategoryTypeExpense, Icon: "📝", Color: "#6B7280", IsSystem: true, SortOrder: 20},
	}
}

