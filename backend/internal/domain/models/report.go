package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// Report represents a custom report definition
type Report struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	UserID          uint           `gorm:"not null;index" json:"user_id"`
	Name            string         `gorm:"type:varchar(255);not null" json:"name"`
	ReportType      string         `gorm:"type:varchar(50);not null" json:"report_type"` // monthly, yearly, custom, tax
	Parameters      ReportParams   `gorm:"type:jsonb" json:"parameters"`
	Schedule        *string        `gorm:"type:varchar(50)" json:"schedule"` // daily, weekly, monthly, null
	LastGeneratedAt *time.Time     `json:"last_generated_at"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`

	// Associations
	User       User              `gorm:"foreignKey:UserID" json:"-"`
	Executions []ReportExecution `gorm:"foreignKey:ReportID" json:"executions,omitempty"`
}

// ReportParams represents report parameters stored as JSONB
type ReportParams struct {
	StartDate  *string  `json:"start_date,omitempty"`
	EndDate    *string  `json:"end_date,omitempty"`
	Categories []string `json:"categories,omitempty"`
	Accounts   []uint   `json:"accounts,omitempty"`
	Format     string   `json:"format,omitempty"` // pdf, excel
}

// Scan implements sql.Scanner interface for ReportParams
func (rp *ReportParams) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan ReportParams")
	}

	return json.Unmarshal(bytes, rp)
}

// Value implements driver.Valuer interface for ReportParams
func (rp ReportParams) Value() (driver.Value, error) {
	return json.Marshal(rp)
}

// ReportExecution represents a report generation execution
type ReportExecution struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ReportID   uint      `gorm:"not null;index" json:"report_id"`
	Status     string    `gorm:"type:varchar(50);not null" json:"status"` // pending, success, failed
	FilePath   *string   `gorm:"type:varchar(500)" json:"file_path"`
	ErrorMsg   *string   `gorm:"type:text" json:"error_msg,omitempty"`
	ExecutedAt time.Time `json:"executed_at"`

	// Associations
	Report Report `gorm:"foreignKey:ReportID" json:"-"`
}

// TableName overrides the table name
func (Report) TableName() string {
	return "reports"
}

// TableName overrides the table name
func (ReportExecution) TableName() string {
	return "report_executions"
}

// CreateReportRequest represents the request to create a report
type CreateReportRequest struct {
	Name       string       `json:"name" binding:"required"`
	ReportType string       `json:"report_type" binding:"required,oneof=monthly yearly custom tax"`
	Parameters ReportParams `json:"parameters"`
	Schedule   *string      `json:"schedule,omitempty"`
}

// UpdateReportRequest represents the request to update a report
type UpdateReportRequest struct {
	Name       *string       `json:"name,omitempty"`
	Parameters *ReportParams `json:"parameters,omitempty"`
	Schedule   *string       `json:"schedule,omitempty"`
}

// GenerateReportRequest represents the request to generate a report
type GenerateReportRequest struct {
	Format string `json:"format" binding:"required,oneof=pdf excel"`
}

// ReportListResponse represents paginated report list
type ReportListResponse struct {
	Reports []Report `json:"reports"`
	Total   int64    `json:"total"`
	Page    int      `json:"page"`
	PerPage int      `json:"per_page"`
}
