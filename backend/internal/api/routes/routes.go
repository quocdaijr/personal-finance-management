package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/handlers"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
	"github.com/quocdaijr/finance-management-backend/internal/config"
	pkgMiddleware "github.com/quocdaijr/finance-management-backend/pkg/middleware"
)

// RouterConfig holds all dependencies needed for route setup
type RouterConfig struct {
	Config *config.Config

	// Core handlers
	AuthHandler        *handlers.AuthHandler
	AccountHandler     *handlers.AccountHandler
	TransactionHandler *handlers.TransactionHandler
	BudgetHandler      *handlers.BudgetHandler
	UserHandler        *handlers.UserHandler

	// Goal & recurring
	GoalHandler      *handlers.GoalHandler
	RecurringHandler *handlers.RecurringTransactionHandler

	// Reporting
	TaxHandler    *handlers.TaxHandler
	ReportHandler *handlers.ReportHandler

	// Data operations
	ExportHandler *handlers.ExportHandler
	ImportHandler *handlers.ImportHandler
	SearchHandler *handlers.SearchHandler

	// Supporting features
	NotificationHandler   *handlers.NotificationHandler
	CategoryHandler       *handlers.CategoryHandler
	BalanceHistoryHandler *handlers.BalanceHistoryHandler
	CurrencyHandler       *handlers.CurrencyHandler

	// Sprint 5: Collaboration handlers
	HouseholdHandler      *handlers.HouseholdHandler
	CollaborationHandler  *handlers.CollaborationHandler
	SharingHandler        *handlers.SharingHandler
}

// SetupRouter configures the main router with all routes
func SetupRouter(rc *RouterConfig) *gin.Engine {
	router := gin.Default()

	// Global middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))
	router.Use(middleware.SanitizeInput())
	router.Use(middleware.ValidateContentType())
	router.Use(middleware.RateLimitMiddleware())
	router.Use(pkgMiddleware.APIVersion())
	router.Use(pkgMiddleware.LegacyRedirect())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 routes - organized by feature domain
	api := router.Group("/api/v1")

	SetupAuthRoutes(api, rc)         // Authentication & profiles
	SetupFinancialRoutes(api, rc)    // Accounts, transactions, budgets
	SetupGoalRoutes(api, rc)         // Goals & recurring transactions
	SetupReportingRoutes(api, rc)       // Tax & custom reports
	SetupDataRoutes(api, rc)            // Import, export, search
	SetupNotificationRoutes(api, rc)    // Notifications & alerts
	SetupAdminRoutes(api, rc)           // Categories, user management
	SetupCollaborationRoutes(api, rc)   // Sprint 5: Households, sharing, collaboration

	return router
}
