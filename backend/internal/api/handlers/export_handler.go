package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/services"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
)

// ExportHandler handles HTTP requests for data export
type ExportHandler struct {
	exportService *services.ExportService
}

// NewExportHandler creates a new export handler
func NewExportHandler(exportService *services.ExportService) *ExportHandler {
	return &ExportHandler{
		exportService: exportService,
	}
}

// ExportTransactionsCSV exports transactions to CSV
func (h *ExportHandler) ExportTransactionsCSV(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse optional date filters
	var startDate, endDate *time.Time

	if startStr := c.Query("start_date"); startStr != "" {
		if t, err := time.Parse("2006-01-02", startStr); err == nil {
			startDate = &t
		}
	}

	if endStr := c.Query("end_date"); endStr != "" {
		if t, err := time.Parse("2006-01-02", endStr); err == nil {
			endDate = &t
		}
	}

	// Export transactions
	data, err := h.exportService.ExportTransactionsCSV(userID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export transactions"})
		return
	}

	// Generate filename with current date
	filename := fmt.Sprintf("transactions_%s.csv", time.Now().Format("2006-01-02"))

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Length", fmt.Sprintf("%d", len(data)))

	c.Data(http.StatusOK, "text/csv", data)
}

// ExportTransactionsJSON exports transactions to JSON
func (h *ExportHandler) ExportTransactionsJSON(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse optional date filters
	var startDate, endDate *time.Time

	if startStr := c.Query("start_date"); startStr != "" {
		if t, err := time.Parse("2006-01-02", startStr); err == nil {
			startDate = &t
		}
	}

	if endStr := c.Query("end_date"); endStr != "" {
		if t, err := time.Parse("2006-01-02", endStr); err == nil {
			endDate = &t
		}
	}

	// Export transactions
	data, err := h.exportService.ExportTransactionsJSON(userID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export transactions"})
		return
	}

	// Generate filename with current date
	filename := fmt.Sprintf("transactions_%s.json", time.Now().Format("2006-01-02"))

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "application/json")
	c.Header("Content-Length", fmt.Sprintf("%d", len(data)))

	c.Data(http.StatusOK, "application/json", data)
}

// ExportAccountsCSV exports accounts to CSV
func (h *ExportHandler) ExportAccountsCSV(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Export accounts
	data, err := h.exportService.ExportAccountsCSV(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export accounts"})
		return
	}

	// Generate filename with current date
	filename := fmt.Sprintf("accounts_%s.csv", time.Now().Format("2006-01-02"))

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Length", fmt.Sprintf("%d", len(data)))

	c.Data(http.StatusOK, "text/csv", data)
}

