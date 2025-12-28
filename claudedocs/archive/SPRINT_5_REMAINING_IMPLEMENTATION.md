# Sprint 5: Remaining Implementation Guide

## Critical Components to Complete

### 1. RBAC Middleware (CRITICAL - Security)

**File:** `backend/internal/api/middleware/rbac_middleware.go`

```go
package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
)

// RBACMiddleware creates middleware for permission checking
func RBACMiddleware(permissionService *services.PermissionService, resourceType, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract user ID from context (set by AuthMiddleware)
		userIDValue, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}
		userID := userIDValue.(uint)

		// Extract account ID from URL parameter or body
		accountID := getAccountIDFromContext(c)
		if accountID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "account ID required"})
			c.Abort()
			return
		}

		// Check permission
		granted, err := permissionService.CheckPermission(userID, accountID, resourceType, action)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "permission check failed"})
			c.Abort()
			return
		}

		if !granted {
			c.JSON(http.StatusForbidden, gin.H{"error": "permission denied: insufficient privileges"})
			c.Abort()
			return
		}

		// Store accountID in context for handlers
		c.Set("account_id", accountID)
		c.Next()
	}
}

// Helper function to extract account ID from various sources
func getAccountIDFromContext(c *gin.Context) uint {
	// Try URL parameter first
	if id := c.Param("id"); id != "" {
		if accountID, err := strconv.ParseUint(id, 10, 32); err == nil {
			return uint(accountID)
		}
	}

	// Try account_id parameter
	if id := c.Param("account_id"); id != "" {
		if accountID, err := strconv.ParseUint(id, 10, 32); err == nil {
			return uint(accountID)
		}
	}

	// Try query parameter
	if id := c.Query("account_id"); id != "" {
		if accountID, err := strconv.ParseUint(id, 10, 32); err == nil {
			return uint(accountID)
		}
	}

	// Try JSON body (for POST/PUT requests)
	var body struct {
		AccountID uint `json:"account_id"`
	}
	if err := c.ShouldBindJSON(&body); err == nil && body.AccountID > 0 {
		return body.AccountID
	}

	return 0
}
```

### 2. Sharing Handler

**File:** `backend/internal/api/handlers/sharing_handler.go`

```go
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
)

type SharingHandler struct {
	sharingService *services.SharingService
}

func NewSharingHandler(sharingService *services.SharingService) *SharingHandler {
	return &SharingHandler{sharingService: sharingService}
}

// InviteUser invites a user to an account
// POST /api/accounts/:id/invite
func (h *SharingHandler) InviteUser(c *gin.Context) {
	accountID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := c.GetUint("user_id")

	var req models.InvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invitation, err := h.sharingService.InviteUserToAccount(uint(accountID), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, invitation)
}

// GetMembers gets all members of an account
// GET /api/accounts/:id/members
func (h *SharingHandler) GetMembers(c *gin.Context) {
	accountID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := c.GetUint("user_id")

	members, err := h.sharingService.GetAccountMembers(uint(accountID), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}

// UpdateMemberRole updates a member's role
// PUT /api/accounts/:id/members/:userId/role
func (h *SharingHandler) UpdateMemberRole(c *gin.Context) {
	accountID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	memberID, _ := strconv.ParseUint(c.Param("userId"), 10, 32)
	userID := c.GetUint("user_id")

	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.sharingService.UpdateMemberRole(uint(accountID), uint(memberID), userID, req.Role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "role updated successfully"})
}

// RemoveMember removes a member from an account
// DELETE /api/accounts/:id/members/:userId
func (h *SharingHandler) RemoveMember(c *gin.Context) {
	accountID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	memberID, _ := strconv.ParseUint(c.Param("userId"), 10, 32)
	userID := c.GetUint("user_id")

	if err := h.sharingService.RemoveMember(uint(accountID), uint(memberID), userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "member removed successfully"})
}

// AcceptInvitation accepts an invitation
// POST /api/invitations/:token/accept
func (h *SharingHandler) AcceptInvitation(c *gin.Context) {
	token := c.Param("token")
	userID := c.GetUint("user_id")

	member, err := h.sharingService.AcceptInvitation(token, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, member)
}

// RevokeInvitation revokes an invitation
// DELETE /api/invitations/:id
func (h *SharingHandler) RevokeInvitation(c *gin.Context) {
	invitationID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := c.GetUint("user_id")

	if err := h.sharingService.RevokeInvitation(uint(invitationID), userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "invitation revoked successfully"})
}
```

### 3. API Routes Integration

**File:** `backend/internal/api/routes/routes.go` (add to existing file)

```go
// Multi-tenancy Routes
func setupMultiTenancyRoutes(router *gin.Engine,
	authMiddleware gin.HandlerFunc,
	sharingHandler *handlers.SharingHandler,
	collaborationHandler *handlers.CollaborationHandler,
	householdHandler *handlers.HouseholdHandler,
	permissionService *services.PermissionService) {

	// Middleware factory for RBAC
	requirePerm := func(resource, action string) gin.HandlerFunc {
		return middleware.RBACMiddleware(permissionService, resource, action)
	}

	// Sharing routes
	accounts := router.Group("/api/accounts", authMiddleware)
	{
		accounts.POST("/:id/invite", requirePerm("accounts", "invite"), sharingHandler.InviteUser)
		accounts.GET("/:id/members", requirePerm("accounts", "read"), sharingHandler.GetMembers)
		accounts.PUT("/:id/members/:userId/role", requirePerm("accounts", "manage"), sharingHandler.UpdateMemberRole)
		accounts.DELETE("/:id/members/:userId", requirePerm("accounts", "manage"), sharingHandler.RemoveMember)
	}

	invitations := router.Group("/api/invitations", authMiddleware)
	{
		invitations.POST("/:token/accept", sharingHandler.AcceptInvitation)
		invitations.DELETE("/:id", sharingHandler.RevokeInvitation)
	}

	// Collaboration routes
	transactions := router.Group("/api/transactions", authMiddleware)
	{
		transactions.POST("/:id/comments", requirePerm("transactions", "write"), collaborationHandler.AddComment)
		transactions.GET("/:id/comments", requirePerm("transactions", "read"), collaborationHandler.GetComments)
	}

	activity := router.Group("/api/activity", authMiddleware)
	{
		activity.GET("", collaborationHandler.GetActivityLog)
	}

	approvals := router.Group("/api/approvals", authMiddleware)
	{
		approvals.POST("", requirePerm("transactions", "write"), collaborationHandler.RequestApproval)
		approvals.PUT("/:id/approve", requirePerm("transactions", "manage"), collaborationHandler.ApproveTransaction)
		approvals.PUT("/:id/reject", requirePerm("transactions", "manage"), collaborationHandler.RejectTransaction)
		approvals.GET("/pending", collaborationHandler.GetPendingApprovals)
	}

	// Household routes
	households := router.Group("/api/households", authMiddleware)
	{
		households.POST("", householdHandler.CreateHousehold)
		households.GET("", householdHandler.GetHouseholds)
		households.GET("/:id", householdHandler.GetHousehold)
		households.POST("/:id/members", householdHandler.AddMember)
		households.PUT("/:id/members/:memberId/allowance", householdHandler.UpdateAllowance)
		households.DELETE("/:id/members/:memberId", householdHandler.RemoveMember)
		households.GET("/:id/budgets", householdHandler.GetBudgets)
		households.GET("/:id/goals", householdHandler.GetGoals)
	}
}
```

### 4. Database Migrations

**File:** `backend/cmd/api/main.go` (update AutoMigrate section)

```go
// Auto-migrate database schema
db.AutoMigrate(
	// Existing models
	&models.User{},
	&models.Account{},
	&models.Transaction{},
	&models.Budget{},
	&models.Category{},
	&models.Goal{},
	&models.RecurringTransaction{},
	&models.Notification{},
	&models.BalanceHistory{},
	&models.PasswordResetToken{},
	&models.EmailVerificationToken{},

	// Sprint 5: Multi-tenancy models
	&models.AccountMember{},
	&models.Invitation{},
	&models.Household{},
	&models.HouseholdMember{},
	&models.Comment{},
	&models.ActivityLog{},
	&models.ApprovalWorkflow{},
	&models.Role{},
	&models.UserRole{},
	&models.PermissionAuditLog{},
	&models.Organization{},
	&models.Department{},
	&models.Reimbursement{},
)

// Create system roles if they don't exist
createSystemRoles(db)

// Function to create system roles
func createSystemRoles(db *gorm.DB) {
	systemRoles := []struct {
		Name        string
		Description string
		Permissions models.RolePermissions
	}{
		{
			Name:        "owner",
			Description: "Account owner with full access",
			Permissions: models.GetSystemRolePermissions("owner"),
		},
		{
			Name:        "admin",
			Description: "Administrator with management access",
			Permissions: models.GetSystemRolePermissions("admin"),
		},
		{
			Name:        "editor",
			Description: "Editor with read/write access",
			Permissions: models.GetSystemRolePermissions("editor"),
		},
		{
			Name:        "viewer",
			Description: "Viewer with read-only access",
			Permissions: models.GetSystemRolePermissions("viewer"),
		},
	}

	for _, roleData := range systemRoles {
		var role models.Role
		result := db.Where("name = ? AND is_system_role = ?", roleData.Name, true).First(&role)
		if result.Error == gorm.ErrRecordNotFound {
			permJSON, _ := json.Marshal(roleData.Permissions)
			role = models.Role{
				Name:         roleData.Name,
				Description:  roleData.Description,
				Permissions:  string(permJSON),
				IsSystemRole: true,
			}
			db.Create(&role)
		}
	}
}
```

### 5. Unit Tests

**File:** `backend/internal/domain/services/permission_service_test.go`

```go
package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCheckPermission_Owner_FullAccess(t *testing.T) {
	// Test that owner has full access to all resources
	// Mock repositories
	// Create permission service
	// Call CheckPermission with various resource types and actions
	// Assert granted == true for all
}

func TestCheckPermission_Viewer_ReadOnlyAccess(t *testing.T) {
	// Test that viewer only has read access
	// Assert granted == true for read operations
	// Assert granted == false for write/delete operations
}

func TestCheckPermission_DeniedForNonMember(t *testing.T) {
	// Test that non-members are denied access
	// Assert granted == false for all operations
}

func TestPermissionCheck_PerformanceUnder10ms(t *testing.T) {
	// Benchmark permission check performance
	// Assert average time < 10ms
}
```

### 6. Integration Tests

Create `scripts/test-sprint5-collaboration.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"
TOKEN=""

echo "Testing Sprint 5: Multi-tenancy & Collaboration"

# 1. Register two users
echo "Registering users..."
USER1=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@test.com","password":"password123"}')

USER2=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user2","email":"user2@test.com","password":"password123"}')

# 2. User1 creates account
echo "Creating account..."
ACCOUNT=$(curl -s -X POST $BASE_URL/api/accounts \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Shared Account","type":"checking","balance":1000,"currency":"USD"}')

# 3. User1 invites User2
echo "Inviting user2..."
INVITATION=$(curl -s -X POST $BASE_URL/api/accounts/$ACCOUNT_ID/invite \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","role":"editor"}')

# 4. User2 accepts invitation
echo "Accepting invitation..."
curl -s -X POST $BASE_URL/api/invitations/$INVITATION_TOKEN/accept \
  -H "Authorization: Bearer $TOKEN_USER2"

# 5. User2 creates transaction (should succeed - has editor role)
echo "Creating transaction as user2..."
TRANSACTION=$(curl -s -X POST $BASE_URL/api/transactions \
  -H "Authorization: Bearer $TOKEN_USER2" \
  -H "Content-Type: application/json" \
  -d '{"account_id":$ACCOUNT_ID,"amount":100,"type":"expense","description":"Test"}')

# 6. User2 tries to delete account (should fail - needs owner role)
echo "Attempting to delete account as user2 (should fail)..."
curl -s -X DELETE $BASE_URL/api/accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN_USER2"

# 7. User1 adds comment to transaction
echo "Adding comment..."
curl -s -X POST $BASE_URL/api/transactions/$TRANSACTION_ID/comments \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great transaction!","mentions":[]}'

# 8. Check activity log
echo "Checking activity log..."
curl -s -X GET "$BASE_URL/api/activity?account_id=$ACCOUNT_ID&limit=10" \
  -H "Authorization: Bearer $TOKEN_USER1"

echo "Sprint 5 tests completed!"
```

## Summary

The Sprint 5 implementation is **60% complete**:

✅ **Completed:**
- All database models (13 new models)
- All repositories (10 new repositories)
- Core services (4 services)
- Repository helper methods

❌ **Pending:**
- Organization service
- RBAC middleware (CRITICAL)
- API handlers (4 handlers)
- API routes integration
- Database migrations
- Unit tests
- Integration tests

**Next Priority: Create RBAC middleware, then handlers and routes.**
