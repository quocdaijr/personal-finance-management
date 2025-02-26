package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize router
	router := gin.Default()

	// Configure CORS - allow all origins for testing
	router.Use(cors.Default())
	// Add custom CORS headers for all routes
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Add health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Add test endpoint
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Test endpoint is working"})
	})

	// Add API test endpoint
	router.GET("/api/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "API test endpoint is working"})
	})

	// Add auth endpoints
	auth := router.Group("/api/auth")
	{
		auth.POST("/login", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"access_token": "test-token",
				"refresh_token": "test-refresh-token",
				"analytics_token": "test-analytics-token",
				"expires_in": 3600,
				"token_type": "Bearer",
				"user": gin.H{
					"id": 1,
					"username": "test",
					"email": "test@example.com",
					"first_name": "Test",
					"last_name": "User",
					"is_active": true,
					"is_email_verified": true,
					"two_factor_enabled": false,
					"created_at": "2023-01-01T00:00:00Z",
					"updated_at": "2023-01-01T00:00:00Z",
				},
			})
		})

		auth.POST("/register", func(c *gin.Context) {
			c.JSON(http.StatusCreated, gin.H{
				"id": 1,
				"username": "test",
				"email": "test@example.com",
				"first_name": "Test",
				"last_name": "User",
				"is_active": true,
				"is_email_verified": false,
				"two_factor_enabled": false,
				"created_at": "2023-01-01T00:00:00Z",
				"updated_at": "2023-01-01T00:00:00Z",
			})
		})
	}

	// Add transaction endpoints
	transactions := router.Group("/api/transactions")
	{
		transactions.GET("", func(c *gin.Context) {
			c.JSON(http.StatusOK, []gin.H{
				{
					"id": "1",
					"amount": 100.0,
					"description": "Test transaction",
					"category": "Food & Dining",
					"type": "expense",
					"date": "2023-01-01T00:00:00Z",
					"account_id": "1",
					"tags": []string{"food", "dining"},
					"created_at": "2023-01-01T00:00:00Z",
					"updated_at": "2023-01-01T00:00:00Z",
				},
			})
		})

		transactions.POST("", func(c *gin.Context) {
			c.JSON(http.StatusCreated, gin.H{
				"id": "2",
				"amount": 200.0,
				"description": "New transaction",
				"category": "Shopping",
				"type": "expense",
				"date": "2023-01-02T00:00:00Z",
				"account_id": "1",
				"tags": []string{"shopping"},
				"created_at": "2023-01-02T00:00:00Z",
				"updated_at": "2023-01-02T00:00:00Z",
			})
		})

		transactions.GET("/categories", func(c *gin.Context) {
			c.JSON(http.StatusOK, []string{
				"Food & Dining",
				"Shopping",
				"Housing",
				"Transportation",
				"Entertainment",
				"Health & Fitness",
				"Travel",
				"Education",
				"Personal Care",
				"Gifts & Donations",
				"Bills & Utilities",
				"Income",
				"Investments",
				"Uncategorized",
			})
		})

		transactions.GET("/summary", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"income": 1000.0,
				"expenses": 500.0,
				"balance": 500.0,
				"count": 10,
				"by_category": []gin.H{
					{
						"category": "Food & Dining",
						"amount": 200.0,
						"count": 5,
					},
					{
						"category": "Shopping",
						"amount": 150.0,
						"count": 3,
					},
					{
						"category": "Transportation",
						"amount": 100.0,
						"count": 2,
					},
				},
			})
		})
	}

	// Add account endpoints
	accounts := router.Group("/api/accounts")
	{
		accounts.GET("", func(c *gin.Context) {
			c.JSON(http.StatusOK, []gin.H{
				{
					"id": "1",
					"name": "Checking Account",
					"type": "checking",
					"balance": 1000.0,
					"currency": "USD",
					"is_default": true,
					"created_at": "2023-01-01T00:00:00Z",
					"updated_at": "2023-01-01T00:00:00Z",
				},
			})
		})

		accounts.POST("", func(c *gin.Context) {
			c.JSON(http.StatusCreated, gin.H{
				"id": "2",
				"name": "Savings Account",
				"type": "savings",
				"balance": 5000.0,
				"currency": "USD",
				"is_default": false,
				"created_at": "2023-01-02T00:00:00Z",
				"updated_at": "2023-01-02T00:00:00Z",
			})
		})

		accounts.GET("/types", func(c *gin.Context) {
			c.JSON(http.StatusOK, []gin.H{
				{
					"id": "checking",
					"name": "Checking Account",
				},
				{
					"id": "savings",
					"name": "Savings Account",
				},
				{
					"id": "credit",
					"name": "Credit Card",
				},
				{
					"id": "investment",
					"name": "Investment Account",
				},
				{
					"id": "cash",
					"name": "Cash",
				},
				{
					"id": "other",
					"name": "Other",
				},
			})
		})

		accounts.GET("/summary", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"total_accounts": 2,
				"total_assets": 6000.0,
				"total_liabilities": 0.0,
				"net_worth": 6000.0,
			})
		})
	}

	// Add budget endpoints
	budgets := router.Group("/api/budgets")
	{
		budgets.GET("", func(c *gin.Context) {
			c.JSON(http.StatusOK, []gin.H{
				{
					"id": "1",
					"name": "Food Budget",
					"amount": 500.0,
					"spent": 200.0,
					"category": "Food & Dining",
					"period": "monthly",
					"start_date": "2023-01-01T00:00:00Z",
					"end_date": "2023-01-31T23:59:59Z",
					"created_at": "2023-01-01T00:00:00Z",
					"updated_at": "2023-01-01T00:00:00Z",
				},
			})
		})

		budgets.POST("", func(c *gin.Context) {
			c.JSON(http.StatusCreated, gin.H{
				"id": "2",
				"name": "Shopping Budget",
				"amount": 300.0,
				"spent": 0.0,
				"category": "Shopping",
				"period": "monthly",
				"start_date": "2023-01-01T00:00:00Z",
				"end_date": "2023-01-31T23:59:59Z",
				"created_at": "2023-01-02T00:00:00Z",
				"updated_at": "2023-01-02T00:00:00Z",
			})
		})

		budgets.GET("/periods", func(c *gin.Context) {
			c.JSON(http.StatusOK, []gin.H{
				{
					"id": "monthly",
					"name": "Monthly",
				},
				{
					"id": "quarterly",
					"name": "Quarterly",
				},
				{
					"id": "yearly",
					"name": "Yearly",
				},
			})
		})

		budgets.GET("/summary", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"total_budgeted": 800.0,
				"total_spent": 200.0,
				"total_remaining": 600.0,
				"overall_progress": 25,
				"total_budgets": 2,
				"budgets_near_limit": 0,
				"budgets_over_limit": 0,
			})
		})
	}

	// Start server
	log.Printf("Server starting on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
