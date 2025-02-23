package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	// Create a Gin router with default middleware (logger and recovery)
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "OK",
			"message": "app is running",
			"version": "1.0.0",
		})
	})

	// Sample API endpoint
	router.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Run the server on port 8080
	router.Run(":8080")
}
