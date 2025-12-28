package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupNotificationRoutes configures notification and alert features
func SetupNotificationRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	notifications := protected.Group("/notifications")
	{
		notifications.GET("", rc.NotificationHandler.GetAll)
		notifications.GET("/unread", rc.NotificationHandler.GetUnread)
		notifications.GET("/summary", rc.NotificationHandler.GetSummary)
		notifications.PATCH("/:id/read", rc.NotificationHandler.MarkAsRead)
		notifications.POST("/read-all", rc.NotificationHandler.MarkAllAsRead)
		notifications.DELETE("/:id", rc.NotificationHandler.Delete)
	}
}
