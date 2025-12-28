package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupFinancialRoutes configures core financial routes (accounts, transactions, budgets)
func SetupFinancialRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// Account routes
	accounts := protected.Group("/accounts")
	{
		accounts.GET("", rc.AccountHandler.GetAll)
		accounts.POST("", rc.AccountHandler.Create)
		accounts.GET("/types", rc.AccountHandler.GetTypes)
		accounts.GET("/summary", rc.AccountHandler.GetSummary)
		accounts.GET("/:id", rc.AccountHandler.GetByID)
		accounts.PUT("/:id", rc.AccountHandler.Update)
		accounts.DELETE("/:id", rc.AccountHandler.Delete)
	}

	// Transaction routes
	transactions := protected.Group("/transactions")
	{
		transactions.GET("", rc.TransactionHandler.GetAll)
		transactions.POST("", rc.TransactionHandler.Create)
		transactions.POST("/transfer", rc.TransactionHandler.Transfer)
		transactions.GET("/search", rc.TransactionHandler.Search)
		transactions.GET("/categories", rc.TransactionHandler.GetCategories)
		transactions.GET("/summary", rc.TransactionHandler.GetSummary)
		transactions.GET("/:id", rc.TransactionHandler.GetByID)
		transactions.PUT("/:id", rc.TransactionHandler.Update)
		transactions.DELETE("/:id", rc.TransactionHandler.Delete)
	}

	// Budget routes
	budgets := protected.Group("/budgets")
	{
		budgets.GET("", rc.BudgetHandler.GetAll)
		budgets.POST("", rc.BudgetHandler.Create)
		budgets.GET("/periods", rc.BudgetHandler.GetPeriods)
		budgets.GET("/summary", rc.BudgetHandler.GetSummary)
		budgets.GET("/:id", rc.BudgetHandler.GetByID)
		budgets.PUT("/:id", rc.BudgetHandler.Update)
		budgets.DELETE("/:id", rc.BudgetHandler.Delete)
	}

	// Balance history routes
	balanceHistory := protected.Group("/balance-history")
	{
		balanceHistory.GET("/trend", rc.BalanceHistoryHandler.GetOverallTrend)
		balanceHistory.GET("/account/:id", rc.BalanceHistoryHandler.GetAccountHistory)
		balanceHistory.GET("/account/:id/daily", rc.BalanceHistoryHandler.GetDailyBalances)
	}

	// Currency routes
	currencies := protected.Group("/currencies")
	{
		currencies.GET("", rc.CurrencyHandler.GetAll)
		currencies.GET("/:code", rc.CurrencyHandler.GetByCode)
		currencies.GET("/convert", rc.CurrencyHandler.Convert)
	}
}
