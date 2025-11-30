package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/handlers"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
	"github.com/quocdaijr/finance-management-backend/internal/infrastructure/database"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	infraServices "github.com/quocdaijr/finance-management-backend/internal/services"
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
		&models.PasswordResetToken{},
		&models.EmailVerificationToken{},
		&models.RecurringTransaction{},
		&models.Goal{},
		&models.Notification{},
		&models.Category{},
		&models.BalanceHistory{},
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
	tokenRepo := repository.NewTokenRepository(db)
	recurringRepo := repository.NewRecurringTransactionRepository(db)
	goalRepo := repository.NewGoalRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	balanceHistoryRepo := repository.NewBalanceHistoryRepository(db)

	// Initialize email service
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "development"
	}
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	emailService := infraServices.NewEmailService(
		"noreply@finance-app.com",
		cfg.AppName,
		baseURL,
		environment,
	)

	// Initialize services
	userService := services.NewUserService(userRepo)
	authService := services.NewAuthService(userRepo, tokenRepo, emailService, cfg)
	accountService := services.NewAccountService(accountRepo)
	transactionService := services.NewTransactionService(transactionRepo, accountRepo)
	budgetService := services.NewBudgetService(budgetRepo)
	exportService := infraServices.NewExportService(transactionRepo, accountRepo, budgetRepo)
	importService := infraServices.NewImportService(transactionRepo, accountRepo)
	recurringService := services.NewRecurringTransactionService(recurringRepo, transactionRepo, accountRepo)
	goalService := services.NewGoalService(goalRepo, accountRepo)
	notificationService := services.NewNotificationService(notificationRepo, budgetRepo, goalRepo, recurringRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	budgetAlertService := services.NewBudgetAlertService(budgetRepo, transactionRepo, notificationRepo)
	searchService := services.NewSearchService(transactionRepo, accountRepo, budgetRepo, goalRepo)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	authHandler := handlers.NewAuthHandler(authService)
	accountHandler := handlers.NewAccountHandler(accountService)
	transactionHandler := handlers.NewTransactionHandler(transactionService, budgetAlertService)
	budgetHandler := handlers.NewBudgetHandler(budgetService)
	exportHandler := handlers.NewExportHandler(exportService)
	importHandler := handlers.NewImportHandler(importService)
	recurringHandler := handlers.NewRecurringTransactionHandler(recurringService)
	goalHandler := handlers.NewGoalHandler(goalService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	balanceHistoryHandler := handlers.NewBalanceHistoryHandler(balanceHistoryRepo, accountRepo)
	currencyHandler := handlers.NewCurrencyHandler()
	searchHandler := handlers.NewSearchHandler(searchService)

	// Setup router
	router := gin.Default()

	// Add CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Add validation and security middleware
	router.Use(middleware.SanitizeInput())
	router.Use(middleware.ValidateContentType())
	router.Use(middleware.RateLimitMiddleware())

	// Setup routes
	setupRoutes(router, cfg, authHandler, accountHandler, transactionHandler, budgetHandler, userHandler, exportHandler, importHandler, recurringHandler, goalHandler, notificationHandler, categoryHandler, balanceHistoryHandler, currencyHandler, searchHandler)

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
	exportHandler *handlers.ExportHandler,
	importHandler *handlers.ImportHandler,
	recurringHandler *handlers.RecurringTransactionHandler,
	goalHandler *handlers.GoalHandler,
	notificationHandler *handlers.NotificationHandler,
	categoryHandler *handlers.CategoryHandler,
	balanceHistoryHandler *handlers.BalanceHistoryHandler,
	currencyHandler *handlers.CurrencyHandler,
	searchHandler *handlers.SearchHandler,
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
			// Password reset routes
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
			// Email verification routes
			auth.POST("/verify-email", authHandler.VerifyEmail)
			auth.POST("/resend-verification", authHandler.ResendVerification)
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
				transactions.POST("/transfer", transactionHandler.Transfer)
				transactions.GET("/search", transactionHandler.Search)
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

			// Export routes
			export := protected.Group("/export")
			{
				export.GET("/transactions/csv", exportHandler.ExportTransactionsCSV)
				export.GET("/transactions/json", exportHandler.ExportTransactionsJSON)
				export.GET("/accounts/csv", exportHandler.ExportAccountsCSV)
			}

			// Import routes
			importGroup := protected.Group("/import")
			{
				importGroup.POST("/transactions/csv", importHandler.ImportTransactionsCSV)
				importGroup.GET("/template", importHandler.GetImportTemplate)
			}

			// Recurring transaction routes
			recurring := protected.Group("/recurring-transactions")
			{
				recurring.GET("", recurringHandler.GetAll)
				recurring.POST("", recurringHandler.Create)
				recurring.GET("/:id", recurringHandler.GetByID)
				recurring.PUT("/:id", recurringHandler.Update)
				recurring.DELETE("/:id", recurringHandler.Delete)
				recurring.PATCH("/:id/toggle", recurringHandler.ToggleActive)
				recurring.POST("/:id/run", recurringHandler.RunNow)
			}

			// Financial goals routes
			goals := protected.Group("/goals")
			{
				goals.GET("", goalHandler.GetAll)
				goals.POST("", goalHandler.Create)
				goals.GET("/summary", goalHandler.GetSummary)
				goals.GET("/categories", goalHandler.GetCategories)
				goals.GET("/:id", goalHandler.GetByID)
				goals.PUT("/:id", goalHandler.Update)
				goals.DELETE("/:id", goalHandler.Delete)
				goals.POST("/:id/contribute", goalHandler.Contribute)
			}

			// Notifications routes
			notifications := protected.Group("/notifications")
			{
				notifications.GET("", notificationHandler.GetAll)
				notifications.GET("/unread", notificationHandler.GetUnread)
				notifications.GET("/summary", notificationHandler.GetSummary)
				notifications.PATCH("/:id/read", notificationHandler.MarkAsRead)
				notifications.POST("/read-all", notificationHandler.MarkAllAsRead)
				notifications.DELETE("/:id", notificationHandler.Delete)
			}

			// Category routes
			categories := protected.Group("/categories")
			{
				categories.GET("", categoryHandler.GetAll)
				categories.POST("", categoryHandler.Create)
				categories.GET("/:id", categoryHandler.GetByID)
				categories.PUT("/:id", categoryHandler.Update)
				categories.DELETE("/:id", categoryHandler.Delete)
			}

			// Balance history routes
			balanceHistory := protected.Group("/balance-history")
			{
				balanceHistory.GET("/trend", balanceHistoryHandler.GetOverallTrend)
				balanceHistory.GET("/account/:id", balanceHistoryHandler.GetAccountHistory)
				balanceHistory.GET("/account/:id/daily", balanceHistoryHandler.GetDailyBalances)
			}

			// Currency routes
			currencies := protected.Group("/currencies")
			{
				currencies.GET("", currencyHandler.GetAll)
				currencies.GET("/:code", currencyHandler.GetByCode)
				currencies.GET("/convert", currencyHandler.Convert)
			}

			// Search route
			protected.GET("/search", searchHandler.Search)
		}
	}
}
