package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// ReportRepository handles report data access
type ReportRepository struct {
	db *gorm.DB
}

// NewReportRepository creates a new report repository
func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// Create creates a new report
func (r *ReportRepository) Create(report *models.Report) error {
	return r.db.Create(report).Error
}

// GetByID retrieves a report by ID
func (r *ReportRepository) GetByID(id, userID uint) (*models.Report, error) {
	var report models.Report
	err := r.db.Where("id = ? AND user_id = ?", id, userID).
		Preload("Executions").
		First(&report).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

// GetByUserID retrieves all reports for a user
func (r *ReportRepository) GetByUserID(userID uint, page, pageSize int) ([]models.Report, int64, error) {
	var reports []models.Report
	var total int64

	offset := (page - 1) * pageSize

	// Count total
	if err := r.db.Model(&models.Report{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&reports).Error

	return reports, total, err
}

// Update updates a report
func (r *ReportRepository) Update(report *models.Report) error {
	return r.db.Save(report).Error
}

// Delete deletes a report
func (r *ReportRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Report{}).Error
}

// CreateExecution creates a report execution record
func (r *ReportRepository) CreateExecution(execution *models.ReportExecution) error {
	return r.db.Create(execution).Error
}

// UpdateExecution updates a report execution
func (r *ReportRepository) UpdateExecution(execution *models.ReportExecution) error {
	return r.db.Save(execution).Error
}

// GetExecutionsByReportID gets all executions for a report
func (r *ReportRepository) GetExecutionsByReportID(reportID uint) ([]models.ReportExecution, error) {
	var executions []models.ReportExecution
	err := r.db.Where("report_id = ?", reportID).
		Order("executed_at DESC").
		Find(&executions).Error
	return executions, err
}
