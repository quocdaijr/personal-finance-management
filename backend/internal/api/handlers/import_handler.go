package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/services"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
)

// ImportHandler handles data import requests
type ImportHandler struct {
	importService *services.ImportService
}

// NewImportHandler creates a new import handler
func NewImportHandler(importService *services.ImportService) *ImportHandler {
	return &ImportHandler{
		importService: importService,
	}
}

// ImportTransactionsCSV handles importing transactions from a CSV file
func (h *ImportHandler) ImportTransactionsCSV(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get the uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Check file extension
	if file.Filename[len(file.Filename)-4:] != ".csv" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only CSV files are allowed"})
		return
	}

	// Check file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size too large (max 5MB)"})
		return
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}
	defer src.Close()

	// Import transactions
	result, err := h.importService.ImportTransactionsCSV(userID, src)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Import completed",
		"result":  result,
	})
}

// GetImportTemplate returns a sample CSV template
func (h *ImportHandler) GetImportTemplate(c *gin.Context) {
	template := `date,amount,type,category,description,account,tags
2024-01-15,1500.00,income,Salary,Monthly salary,Main Account,work
2024-01-16,50.00,expense,Food & Dining,Lunch with colleagues,Main Account,food
2024-01-17,120.00,expense,Transportation,Gas,Main Account,car
2024-01-18,200.00,expense,Shopping,Groceries,Main Account,grocery
2024-01-19,80.00,expense,Entertainment,Movie tickets,Main Account,entertainment`

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=import_template.csv")
	c.String(http.StatusOK, template)
}

