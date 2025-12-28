package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
)

// ReportHandler handles report-related HTTP requests
type ReportHandler struct {
	reportService *services.ReportService
}

// NewReportHandler creates a new report handler
func NewReportHandler(reportService *services.ReportService) *ReportHandler {
	return &ReportHandler{
		reportService: reportService,
	}
}

// CreateReport creates a new report definition
// @Summary Create a new report
// @Tags Reports
// @Accept json
// @Produce json
// @Param report body models.CreateReportRequest true "Report details"
// @Success 201 {object} models.Report
// @Router /api/reports [post]
func (h *ReportHandler) CreateReport(c *gin.Context) {
	var req models.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	report, err := h.reportService.CreateReport(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, report)
}

// GetReport retrieves a report by ID
// @Summary Get a report
// @Tags Reports
// @Produce json
// @Param id path int true "Report ID"
// @Success 200 {object} models.Report
// @Router /api/reports/{id} [get]
func (h *ReportHandler) GetReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	userID, _ := c.Get("user_id")

	report, err := h.reportService.GetReport(uint(id), userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

// ListReports lists all reports for the authenticated user
// @Summary List reports
// @Tags Reports
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} models.ReportListResponse
// @Router /api/reports [get]
func (h *ReportHandler) ListReports(c *gin.Context) {
	userID, _ := c.Get("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	response, err := h.reportService.ListReports(userID.(uint), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// UpdateReport updates a report
// @Summary Update a report
// @Tags Reports
// @Accept json
// @Produce json
// @Param id path int true "Report ID"
// @Param report body models.UpdateReportRequest true "Updated report details"
// @Success 200 {object} models.Report
// @Router /api/reports/{id} [put]
func (h *ReportHandler) UpdateReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	var req models.UpdateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	report, err := h.reportService.UpdateReport(uint(id), userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// DeleteReport deletes a report
// @Summary Delete a report
// @Tags Reports
// @Param id path int true "Report ID"
// @Success 200 {object} map[string]string
// @Router /api/reports/{id} [delete]
func (h *ReportHandler) DeleteReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	userID, _ := c.Get("user_id")

	err = h.reportService.DeleteReport(uint(id), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report deleted successfully"})
}

// GenerateReport generates a report on-demand
// @Summary Generate a report
// @Tags Reports
// @Accept json
// @Produce json
// @Param id path int true "Report ID"
// @Param request body models.GenerateReportRequest true "Generation parameters"
// @Success 200 {object} models.ReportExecution
// @Router /api/reports/{id}/generate [post]
func (h *ReportHandler) GenerateReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	var req models.GenerateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	execution, err := h.reportService.GenerateReport(uint(id), userID.(uint), req.Format)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, execution)
}

// DownloadReport downloads a generated report
// @Summary Download a report
// @Tags Reports
// @Produce application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Param id path int true "Report ID"
// @Param execution_id path int true "Execution ID"
// @Success 200 {file} binary
// @Router /api/reports/{id}/download/{execution_id} [get]
func (h *ReportHandler) DownloadReport(c *gin.Context) {
	// This would serve the actual file from storage
	// Implementation would depend on where reports are stored
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Download functionality to be implemented"})
}
