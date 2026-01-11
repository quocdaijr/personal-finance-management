package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
)

// CollaborationHandler handles collaboration-related HTTP requests
type CollaborationHandler struct {
	collaborationService *services.CollaborationService
}

// NewCollaborationHandler creates a new collaboration handler
func NewCollaborationHandler(collaborationService *services.CollaborationService) *CollaborationHandler {
	return &CollaborationHandler{
		collaborationService: collaborationService,
	}
}

// AddComment adds a comment to a transaction
// @Summary Add comment to transaction
// @Tags Collaboration
// @Accept json
// @Produce json
// @Param transactionId path int true "Transaction ID"
// @Param comment body models.CommentRequest true "Comment details"
// @Success 201 {object} models.Comment
// @Router /api/transactions/{transactionId}/comments [post]
func (h *CollaborationHandler) AddComment(c *gin.Context) {
	transactionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	var req models.CommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	comment, err := h.collaborationService.AddComment(uint(transactionID), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

// GetComments gets all comments for a transaction
// @Summary Get transaction comments
// @Tags Collaboration
// @Produce json
// @Param transactionId path int true "Transaction ID"
// @Success 200 {array} models.CommentResponse
// @Router /api/transactions/{transactionId}/comments [get]
func (h *CollaborationHandler) GetComments(c *gin.Context) {
	transactionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	comments, err := h.collaborationService.GetComments(uint(transactionID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}

// DeleteComment deletes a comment
// @Summary Delete comment
// @Tags Collaboration
// @Param commentId path int true "Comment ID"
// @Success 200 {object} map[string]string
// @Router /api/comments/{commentId} [delete]
func (h *CollaborationHandler) DeleteComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("commentId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.collaborationService.DeleteComment(uint(commentID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

// RequestApproval requests approval for a transaction
// @Summary Request transaction approval
// @Tags Collaboration
// @Accept json
// @Produce json
// @Param transactionId path int true "Transaction ID"
// @Param approval body models.ApprovalRequest true "Approval details"
// @Success 201 {object} models.ApprovalWorkflow
// @Router /api/transactions/{transactionId}/approval [post]
func (h *CollaborationHandler) RequestApproval(c *gin.Context) {
	transactionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	var req models.ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	approval, err := h.collaborationService.RequestApproval(uint(transactionID), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, approval)
}

// ApproveTransaction approves a transaction
// @Summary Approve transaction
// @Tags Collaboration
// @Param approvalId path int true "Approval ID"
// @Success 200 {object} map[string]string
// @Router /api/approvals/{approvalId}/approve [post]
func (h *CollaborationHandler) ApproveTransaction(c *gin.Context) {
	approvalID, err := strconv.ParseUint(c.Param("approvalId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid approval ID"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.collaborationService.ApproveTransaction(uint(approvalID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction approved successfully"})
}

// RejectTransaction rejects a transaction
// @Summary Reject transaction
// @Tags Collaboration
// @Accept json
// @Produce json
// @Param approvalId path int true "Approval ID"
// @Param rejection body models.RejectionRequest true "Rejection reason"
// @Success 200 {object} map[string]string
// @Router /api/approvals/{approvalId}/reject [post]
func (h *CollaborationHandler) RejectTransaction(c *gin.Context) {
	approvalID, err := strconv.ParseUint(c.Param("approvalId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid approval ID"})
		return
	}

	var req models.RejectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.collaborationService.RejectTransaction(uint(approvalID), userID, req.Reason)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction rejected successfully"})
}

// GetActivityLog gets activity log for an account
// @Summary Get activity log
// @Tags Collaboration
// @Produce json
// @Param accountId path int true "Account ID"
// @Success 200 {array} models.ActivityLogResponse
// @Router /api/accounts/{accountId}/activity [get]
func (h *CollaborationHandler) GetActivityLog(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get limit from query parameter, default to 50
	limit := 50
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	activities, err := h.collaborationService.GetActivityLog(uint(accountID), userID, limit)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, activities)
}
