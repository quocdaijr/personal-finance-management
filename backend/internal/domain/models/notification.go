package models

import (
	"time"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeBudgetAlert    NotificationType = "budget_alert"
	NotificationTypeGoalReminder   NotificationType = "goal_reminder"
	NotificationTypeRecurringDue   NotificationType = "recurring_due"
	NotificationTypeBillReminder   NotificationType = "bill_reminder"
	NotificationTypeSystemMessage  NotificationType = "system_message"
	NotificationTypeAchievement    NotificationType = "achievement"
)

// NotificationPriority represents the priority level
type NotificationPriority string

const (
	PriorityLow    NotificationPriority = "low"
	PriorityMedium NotificationPriority = "medium"
	PriorityHigh   NotificationPriority = "high"
)

// Notification represents a user notification
type Notification struct {
	ID          uint                 `gorm:"primaryKey" json:"id"`
	UserID      uint                 `gorm:"not null;index" json:"user_id"`
	Type        NotificationType     `gorm:"not null" json:"type"`
	Title       string               `gorm:"not null" json:"title"`
	Message     string               `gorm:"not null" json:"message"`
	Priority    NotificationPriority `gorm:"default:'medium'" json:"priority"`
	IsRead      bool                 `gorm:"default:false" json:"is_read"`
	ReadAt      *time.Time           `json:"read_at"`
	ActionURL   string               `json:"action_url"`    // Link to related resource
	RelatedID   *uint                `json:"related_id"`    // ID of related entity (budget, goal, etc.)
	RelatedType string               `json:"related_type"`  // Type of related entity
	ExpiresAt   *time.Time           `json:"expires_at"`    // When notification should be dismissed
	CreatedAt   time.Time            `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time            `gorm:"autoUpdateTime" json:"updated_at"`
}

// NotificationResponse is the API response model
type NotificationResponse struct {
	ID          uint      `json:"id"`
	Type        string    `json:"type"`
	Title       string    `json:"title"`
	Message     string    `json:"message"`
	Priority    string    `json:"priority"`
	IsRead      bool      `json:"is_read"`
	ReadAt      *time.Time `json:"read_at"`
	ActionURL   string    `json:"action_url"`
	RelatedID   *uint     `json:"related_id"`
	RelatedType string    `json:"related_type"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToResponse converts a Notification to NotificationResponse
func (n *Notification) ToResponse() *NotificationResponse {
	return &NotificationResponse{
		ID:          n.ID,
		Type:        string(n.Type),
		Title:       n.Title,
		Message:     n.Message,
		Priority:    string(n.Priority),
		IsRead:      n.IsRead,
		ReadAt:      n.ReadAt,
		ActionURL:   n.ActionURL,
		RelatedID:   n.RelatedID,
		RelatedType: n.RelatedType,
		CreatedAt:   n.CreatedAt,
	}
}

// NotificationSummary provides an overview of user notifications
type NotificationSummary struct {
	TotalCount   int `json:"total_count"`
	UnreadCount  int `json:"unread_count"`
	HighPriority int `json:"high_priority"`
}

