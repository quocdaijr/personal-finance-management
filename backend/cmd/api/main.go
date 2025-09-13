package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/handlers"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
	"github.com/quocdaijr/finance-management-backend/internal/infrastructure/database"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/gin-contrib/cors"
)

func main() {
	// Load config
	cfg := config.LoadConfig()

	// Initialize DB
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run database migrations
	err = db.AutoMigrate(
		&models.User{},
		&models.Account{},
		&models.Transaction{},
		&models.Budget{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Run database seeding
	err = database.SeedDatabase(db)
	if err != nil {
		log.Printf("Warning: Failed to seed database: %v", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)
	budgetRepo := repository.NewBudgetRepository(db)

	// Initialize services
	userService := services.NewUserService(userRepo)
	authService := services.NewAuthService(userRepo, cfg)
	accountService := services.NewAccountService(accountRepo)
	transactionService := services.NewTransactionService(transactionRepo, accountRepo)
	budgetService := services.NewBudgetService(budgetRepo)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	authHandler := handlers.NewAuthHandler(authService)
	accountHandler := handlers.NewAccountHandler(accountService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	budgetHandler := handlers.NewBudgetHandler(budgetService)

	// Setup router
	router := gin.Default()

	// Add CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Add validation and security middleware
	router.Use(middleware.SanitizeInput())
	router.Use(middleware.ValidateContentType())
	router.Use(middleware.RateLimitMiddleware())

	// Setup routes
	setupRoutes(router, cfg, authHandler, accountHandler, transactionHandler, budgetHandler, userHandler)

	// Start server
	log.Println("Server starting on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// setupRoutes configures all the API routes
func setupRoutes(
	router *gin.Engine,
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	accountHandler *handlers.AccountHandler,
	transactionHandler *handlers.TransactionHandler,
	budgetHandler *handlers.BudgetHandler,
	userHandler *handlers.UserHandler,
) {
	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := router.Group("/api")
	{
		// Auth routes (no authentication required)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh-token", authHandler.RefreshToken)
			auth.POST("/verify-2fa", authHandler.VerifyTwoFactor)
		}

		// Protected routes (authentication required)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// User profile routes
			protected.GET("/profile", authHandler.GetProfile)
			protected.PUT("/profile", authHandler.UpdateProfile)
			protected.POST("/auth/change-password", authHandler.ChangePassword)
			protected.POST("/auth/setup-2fa", authHandler.SetupTwoFactor)
			protected.POST("/auth/disable-2fa", authHandler.DisableTwoFactor)

			// Account routes
			accounts := protected.Group("/accounts")
			{
				accounts.GET("", accountHandler.GetAll)
				accounts.POST("", accountHandler.Create)
				accounts.GET("/types", accountHandler.GetTypes)
				accounts.GET("/summary", accountHandler.GetSummary)
				accounts.GET("/:id", accountHandler.GetByID)
				accounts.PUT("/:id", accountHandler.Update)
				accounts.DELETE("/:id", accountHandler.Delete)
			}

			// Transaction routes
			transactions := protected.Group("/transactions")
			{
				transactions.GET("", transactionHandler.GetAll)
				transactions.POST("", transactionHandler.Create)
				transactions.GET("/categories", transactionHandler.GetCategories)
				transactions.GET("/summary", transactionHandler.GetSummary)
				transactions.GET("/:id", transactionHandler.GetByID)
				transactions.PUT("/:id", transactionHandler.Update)
				transactions.DELETE("/:id", transactionHandler.Delete)
			}

			// Budget routes
			budgets := protected.Group("/budgets")
			{
				budgets.GET("", budgetHandler.GetAll)
				budgets.POST("", budgetHandler.Create)
				budgets.GET("/periods", budgetHandler.GetPeriods)
				budgets.GET("/summary", budgetHandler.GetSummary)
				budgets.GET("/:id", budgetHandler.GetByID)
				budgets.PUT("/:id", budgetHandler.Update)
				budgets.DELETE("/:id", budgetHandler.Delete)
			}

			// User routes (admin/debug)
			users := protected.Group("/users")
			{
				users.GET("", userHandler.GetUsers)
				users.GET("/:id", userHandler.GetUser)
			}
		}
	}
}
