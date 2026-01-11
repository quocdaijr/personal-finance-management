package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupCollaborationRoutes configures Sprint 5 collaboration routes (households, sharing, collaboration)
func SetupCollaborationRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// Household routes
	households := protected.Group("/households")
	{
		households.POST("", rc.HouseholdHandler.CreateHousehold)
		households.GET("", rc.HouseholdHandler.GetHouseholds)
		households.GET("/:id", rc.HouseholdHandler.GetHousehold)
		households.POST("/:id/members", rc.HouseholdHandler.AddMember)
		households.PUT("/:id/members/:memberId/allowance", rc.HouseholdHandler.UpdateAllowance)
		households.DELETE("/:id/members/:memberId", rc.HouseholdHandler.RemoveMember)
		households.GET("/:id/budgets", rc.HouseholdHandler.GetHouseholdBudgets)
		households.GET("/:id/goals", rc.HouseholdHandler.GetHouseholdGoals)
	}

	// Account sharing routes
	accounts := protected.Group("/accounts")
	{
		// Account member management
		accounts.POST("/:id/invitations", rc.SharingHandler.InviteUser)
		accounts.GET("/:id/members", rc.SharingHandler.GetAccountMembers)
		accounts.PUT("/:id/members/:memberId/role", rc.SharingHandler.UpdateMemberRole)
		accounts.DELETE("/:id/members/:memberId", rc.SharingHandler.RemoveMember)

		// Activity log
		accounts.GET("/:id/activity", rc.CollaborationHandler.GetActivityLog)
	}

	// Invitation routes
	invitations := protected.Group("/invitations")
	{
		invitations.GET("", rc.SharingHandler.GetInvitations)
		invitations.POST("/:invitationId/accept", rc.SharingHandler.AcceptInvitation)
		invitations.POST("/:invitationId/reject", rc.SharingHandler.RejectInvitation)
	}

	// Transaction collaboration routes
	transactions := protected.Group("/transactions")
	{
		// Comments
		transactions.POST("/:id/comments", rc.CollaborationHandler.AddComment)
		transactions.GET("/:id/comments", rc.CollaborationHandler.GetComments)

		// Approval workflows
		transactions.POST("/:id/approval", rc.CollaborationHandler.RequestApproval)
	}

	// Comment routes
	comments := protected.Group("/comments")
	{
		comments.DELETE("/:commentId", rc.CollaborationHandler.DeleteComment)
	}

	// Approval routes
	approvals := protected.Group("/approvals")
	{
		approvals.POST("/:approvalId/approve", rc.CollaborationHandler.ApproveTransaction)
		approvals.POST("/:approvalId/reject", rc.CollaborationHandler.RejectTransaction)
	}
}
