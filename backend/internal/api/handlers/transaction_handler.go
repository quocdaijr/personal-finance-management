package handlers

import (
	"net/http"
	"strconv"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// TransactionHandler handles HTTP requests for transactions
type TransactionHandler struct {
	transactionService *services.TransactionService
}

// NewTransactionHandler creates a new transaction handler
func NewTransactionHandler(transactionService *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		transactionService: transactionService,
	}
}

// Create handles the creation of a new transaction
func (h *TransactionHandler) Create(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Bind request body
	var req models.TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create transaction
	transaction, err := h.transactionService.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	c.JSON(http.StatusCreated, transaction.ToResponse())
}

// GetByID handles getting a transaction by ID
func (h *TransactionHandler) GetByID(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get transaction ID from URL
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// Get transaction
	transaction, err := h.transactionService.GetByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	// Return response
	c.JSON(http.StatusOK, transaction.ToResponse())
}

// GetAll handles getting all transactions for a user
func (h *TransactionHandler) GetAll(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get transactions
	transactions, err := h.transactionService.GetAll(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response models
	var response []*models.TransactionResponse
	for _, t := range transactions {
		response = append(response, t.ToResponse())
	}

	// Return response
	c.JSON(http.StatusOK, response)
}

// Update handles updating a transaction
func (h *TransactionHandler) Update(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get transaction ID from URL
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// Bind request body
	var req models.TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update transaction
	transaction, err := h.transactionService.Update(uint(id), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	c.JSON(http.StatusOK, transaction.ToResponse())
}

// Delete handles deleting a transaction
func (h *TransactionHandler) Delete(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get transaction ID from URL
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// Delete transaction
	if err := h.transactionService.Delete(uint(id), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetCategories handles getting all transaction categories
func (h *TransactionHandler) GetCategories(c *gin.Context) {
	// Get categories
	categories := h.transactionService.GetCategories()

	// Return response
	c.JSON(http.StatusOK, categories)
}

// GetSummary handles getting a summary of transactions for a specific period
func (h *TransactionHandler) GetSummary(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get period from query parameter
	period := c.DefaultQuery("period", "month")

	// Get summary
	summary, err := h.transactionService.GetSummary(userID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	c.JSON(http.StatusOK, summary)
}
