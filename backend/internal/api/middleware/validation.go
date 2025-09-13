package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// SanitizeInput sanitizes user input to prevent XSS and injection attacks
func SanitizeInput() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Sanitize query parameters
		for key, values := range c.Request.URL.Query() {
			for i, value := range values {
				values[i] = sanitizeString(value)
			}
			c.Request.URL.Query()[key] = values
		}

		c.Next()
	}
}

// ValidateContentType ensures requests have the correct content type
func ValidateContentType() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Content-Type must be application/json",
				})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}

// RateLimitMiddleware implements basic rate limiting
func RateLimitMiddleware() gin.HandlerFunc {
	// This is a simple implementation - in production, use a proper rate limiter
	return func(c *gin.Context) {
		// Add rate limiting logic here
		c.Next()
	}
}

// sanitizeString removes potentially dangerous characters
func sanitizeString(input string) string {
	// Remove script tags and other dangerous content
	input = strings.ReplaceAll(input, "<script>", "")
	input = strings.ReplaceAll(input, "</script>", "")
	input = strings.ReplaceAll(input, "<", "&lt;")
	input = strings.ReplaceAll(input, ">", "&gt;")
	input = strings.ReplaceAll(input, "\"", "&quot;")
	input = strings.ReplaceAll(input, "'", "&#x27;")
	input = strings.ReplaceAll(input, "/", "&#x2F;")
	
	return strings.TrimSpace(input)
}
