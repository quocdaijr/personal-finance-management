package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
)

// BalanceHistoryHandler handles HTTP requests for balance history
type BalanceHistoryHandler struct {
	balanceHistoryRepo *repository.BalanceHistoryRepository
	accountRepo        *repository.AccountRepository
}

// NewBalanceHistoryHandler creates a new balance history handler
func NewBalanceHistoryHandler(
	balanceHistoryRepo *repository.BalanceHistoryRepository,
	accountRepo *repository.AccountRepository,
) *BalanceHistoryHandler {
	return &BalanceHistoryHandler{
		balanceHistoryRepo: balanceHistoryRepo,
		accountRepo:        accountRepo,
	}
}

// GetAccountHistory gets balance history for an account
func (h *BalanceHistoryHandler) GetAccountHistory(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	accountID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	// Verify account belongs to user
	account, err := h.accountRepo.GetByID(uint(accountID), userID)
	if err != nil || account == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}

	limit := 100
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	history, err := h.balanceHistoryRepo.GetByAccountID(userID, uint(accountID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []interface{}
	for _, h := range history {
		response = append(response, h.ToResponse())
	}

	c.JSON(http.StatusOK, response)
}

// GetDailyBalances gets daily balances for an account
func (h *BalanceHistoryHandler) GetDailyBalances(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	accountID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	// Verify account belongs to user
	account, err := h.accountRepo.GetByID(uint(accountID), userID)
	if err != nil || account == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}

	days := 30
	if daysStr := c.Query("days"); daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
			days = d
		}
	}

	balances, err := h.balanceHistoryRepo.GetDailyBalances(userID, uint(accountID), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, balances)
}

// GetOverallTrend gets the overall balance trend across all accounts
func (h *BalanceHistoryHandler) GetOverallTrend(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	days := 30
	if daysStr := c.Query("days"); daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
			days = d
		}
	}

	balances, err := h.balanceHistoryRepo.GetAllAccountsDailyBalances(userID, days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, balances)
}

