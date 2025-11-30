package repository

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// NotificationRepository handles database operations for notifications
type NotificationRepository struct {
	db *gorm.DB
}

// NewNotificationRepository creates a new notification repository
func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

// Create creates a new notification
func (r *NotificationRepository) Create(notification *models.Notification) error {
	return r.db.Create(notification).Error
}

// GetByID gets a notification by ID
func (r *NotificationRepository) GetByID(id uint, userID uint) (*models.Notification, error) {
	var notification models.Notification
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&notification).Error
	if err != nil {
		return nil, err
	}
	return &notification, nil
}

// GetAll gets all notifications for a user
func (r *NotificationRepository) GetAll(userID uint, limit int) ([]models.Notification, error) {
	var notifications []models.Notification
	query := r.db.Where("user_id = ?", userID).
		Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&notifications).Error
	if err != nil {
		return nil, err
	}
	return notifications, nil
}

// GetUnread gets all unread notifications for a user
func (r *NotificationRepository) GetUnread(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Where("user_id = ? AND is_read = ?", userID, false).
		Order("priority DESC, created_at DESC").
		Find(&notifications).Error
	if err != nil {
		return nil, err
	}
	return notifications, nil
}

// MarkAsRead marks a notification as read
func (r *NotificationRepository) MarkAsRead(id uint, userID uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
}

// MarkAllAsRead marks all notifications as read for a user
func (r *NotificationRepository) MarkAllAsRead(userID uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
}

// Delete deletes a notification
func (r *NotificationRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Notification{}).Error
}

// DeleteExpired deletes all expired notifications
func (r *NotificationRepository) DeleteExpired() error {
	return r.db.Where("expires_at IS NOT NULL AND expires_at < ?", time.Now()).
		Delete(&models.Notification{}).Error
}

// GetSummary gets notification summary for a user
func (r *NotificationRepository) GetSummary(userID uint) (*models.NotificationSummary, error) {
	summary := &models.NotificationSummary{}
	
	// Total count
	var totalCount int64
	if err := r.db.Model(&models.Notification{}).Where("user_id = ?", userID).Count(&totalCount).Error; err != nil {
		return nil, err
	}
	summary.TotalCount = int(totalCount)
	
	// Unread count
	var unreadCount int64
	if err := r.db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount).Error; err != nil {
		return nil, err
	}
	summary.UnreadCount = int(unreadCount)
	
	// High priority unread
	var highPriority int64
	if err := r.db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ? AND priority = ?", userID, false, models.PriorityHigh).Count(&highPriority).Error; err != nil {
		return nil, err
	}
	summary.HighPriority = int(highPriority)
	
	return summary, nil
}

