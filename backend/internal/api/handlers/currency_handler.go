package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
)

// CurrencyHandler handles HTTP requests for currencies
type CurrencyHandler struct{}

// NewCurrencyHandler creates a new currency handler
func NewCurrencyHandler() *CurrencyHandler {
	return &CurrencyHandler{}
}

// GetAll returns all supported currencies
func (h *CurrencyHandler) GetAll(c *gin.Context) {
	currencies := models.SupportedCurrencies()
	c.JSON(http.StatusOK, currencies)
}

// GetByCode returns a currency by its code
func (h *CurrencyHandler) GetByCode(c *gin.Context) {
	code := c.Param("code")
	currency := models.GetCurrencyByCode(code)
	
	if currency == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Currency not found"})
		return
	}
	
	c.JSON(http.StatusOK, currency)
}

// Convert handles currency conversion
func (h *CurrencyHandler) Convert(c *gin.Context) {
	amountStr := c.Query("amount")
	from := c.Query("from")
	to := c.Query("to")
	
	if amountStr == "" || from == "" || to == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount, from, and to parameters are required"})
		return
	}
	
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}
	
	converted := models.ConvertAmount(amount, from, to)
	
	c.JSON(http.StatusOK, gin.H{
		"original_amount":   amount,
		"original_currency": from,
		"converted_amount":  converted,
		"target_currency":   to,
	})
}

