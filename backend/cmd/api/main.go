package main

import (
	"log"
	"os"

	"github.com/quocdaijr/finance-management-backend/internal/api/handlers"
	"github.com/quocdaijr/finance-management-backend/internal/api/routes"
	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/domain/services"
	"github.com/quocdaijr/finance-management-backend/internal/infrastructure/database"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	infraServices "github.com/quocdaijr/finance-management-backend/internal/services"
	"gorm.io/gorm"
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
	taxRepo := repository.NewTaxRepository(db)
	reportRepo := repository.NewReportRepository(db)

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
	transactionService := services.NewTransactionService(transactionRepo, accountRepo, db)
	budgetService := services.NewBudgetService(budgetRepo)
	exportService := infraServices.NewExportService(transactionRepo, accountRepo, budgetRepo)
	importService := infraServices.NewImportService(transactionRepo, accountRepo)
	recurringService := services.NewRecurringTransactionService(recurringRepo, transactionRepo, accountRepo)
	goalService := services.NewGoalService(goalRepo, accountRepo)
	notificationService := services.NewNotificationService(notificationRepo, budgetRepo, goalRepo, recurringRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	budgetAlertService := services.NewBudgetAlertService(budgetRepo, transactionRepo, notificationRepo)
	searchService := services.NewSearchService(transactionRepo, accountRepo, budgetRepo, goalRepo)
	taxService := services.NewTaxService(taxRepo)
	reportService := services.NewReportService(reportRepo)

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
	taxHandler := handlers.NewTaxHandler(taxService)
	reportHandler := handlers.NewReportHandler(reportService)

	// Setup router with all routes
	router := routes.SetupRouter(&routes.RouterConfig{
		Config:                cfg,
		AuthHandler:           authHandler,
		AccountHandler:        accountHandler,
		TransactionHandler:    transactionHandler,
		BudgetHandler:         budgetHandler,
		UserHandler:           userHandler,
		ExportHandler:         exportHandler,
		ImportHandler:         importHandler,
		RecurringHandler:      recurringHandler,
		GoalHandler:           goalHandler,
		NotificationHandler:   notificationHandler,
		CategoryHandler:       categoryHandler,
		BalanceHistoryHandler: balanceHistoryHandler,
		CurrencyHandler:       currencyHandler,
		SearchHandler:         searchHandler,
		TaxHandler:            taxHandler,
		ReportHandler:         reportHandler,
	})

	// Start server
	log.Println("Server starting on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
