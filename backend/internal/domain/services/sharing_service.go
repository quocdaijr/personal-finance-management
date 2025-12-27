package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// SharingService handles business logic for shared accounts
type SharingService struct {
	accountMemberRepo *repository.AccountMemberRepository
	invitationRepo    *repository.InvitationRepository
	accountRepo       *repository.AccountRepository
	userRepo          *repository.UserRepository
	permissionService *PermissionService
	activityLogRepo   *repository.ActivityLogRepository
}

// NewSharingService creates a new sharing service
func NewSharingService(
	accountMemberRepo *repository.AccountMemberRepository,
	invitationRepo *repository.InvitationRepository,
	accountRepo *repository.AccountRepository,
	userRepo *repository.UserRepository,
	permissionService *PermissionService,
	activityLogRepo *repository.ActivityLogRepository,
) *SharingService {
	return &SharingService{
		accountMemberRepo: accountMemberRepo,
		invitationRepo:    invitationRepo,
		accountRepo:       accountRepo,
		userRepo:          userRepo,
		permissionService: permissionService,
		activityLogRepo:   activityLogRepo,
	}
}

// InviteUserToAccount invites a user to an account
func (s *SharingService) InviteUserToAccount(accountID, inviterID uint, req *models.InvitationRequest) (*models.Invitation, error) {
	// Check if inviter has permission to invite
	canInvite, err := s.permissionService.CanInviteMembers(inviterID, accountID)
	if err != nil {
		return nil, err
	}
	if !canInvite {
		return nil, errors.New("you don't have permission to invite members")
	}

	// Check if account exists
	_, err = s.accountRepo.GetByID(accountID, inviterID)
	if err != nil {
		return nil, errors.New("account not found or you don't have access")
	}

	// Check if invitation already exists
	exists, err := s.invitationRepo.ExistsByAccountAndEmail(accountID, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("invitation already sent to this email")
	}

	// Check if user is already a member
	user, err := s.userRepo.GetByEmail(req.Email)
	if err == nil {
		// User exists, check if already a member
		hasAccess, _ := s.accountMemberRepo.HasAccess(accountID, user.ID)
		if hasAccess {
			return nil, errors.New("user is already a member of this account")
		}
	}

	// Generate unique invitation token
	token, err := generateToken(32)
	if err != nil {
		return nil, err
	}

	// Create invitation
	invitation := &models.Invitation{
		AccountID: accountID,
		Email:     req.Email,
		Role:      req.Role,
		Token:     token,
		InvitedBy: inviterID,
		ExpiresAt: time.Now().Add(48 * time.Hour), // 48 hours expiry
		Status:    "pending",
	}

	if err := s.invitationRepo.Create(invitation); err != nil {
		return nil, err
	}

	// Log activity
	s.logActivity(accountID, inviterID, "invited_user", "invitation", invitation.ID, map[string]interface{}{
		"email": req.Email,
		"role":  req.Role,
	})

	// TODO: Send invitation email
	// This would integrate with email service

	return invitation, nil
}

// AcceptInvitation accepts an invitation to join an account
func (s *SharingService) AcceptInvitation(token string, userID uint) (*models.AccountMember, error) {
	// Get invitation
	invitation, err := s.invitationRepo.GetByToken(token)
	if err != nil {
		return nil, errors.New("invalid invitation token")
	}

	// Validate invitation
	if !invitation.IsValid() {
		return nil, errors.New("invitation has expired or is no longer valid")
	}

	// Check if user's email matches invitation
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}
	if user.Email != invitation.Email {
		return nil, errors.New("invitation was sent to a different email address")
	}

	// Check if user is already a member
	hasAccess, _ := s.accountMemberRepo.HasAccess(invitation.AccountID, userID)
	if hasAccess {
		return nil, errors.New("you are already a member of this account")
	}

	// Create account member
	permissions := models.GetDefaultPermissions(invitation.Role)
	permJSON, _ := json.Marshal(permissions)

	now := time.Now()
	member := &models.AccountMember{
		AccountID:   invitation.AccountID,
		UserID:      userID,
		Role:        invitation.Role,
		Permissions: string(permJSON),
		InvitedBy:   &invitation.InvitedBy,
		InvitedAt:   &invitation.CreatedAt,
		AcceptedAt:  &now,
		Status:      "active",
	}

	if err := s.accountMemberRepo.Create(member); err != nil {
		return nil, err
	}

	// Update invitation status
	invitation.Status = "accepted"
	_ = s.invitationRepo.Update(invitation)

	// Log activity
	s.logActivity(invitation.AccountID, userID, "accepted_invitation", "account_member", member.ID, nil)

	return member, nil
}

// GetAccountMembers gets all members of an account
func (s *SharingService) GetAccountMembers(accountID, userID uint) ([]models.AccountMemberResponse, error) {
	// Check if user has access to the account
	hasAccess, err := s.accountMemberRepo.HasAccess(accountID, userID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("you don't have access to this account")
	}

	members, err := s.accountMemberRepo.GetByAccount(accountID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.AccountMemberResponse
	for _, member := range members {
		var perms models.AccountMemberPermissions
		_ = json.Unmarshal([]byte(member.Permissions), &perms)

		response := models.AccountMemberResponse{
			ID:          member.ID,
			AccountID:   member.AccountID,
			UserID:      member.UserID,
			Username:    member.User.Username,
			Email:       member.User.Email,
			Role:        member.Role,
			Permissions: perms,
			Status:      member.Status,
			InvitedAt:   member.InvitedAt,
			AcceptedAt:  member.AcceptedAt,
			CreatedAt:   member.CreatedAt,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// UpdateMemberRole updates a member's role
func (s *SharingService) UpdateMemberRole(accountID, memberID, updaterID uint, role string) error {
	// Check if updater can manage account
	canManage, err := s.permissionService.CanManageAccount(updaterID, accountID)
	if err != nil {
		return err
	}
	if !canManage {
		return errors.New("you don't have permission to manage members")
	}

	// Get member
	member, err := s.accountMemberRepo.GetByID(memberID)
	if err != nil {
		return err
	}

	// Cannot modify owner role
	if member.Role == "owner" {
		return errors.New("cannot modify owner role")
	}

	// Update role and permissions
	permissions := models.GetDefaultPermissions(role)
	permJSON, _ := json.Marshal(permissions)

	if err := s.accountMemberRepo.UpdateRole(memberID, role, string(permJSON)); err != nil {
		return err
	}

	// Log activity
	s.logActivity(accountID, updaterID, "updated_member_role", "account_member", memberID, map[string]interface{}{
		"user_id":  member.UserID,
		"new_role": role,
		"old_role": member.Role,
	})

	return nil
}

// RemoveMember removes a member from an account
func (s *SharingService) RemoveMember(accountID, memberID, removerID uint) error {
	// Check if remover can manage account
	canManage, err := s.permissionService.CanManageAccount(removerID, accountID)
	if err != nil {
		return err
	}
	if !canManage {
		return errors.New("you don't have permission to remove members")
	}

	// Get member
	member, err := s.accountMemberRepo.GetByID(memberID)
	if err != nil {
		return err
	}

	// Cannot remove owner
	if member.Role == "owner" {
		return errors.New("cannot remove account owner")
	}

	// Remove member (revoke access)
	if err := s.accountMemberRepo.Delete(memberID); err != nil {
		return err
	}

	// Log activity
	s.logActivity(accountID, removerID, "removed_member", "account_member", memberID, map[string]interface{}{
		"user_id": member.UserID,
	})

	return nil
}

// RevokeInvitation revokes a pending invitation
func (s *SharingService) RevokeInvitation(invitationID, revokerID uint) error {
	invitation, err := s.invitationRepo.GetByID(invitationID)
	if err != nil {
		return err
	}

	// Check if revoker can manage account
	canManage, err := s.permissionService.CanManageAccount(revokerID, invitation.AccountID)
	if err != nil {
		return err
	}
	if !canManage {
		return errors.New("you don't have permission to revoke invitations")
	}

	if err := s.invitationRepo.Revoke(invitationID); err != nil {
		return err
	}

	// Log activity
	s.logActivity(invitation.AccountID, revokerID, "revoked_invitation", "invitation", invitationID, map[string]interface{}{
		"email": invitation.Email,
	})

	return nil
}

// GetPendingInvitations gets all pending invitations for an account
func (s *SharingService) GetPendingInvitations(accountID, userID uint) ([]models.InvitationResponse, error) {
	// Check if user has access
	hasAccess, err := s.accountMemberRepo.HasAccess(accountID, userID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("you don't have access to this account")
	}

	invitations, err := s.invitationRepo.GetByAccount(accountID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.InvitationResponse
	for _, inv := range invitations {
		response := models.InvitationResponse{
			ID:          inv.ID,
			AccountID:   inv.AccountID,
			AccountName: inv.Account.Name,
			Email:       inv.Email,
			Role:        inv.Role,
			InvitedBy:   inv.InvitedBy,
			InviterName: inv.Inviter.Username,
			ExpiresAt:   inv.ExpiresAt,
			Status:      inv.Status,
			CreatedAt:   inv.CreatedAt,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// logActivity logs an activity
func (s *SharingService) logActivity(accountID, userID uint, action, entityType string, entityID uint, details map[string]interface{}) {
	detailsJSON, _ := json.Marshal(details)
	log := &models.ActivityLog{
		AccountID:  accountID,
		UserID:     userID,
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		Details:    string(detailsJSON),
	}
	_ = s.activityLogRepo.Create(log)
}

// generateToken generates a random token
func generateToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}
