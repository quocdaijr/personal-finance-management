package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupGoalRoutes configures financial goals and recurring transaction routes
func SetupGoalRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// Financial goals routes
	goals := protected.Group("/goals")
	{
		goals.GET("", rc.GoalHandler.GetAll)
		goals.POST("", rc.GoalHandler.Create)
		goals.GET("/summary", rc.GoalHandler.GetSummary)
		goals.GET("/categories", rc.GoalHandler.GetCategories)
		goals.GET("/:id", rc.GoalHandler.GetByID)
		goals.PUT("/:id", rc.GoalHandler.Update)
		goals.DELETE("/:id", rc.GoalHandler.Delete)
		goals.POST("/:id/contribute", rc.GoalHandler.Contribute)
	}

	// Recurring transaction routes
	recurring := protected.Group("/recurring-transactions")
	{
		recurring.GET("", rc.RecurringHandler.GetAll)
		recurring.POST("", rc.RecurringHandler.Create)
		recurring.GET("/:id", rc.RecurringHandler.GetByID)
		recurring.PUT("/:id", rc.RecurringHandler.Update)
		recurring.DELETE("/:id", rc.RecurringHandler.Delete)
		recurring.PATCH("/:id/toggle", rc.RecurringHandler.ToggleActive)
		recurring.POST("/:id/run", rc.RecurringHandler.RunNow)
	}
}
