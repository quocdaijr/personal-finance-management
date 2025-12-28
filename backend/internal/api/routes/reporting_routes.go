package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/api/middleware"
)

// SetupReportingRoutes configures tax and reporting features
func SetupReportingRoutes(api *gin.RouterGroup, rc *RouterConfig) {
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(rc.Config))

	// Tax management routes
	tax := protected.Group("/tax")
	{
		// Tax categories
		tax.GET("/categories", rc.TaxHandler.ListCategories)
		tax.POST("/categories", rc.TaxHandler.CreateCategory)
		tax.GET("/categories/:id", rc.TaxHandler.GetCategory)
		tax.PUT("/categories/:id", rc.TaxHandler.UpdateCategory)
		tax.DELETE("/categories/:id", rc.TaxHandler.DeleteCategory)

		// Tax reports and exports
		tax.GET("/report", rc.TaxHandler.GetTaxReport)
		tax.GET("/export", rc.TaxHandler.ExportTaxData)
	}

	// Custom report routes
	reports := protected.Group("/reports")
	{
		reports.GET("", rc.ReportHandler.ListReports)
		reports.POST("", rc.ReportHandler.CreateReport)
		reports.GET("/:id", rc.ReportHandler.GetReport)
		reports.PUT("/:id", rc.ReportHandler.UpdateReport)
		reports.DELETE("/:id", rc.ReportHandler.DeleteReport)
		reports.POST("/:id/generate", rc.ReportHandler.GenerateReport)
	}
}
