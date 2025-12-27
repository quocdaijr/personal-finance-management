package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// APIVersion extracts API version from URL and sets it in context
func APIVersion() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Extract version from path (e.g., /api/v1/transactions)
		parts := strings.Split(path, "/")
		if len(parts) >= 3 && strings.HasPrefix(parts[2], "v") {
			version := parts[2]
			c.Set("api_version", version)
		} else {
			// Default to v1 for backward compatibility
			c.Set("api_version", "v1")
		}

		c.Next()
	}
}

// LegacyRedirect redirects old /api/* endpoints to /api/v1/*
func LegacyRedirect() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Only redirect if path doesn't already have version
		if strings.HasPrefix(path, "/api/") && !strings.HasPrefix(path, "/api/v") {
			// Skip redirect for health check
			if path == "/api/health" || strings.HasPrefix(path, "/api/health/") {
				c.Next()
				return
			}

			// Construct new versioned path
			newPath := strings.Replace(path, "/api/", "/api/v1/", 1)

			// Preserve query parameters
			if c.Request.URL.RawQuery != "" {
				newPath += "?" + c.Request.URL.RawQuery
			}

			c.Redirect(301, newPath) // 301 Moved Permanently
			c.Abort()
			return
		}

		c.Next()
	}
}
