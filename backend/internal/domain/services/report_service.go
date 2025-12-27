package services

import (
	"errors"
	"github.com/yourusername/finance-management/internal/domain/models"
	"github.com/yourusername/finance-management/internal/repository"
	"time"
)

// ReportService handles report business logic
type ReportService struct {
	reportRepo *repository.ReportRepository
}

// NewReportService creates a new report service
func NewReportService(reportRepo *repository.ReportRepository) *ReportService {
	return &ReportService{
		reportRepo: reportRepo,
	}
}

// CreateReport creates a new report definition
func (s *ReportService) CreateReport(userID uint, req *models.CreateReportRequest) (*models.Report, error) {
	// Validate report type
	validTypes := map[string]bool{
		"monthly": true,
		"yearly":  true,
		"custom":  true,
		"tax":     true,
	}

	if !validTypes[req.ReportType] {
		return nil, errors.New("invalid report type")
	}

	// Validate schedule if provided
	if req.Schedule != nil {
		validSchedules := map[string]bool{
			"daily":   true,
			"weekly":  true,
			"monthly": true,
		}
		if !validSchedules[*req.Schedule] {
			return nil, errors.New("invalid schedule")
		}
	}

	report := &models.Report{
		UserID:     userID,
		Name:       req.Name,
		ReportType: req.ReportType,
		Parameters: req.Parameters,
		Schedule:   req.Schedule,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	err := s.reportRepo.Create(report)
	return report, err
}

// GetReport retrieves a report by ID
func (s *ReportService) GetReport(id, userID uint) (*models.Report, error) {
	return s.reportRepo.GetByID(id, userID)
}

// ListReports lists all reports for a user with pagination
func (s *ReportService) ListReports(userID uint, page, pageSize int) (*models.ReportListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	reports, total, err := s.reportRepo.GetByUserID(userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	return &models.ReportListResponse{
		Reports: reports,
		Total:   total,
		Page:    page,
		PerPage: pageSize,
	}, nil
}

// UpdateReport updates a report
func (s *ReportService) UpdateReport(id, userID uint, req *models.UpdateReportRequest) (*models.Report, error) {
	report, err := s.reportRepo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Name != nil {
		report.Name = *req.Name
	}
	if req.Parameters != nil {
		report.Parameters = *req.Parameters
	}
	if req.Schedule != nil {
		report.Schedule = req.Schedule
	}

	report.UpdatedAt = time.Now()

	err = s.reportRepo.Update(report)
	return report, err
}

// DeleteReport deletes a report
func (s *ReportService) DeleteReport(id, userID uint) error {
	return s.reportRepo.Delete(id, userID)
}

// GenerateReport generates a report (creates execution record)
func (s *ReportService) GenerateReport(reportID, userID uint, format string) (*models.ReportExecution, error) {
	// Verify report belongs to user
	report, err := s.reportRepo.GetByID(reportID, userID)
	if err != nil {
		return nil, err
	}

	// Create execution record
	execution := &models.ReportExecution{
		ReportID:   report.ID,
		Status:     "pending",
		ExecutedAt: time.Now(),
	}

	err = s.reportRepo.CreateExecution(execution)
	if err != nil {
		return nil, err
	}

	// NOTE: Actual report generation would be done asynchronously
	// by calling the analytics service Python endpoint
	// This is a placeholder for the execution record

	return execution, nil
}

// UpdateExecution updates a report execution status
func (s *ReportService) UpdateExecution(execution *models.ReportExecution) error {
	return s.reportRepo.UpdateExecution(execution)
}
