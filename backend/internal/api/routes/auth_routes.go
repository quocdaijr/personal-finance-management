package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupAuthRoutes configures authentication and profile routes
func SetupAuthRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	// Public auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", rc.AuthHandler.Register)
		auth.POST("/login", rc.AuthHandler.Login)
		auth.POST("/refresh-token", rc.AuthHandler.RefreshToken)
		auth.POST("/verify-2fa", rc.AuthHandler.VerifyTwoFactor)
		auth.POST("/forgot-password", rc.AuthHandler.ForgotPassword)
		auth.POST("/reset-password", rc.AuthHandler.ResetPassword)
		// Support both GET (email links) and POST (API calls) for email verification
		auth.GET("/verify-email", rc.AuthHandler.VerifyEmail)
		auth.POST("/verify-email", rc.AuthHandler.VerifyEmail)
		auth.POST("/resend-verification", rc.AuthHandler.ResendVerification)
	}

	// Protected profile routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))
	{
		protected.GET("/profile", rc.AuthHandler.GetProfile)
		protected.PUT("/profile", rc.AuthHandler.UpdateProfile)
		protected.POST("/auth/change-password", rc.AuthHandler.ChangePassword)
		protected.POST("/auth/setup-2fa", rc.AuthHandler.SetupTwoFactor)
		protected.POST("/auth/disable-2fa", rc.AuthHandler.DisableTwoFactor)
	}
}
