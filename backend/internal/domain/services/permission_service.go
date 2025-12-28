package services

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// PermissionService handles business logic for permissions and RBAC
type PermissionService struct {
	accountMemberRepo *repository.AccountMemberRepository
	roleRepo          *repository.RoleRepository
	userRoleRepo      *repository.UserRoleRepository
	auditRepo         *repository.PermissionAuditLogRepository
}

// NewPermissionService creates a new permission service
func NewPermissionService(
	accountMemberRepo *repository.AccountMemberRepository,
	roleRepo *repository.RoleRepository,
	userRoleRepo *repository.UserRoleRepository,
	auditRepo *repository.PermissionAuditLogRepository,
) *PermissionService {
	return &PermissionService{
		accountMemberRepo: accountMemberRepo,
		roleRepo:          roleRepo,
		userRoleRepo:      userRoleRepo,
		auditRepo:         auditRepo,
	}
}

// CheckPermission checks if a user has a specific permission on a resource
func (s *PermissionService) CheckPermission(userID, accountID uint, resourceType, action string) (bool, error) {
	// First check if user has access to the account
	hasAccess, err := s.accountMemberRepo.HasAccess(accountID, userID)
	if err != nil {
		return false, err
	}
	if !hasAccess {
		s.logPermissionCheck(userID, action, resourceType, 0, fmt.Sprintf("%s.%s", resourceType, action), false)
		return false, nil
	}

	// Get user's account member record
	member, err := s.accountMemberRepo.GetByAccountAndUser(accountID, userID)
	if err != nil {
		return false, err
	}

	// Check member permissions
	var perms models.AccountMemberPermissions
	if err := json.Unmarshal([]byte(member.Permissions), &perms); err != nil {
		return false, err
	}

	// Check basic permissions based on action
	granted := s.checkBasicPermission(perms, action)

	// If basic check passed, check resource-specific permissions via roles
	if granted {
		granted, err = s.checkRolePermission(userID, accountID, resourceType, action)
		if err != nil {
			return false, err
		}
	}

	// Log permission check
	s.logPermissionCheck(userID, action, resourceType, accountID, fmt.Sprintf("%s.%s", resourceType, action), granted)

	return granted, nil
}

// checkBasicPermission checks basic account-level permissions
func (s *PermissionService) checkBasicPermission(perms models.AccountMemberPermissions, action string) bool {
	switch action {
	case "read", "view":
		return true // All members can read
	case "create", "write", "update":
		return perms.CanEdit || perms.CanTransact
	case "delete":
		return perms.CanDelete
	case "manage":
		return perms.CanManage
	case "invite":
		return perms.CanInvite
	default:
		return false
	}
}

// checkRolePermission checks role-based permissions for specific resources
func (s *PermissionService) checkRolePermission(userID, accountID uint, resourceType, action string) (bool, error) {
	// Get user's roles for the account
	userRoles, err := s.userRoleRepo.GetByUserAndAccount(userID, accountID)
	if err != nil {
		return false, err
	}

	// If no specific roles assigned, check account member basic permissions
	if len(userRoles) == 0 {
		// Get member's role and check default permissions
		member, err := s.accountMemberRepo.GetByAccountAndUser(accountID, userID)
		if err != nil {
			return false, err
		}

		defaultPerms := models.GetSystemRolePermissions(member.Role)
		return s.checkResourcePermission(defaultPerms, resourceType, action), nil
	}

	// Check permissions across all assigned roles (OR logic)
	for _, userRole := range userRoles {
		role, err := s.roleRepo.GetByID(userRole.RoleID)
		if err != nil {
			continue
		}

		var rolePerms models.RolePermissions
		if err := json.Unmarshal([]byte(role.Permissions), &rolePerms); err != nil {
			continue
		}

		if s.checkResourcePermission(rolePerms, resourceType, action) {
			return true, nil
		}
	}

	return false, nil
}

// checkResourcePermission checks if permissions allow action on resource type
func (s *PermissionService) checkResourcePermission(perms models.RolePermissions, resourceType, action string) bool {
	var resourcePerms models.ResourcePermissions

	switch resourceType {
	case "transactions":
		resourcePerms = perms.Transactions
	case "budgets":
		resourcePerms = perms.Budgets
	case "goals":
		resourcePerms = perms.Goals
	case "accounts":
		resourcePerms = perms.Accounts
	case "reports":
		resourcePerms = perms.Reports
	default:
		return false
	}

	switch action {
	case "read", "view":
		return resourcePerms.Read
	case "create", "write", "update":
		return resourcePerms.Write
	case "delete":
		return resourcePerms.Delete
	default:
		return false
	}
}

// CanManageAccount checks if user can manage account settings
func (s *PermissionService) CanManageAccount(userID, accountID uint) (bool, error) {
	return s.CheckPermission(userID, accountID, "accounts", "manage")
}

// CanInviteMembers checks if user can invite other members
func (s *PermissionService) CanInviteMembers(userID, accountID uint) (bool, error) {
	member, err := s.accountMemberRepo.GetByAccountAndUser(accountID, userID)
	if err != nil {
		return false, err
	}

	var perms models.AccountMemberPermissions
	if err := json.Unmarshal([]byte(member.Permissions), &perms); err != nil {
		return false, err
	}

	return perms.CanInvite, nil
}

// IsOwner checks if user is the owner of the account
func (s *PermissionService) IsOwner(userID, accountID uint) (bool, error) {
	return s.accountMemberRepo.IsOwner(accountID, userID)
}

// GetUserRole gets the user's role for an account
func (s *PermissionService) GetUserRole(userID, accountID uint) (string, error) {
	return s.accountMemberRepo.GetRole(accountID, userID)
}

// logPermissionCheck logs a permission check for audit
func (s *PermissionService) logPermissionCheck(userID uint, action, resourceType string, resourceID uint, permission string, granted bool) {
	log := &models.PermissionAuditLog{
		UserID:            userID,
		Action:            action,
		ResourceType:      resourceType,
		ResourceID:        resourceID,
		PermissionChecked: permission,
		Granted:           granted,
	}
	// Best effort logging, ignore errors
	_ = s.auditRepo.Create(log)
}

// ValidatePermissionOrFail checks permission and returns error if denied
func (s *PermissionService) ValidatePermissionOrFail(userID, accountID uint, resourceType, action string) error {
	granted, err := s.CheckPermission(userID, accountID, resourceType, action)
	if err != nil {
		return err
	}
	if !granted {
		return errors.New("permission denied: insufficient privileges")
	}
	return nil
}

// GetUserPermissions gets all permissions for a user in an account
func (s *PermissionService) GetUserPermissions(userID, accountID uint) (*models.AccountMemberPermissions, error) {
	member, err := s.accountMemberRepo.GetByAccountAndUser(accountID, userID)
	if err != nil {
		return nil, err
	}

	var perms models.AccountMemberPermissions
	if err := json.Unmarshal([]byte(member.Permissions), &perms); err != nil {
		return nil, err
	}

	return &perms, nil
}
