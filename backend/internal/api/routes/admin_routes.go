package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupAdminRoutes configures admin and system management features
func SetupAdminRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// User management (admin/debug)
	users := protected.Group("/users")
	{
		users.GET("", rc.UserHandler.GetUsers)
		users.GET("/:id", rc.UserHandler.GetUser)
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
