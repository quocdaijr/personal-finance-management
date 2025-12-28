package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// PermissionAuditLogRepository handles database operations for permission audit logs
type PermissionAuditLogRepository struct {
	db *gorm.DB
}

// NewPermissionAuditLogRepository creates a new permission audit log repository
func NewPermissionAuditLogRepository(db *gorm.DB) *PermissionAuditLogRepository {
	return &PermissionAuditLogRepository{db: db}
}

// Create creates a new permission audit log entry
func (r *PermissionAuditLogRepository) Create(log *models.PermissionAuditLog) error {
	return r.db.Create(log).Error
}

// GetByID gets a permission audit log entry by ID
func (r *PermissionAuditLogRepository) GetByID(id uint) (*models.PermissionAuditLog, error) {
	var log models.PermissionAuditLog
	err := r.db.Preload("User").Where("id = ?", id).First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// GetByUserID gets all permission audit logs for a user
func (r *PermissionAuditLogRepository) GetByUserID(userID uint) ([]models.PermissionAuditLog, error) {
	var logs []models.PermissionAuditLog
	err := r.db.Preload("User").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}

// GetByResourceID gets all permission audit logs for a resource
func (r *PermissionAuditLogRepository) GetByResourceID(resourceType string, resourceID uint) ([]models.PermissionAuditLog, error) {
	var logs []models.PermissionAuditLog
	err := r.db.Preload("User").
		Where("resource_type = ? AND resource_id = ?", resourceType, resourceID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}

// Delete deletes a permission audit log entry
func (r *PermissionAuditLogRepository) Delete(id uint) error {
	return r.db.Where("id = ?", id).Delete(&models.PermissionAuditLog{}).Error
}
