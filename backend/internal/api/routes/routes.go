package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/handlers"
)

func SetupRoutes(r *gin.Engine, userHandler *handlers.UserHandler) {
	api := r.Group("/api")
	{
		api.GET("/users", userHandler.GetUsers)
		api.GET("/users/:id", userHandler.GetUser)
	}
}
