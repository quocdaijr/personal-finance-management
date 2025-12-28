package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupDataRoutes configures import, export, and search features
func SetupDataRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// Export routes
	export := protected.Group("/export")
	{
		export.GET("/transactions/csv", rc.ExportHandler.ExportTransactionsCSV)
		export.GET("/transactions/json", rc.ExportHandler.ExportTransactionsJSON)
		export.GET("/accounts/csv", rc.ExportHandler.ExportAccountsCSV)
	}

	// Import routes
	importGroup := protected.Group("/import")
	{
		importGroup.POST("/transactions/csv", rc.ImportHandler.ImportTransactionsCSV)
		importGroup.GET("/template", rc.ImportHandler.GetImportTemplate)
	}

	// Search routes
	protected.GET("/search", rc.SearchHandler.Search)
}
