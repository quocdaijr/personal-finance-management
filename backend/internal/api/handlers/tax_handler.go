package handlers

import (
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/finance-management/internal/domain/models"
	"github.com/yourusername/finance-management/internal/domain/services"
)

// TaxHandler handles tax-related HTTP requests
type TaxHandler struct {
	taxService *services.TaxService
}

// NewTaxHandler creates a new tax handler
func NewTaxHandler(taxService *services.TaxService) *TaxHandler {
	return &TaxHandler{
		taxService: taxService,
	}
}

// CreateCategory creates a new tax category
// @Summary Create a tax category
// @Tags Tax
// @Accept json
// @Produce json
// @Param category body models.CreateTaxCategoryRequest true "Tax category details"
// @Success 201 {object} models.TaxCategory
// @Router /api/tax/categories [post]
func (h *TaxHandler) CreateCategory(c *gin.Context) {
	var req models.CreateTaxCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	category, err := h.taxService.CreateCategory(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// GetCategory retrieves a tax category by ID
// @Summary Get a tax category
// @Tags Tax
// @Produce json
// @Param id path int true "Tax Category ID"
// @Success 200 {object} models.TaxCategory
// @Router /api/tax/categories/{id} [get]
func (h *TaxHandler) GetCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	userID, _ := c.Get("user_id")

	category, err := h.taxService.GetCategory(uint(id), userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tax category not found"})
		return
	}

	c.JSON(http.StatusOK, category)
}

// ListCategories lists all tax categories for the authenticated user
// @Summary List tax categories
// @Tags Tax
// @Produce json
// @Success 200 {array} models.TaxCategory
// @Router /api/tax/categories [get]
func (h *TaxHandler) ListCategories(c *gin.Context) {
	userID, _ := c.Get("user_id")

	categories, err := h.taxService.ListCategories(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// UpdateCategory updates a tax category
// @Summary Update a tax category
// @Tags Tax
// @Accept json
// @Produce json
// @Param id path int true "Tax Category ID"
// @Param category body models.UpdateTaxCategoryRequest true "Updated category details"
// @Success 200 {object} models.TaxCategory
// @Router /api/tax/categories/{id} [put]
func (h *TaxHandler) UpdateCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	var req models.UpdateTaxCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	category, err := h.taxService.UpdateCategory(uint(id), userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, category)
}

// DeleteCategory deletes a tax category
// @Summary Delete a tax category
// @Tags Tax
// @Param id path int true "Tax Category ID"
// @Success 200 {object} map[string]string
// @Router /api/tax/categories/{id} [delete]
func (h *TaxHandler) DeleteCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	userID, _ := c.Get("user_id")

	err = h.taxService.DeleteCategory(uint(id), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tax category deleted successfully"})
}

// GetTaxReport generates an annual tax report
// @Summary Get annual tax report
// @Tags Tax
// @Produce json
// @Param year query int true "Tax year"
// @Success 200 {object} models.TaxReportResponse
// @Router /api/tax/report [get]
func (h *TaxHandler) GetTaxReport(c *gin.Context) {
	yearStr := c.Query("year")
	if yearStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Year parameter is required"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	report, err := h.taxService.GetTaxReport(userID.(uint), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// ExportTaxData exports tax data for the year
// @Summary Export tax data
// @Tags Tax
// @Produce text/csv
// @Param year query int true "Tax year"
// @Success 200 {file} binary
// @Router /api/tax/export [get]
func (h *TaxHandler) ExportTaxData(c *gin.Context) {
	yearStr := c.Query("year")
	if yearStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Year parameter is required"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	report, err := h.taxService.GetTaxReport(userID.(uint), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Generate CSV with proper escaping to prevent CSV injection
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=tax_report_"+yearStr+".csv")

	// Create CSV writer which properly escapes special characters
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Write CSV header
	header := []string{"Date", "Description", "Category", "Tax Category", "Tax Type", "Amount"}
	if err := writer.Write(header); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV header"})
		return
	}

	// Write transactions with proper CSV escaping
	for _, txn := range report.Transactions {
		record := []string{
			txn.Date,
			txn.Description,
			txn.Category,
			txn.TaxCategoryName,
			txn.TaxType,
			strconv.FormatFloat(txn.Amount, 'f', 2, 64),
		}
		if err := writer.Write(record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV record"})
			return
		}
	}
}
