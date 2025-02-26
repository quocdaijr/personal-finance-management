package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/handlers"
	"github.com/quocdaijr/finance-management-backend/internal/api/routes"
	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
	"github.com/quocdaijr/finance-management-backend/internal/infrastructure/database"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

func main() {
	// Load config
	cfg := config.LoadConfig()

	// Initialize DB
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	userService := services.NewUserService(userRepo)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)

	// Setup router
	router := gin.Default()
	routes.SetupRoutes(router, userHandler)

	// Start server
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
