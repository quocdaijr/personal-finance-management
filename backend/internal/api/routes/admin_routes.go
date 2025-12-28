package routes

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupAdminRoutes configures admin and system management features
func SetupAdminRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// User management (debug endpoints - development only)
	// TODO: These endpoints expose all users without authorization checks
	// They should be removed or restricted to admin users only in production
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" || environment == "development" {
		users := protected.Group("/users")
		{
			users.GET("", rc.UserHandler.GetUsers)
			users.GET("/:id", rc.UserHandler.GetUser)
		}
	}

	// Category management
	categories := protected.Group("/categories")
	{
		categories.GET("", rc.CategoryHandler.GetAll)
		categories.POST("", rc.CategoryHandler.Create)
		categories.GET("/:id", rc.CategoryHandler.GetByID)
		categories.PUT("/:id", rc.CategoryHandler.Update)
		categories.DELETE("/:id", rc.CategoryHandler.Delete)
	}
}
