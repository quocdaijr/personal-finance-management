package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
)

// HouseholdHandler handles household-related HTTP requests
type HouseholdHandler struct {
	householdService *services.HouseholdService
}

// NewHouseholdHandler creates a new household handler
func NewHouseholdHandler(householdService *services.HouseholdService) *HouseholdHandler {
	return &HouseholdHandler{
		householdService: householdService,
	}
}

// CreateHousehold creates a new household
// @Summary Create a household
// @Tags Households
// @Accept json
// @Produce json
// @Param household body models.HouseholdRequest true "Household details"
// @Success 201 {object} models.Household
// @Router /api/households [post]
func (h *HouseholdHandler) CreateHousehold(c *gin.Context) {
	var req models.HouseholdRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	household, err := h.householdService.CreateHousehold(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, household)
}

// GetHouseholds gets all households for the authenticated user
// @Summary List user's households
// @Tags Households
// @Produce json
// @Success 200 {array} models.HouseholdResponse
// @Router /api/households [get]
func (h *HouseholdHandler) GetHouseholds(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	households, err := h.householdService.GetHouseholds(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, households)
}

// GetHousehold gets a specific household by ID
// @Summary Get a household
// @Tags Households
// @Produce json
// @Param id path int true "Household ID"
// @Success 200 {object} models.HouseholdResponse
// @Router /api/households/{id} [get]
func (h *HouseholdHandler) GetHousehold(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid household ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	household, err := h.householdService.GetHousehold(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, household)
}

// AddMember adds a member to a household
// @Summary Add household member
// @Tags Households
// @Accept json
// @Produce json
// @Param id path int true "Household ID"
// @Param member body models.HouseholdMemberRequest true "Member details"
// @Success 201 {object} models.HouseholdMember
// @Router /api/households/{id}/members [post]
func (h *HouseholdHandler) AddMember(c *gin.Context) {
	householdID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid household ID"})
		return
	}

	var req models.HouseholdMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	member, err := h.householdService.AddMember(uint(householdID), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, member)
}

// UpdateAllowance updates a member's allowance
// @Summary Update member allowance
// @Tags Households
// @Accept json
// @Produce json
// @Param id path int true "Household ID"
// @Param memberId path int true "Member ID"
// @Param allowance body models.UpdateAllowanceRequest true "Allowance details"
// @Success 200 {object} map[string]string
// @Router /api/households/{id}/members/{memberId}/allowance [put]
func (h *HouseholdHandler) UpdateAllowance(c *gin.Context) {
	householdID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid household ID"})
		return
	}

	memberID, err := strconv.ParseUint(c.Param("memberId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	var req models.UpdateAllowanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.householdService.UpdateAllowance(uint(householdID), uint(memberID), userID, req.Amount, req.Frequency)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Allowance updated successfully"})
}

// RemoveMember removes a member from a household
// @Summary Remove household member
// @Tags Households
// @Param id path int true "Household ID"
// @Param memberId path int true "Member ID"
// @Success 200 {object} map[string]string
// @Router /api/households/{id}/members/{memberId} [delete]
func (h *HouseholdHandler) RemoveMember(c *gin.Context) {
	householdID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid household ID"})
		return
	}

	memberID, err := strconv.ParseUint(c.Param("memberId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.householdService.RemoveMember(uint(householdID), uint(memberID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}

// GetHouseholdBudgets gets all budgets for a household
// @Summary Get household budgets
// @Tags Households
// @Produce json
// @Param id path int true "Household ID"
// @Success 200 {array} models.Budget
// @Router /api/households/{id}/budgets [get]
func (h *HouseholdHandler) GetHouseholdBudgets(c *gin.Context) {
	householdID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid household ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	budgets, err := h.householdService.GetHouseholdBudgets(uint(householdID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, budgets)
}

// GetHouseholdGoals gets all goals for a household
// @Summary Get household goals
// @Tags Households
// @Produce json
// @Param id path int true "Household ID"
// @Success 200 {array} models.Goal
// @Router /api/households/{id}/goals [get]
func (h *HouseholdHandler) GetHouseholdGoals(c *gin.Context) {
	householdID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid household ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	goals, err := h.householdService.GetHouseholdGoals(uint(householdID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, goals)
}
