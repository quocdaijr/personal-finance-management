package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
)

// SharingHandler handles account sharing-related HTTP requests
type SharingHandler struct {
	sharingService *services.SharingService
}

// NewSharingHandler creates a new sharing handler
func NewSharingHandler(sharingService *services.SharingService) *SharingHandler {
	return &SharingHandler{
		sharingService: sharingService,
	}
}

// InviteUser invites a user to share an account
// @Summary Invite user to account
// @Tags Sharing
// @Accept json
// @Produce json
// @Param accountId path int true "Account ID"
// @Param invitation body models.InvitationRequest true "Invitation details"
// @Success 201 {object} models.InvitationResponse
// @Router /api/accounts/{accountId}/invitations [post]
func (h *SharingHandler) InviteUser(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	var req models.InvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	invitation, err := h.sharingService.InviteUser(uint(accountID), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, invitation)
}

// GetInvitations gets all invitations for the authenticated user
// @Summary Get user invitations
// @Tags Sharing
// @Produce json
// @Success 200 {array} models.InvitationResponse
// @Router /api/invitations [get]
func (h *SharingHandler) GetInvitations(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	invitations, err := h.sharingService.GetInvitations(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invitations)
}

// AcceptInvitation accepts an account invitation
// @Summary Accept invitation
// @Tags Sharing
// @Param invitationId path int true "Invitation ID"
// @Success 200 {object} map[string]string
// @Router /api/invitations/{invitationId}/accept [post]
func (h *SharingHandler) AcceptInvitation(c *gin.Context) {
	invitationID, err := strconv.ParseUint(c.Param("invitationId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invitation ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.sharingService.AcceptInvitation(uint(invitationID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invitation accepted successfully"})
}

// RejectInvitation rejects an account invitation
// @Summary Reject invitation
// @Tags Sharing
// @Param invitationId path int true "Invitation ID"
// @Success 200 {object} map[string]string
// @Router /api/invitations/{invitationId}/reject [post]
func (h *SharingHandler) RejectInvitation(c *gin.Context) {
	invitationID, err := strconv.ParseUint(c.Param("invitationId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invitation ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.sharingService.RejectInvitation(uint(invitationID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invitation rejected successfully"})
}

// GetAccountMembers gets all members of an account
// @Summary Get account members
// @Tags Sharing
// @Produce json
// @Param accountId path int true "Account ID"
// @Success 200 {array} models.AccountMemberResponse
// @Router /api/accounts/{accountId}/members [get]
func (h *SharingHandler) GetAccountMembers(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	members, err := h.sharingService.GetAccountMembers(uint(accountID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}

// UpdateMemberRole updates a member's role in an account
// @Summary Update member role
// @Tags Sharing
// @Accept json
// @Produce json
// @Param accountId path int true "Account ID"
// @Param memberId path int true "Member ID"
// @Param role body models.UpdateRoleRequest true "Role details"
// @Success 200 {object} map[string]string
// @Router /api/accounts/{accountId}/members/{memberId}/role [put]
func (h *SharingHandler) UpdateMemberRole(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	memberID, err := strconv.ParseUint(c.Param("memberId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	var req models.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.sharingService.UpdateMemberRole(uint(accountID), uint(memberID), userID, req.Role)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member role updated successfully"})
}

// RemoveMember removes a member from an account
// @Summary Remove account member
// @Tags Sharing
// @Param accountId path int true "Account ID"
// @Param memberId path int true "Member ID"
// @Success 200 {object} map[string]string
// @Router /api/accounts/{accountId}/members/{memberId} [delete]
func (h *SharingHandler) RemoveMember(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
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

	err = h.sharingService.RemoveMember(uint(accountID), uint(memberID), userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}
