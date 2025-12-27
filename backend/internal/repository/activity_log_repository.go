package repository

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// ActivityLogRepository handles database operations for activity logs
type ActivityLogRepository struct {
	db *gorm.DB
}

// NewActivityLogRepository creates a new activity log repository
func NewActivityLogRepository(db *gorm.DB) *ActivityLogRepository {
	return &ActivityLogRepository{db: db}
}

// Create creates a new activity log entry
func (r *ActivityLogRepository) Create(log *models.ActivityLog) error {
	return r.db.Create(log).Error
}

// GetByID gets an activity log by ID
func (r *ActivityLogRepository) GetByID(id uint) (*models.ActivityLog, error) {
	var log models.ActivityLog
	err := r.db.Preload("User").Preload("Account").
		Where("id = ?", id).First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// GetByAccount gets all activity logs for an account
func (r *ActivityLogRepository) GetByAccount(accountID uint, limit int) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	query := r.db.Preload("User").
		Where("account_id = ?", accountID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&logs).Error
	return logs, err
}

// GetByUser gets all activity logs for a user
func (r *ActivityLogRepository) GetByUser(userID uint, limit int) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	query := r.db.Preload("Account").
		Where("user_id = ?", userID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&logs).Error
	return logs, err
}

// GetByAccountAndDateRange gets activity logs for an account within a date range
func (r *ActivityLogRepository) GetByAccountAndDateRange(accountID uint, startDate, endDate time.Time) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	err := r.db.Preload("User").
		Where("account_id = ? AND created_at BETWEEN ? AND ?", accountID, startDate, endDate).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}

// GetByEntity gets activity logs for a specific entity
func (r *ActivityLogRepository) GetByEntity(entityType string, entityID uint) ([]models.ActivityLog, error) {
	var logs []models.ActivityLog
	err := r.db.Preload("User").Preload("Account").
		Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}

// DeleteOldLogs deletes activity logs older than a specified date
func (r *ActivityLogRepository) DeleteOldLogs(beforeDate time.Time) error {
	return r.db.Where("created_at < ?", beforeDate).Delete(&models.ActivityLog{}).Error
}
