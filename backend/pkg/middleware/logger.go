package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/pkg/logger"
	"github.com/sirupsen/logrus"
)

// LoggerMiddleware logs HTTP requests
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		startTime := time.Now()

		// Get request path
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(startTime)

		// Get response status
		statusCode := c.Writer.Status()

		// Get client IP
		clientIP := c.ClientIP()

		// Get request method
		method := c.Request.Method

		// Log based on status code
		fields := logrus.Fields{
			"status":     statusCode,
			"method":     method,
			"path":       path,
			"query":      query,
			"ip":         clientIP,
			"latency":    latency.String(),
			"latency_ms": latency.Milliseconds(),
			"user_agent": c.Request.UserAgent(),
		}

		// Add user ID if authenticated
		if userID, exists := c.Get("userID"); exists {
			fields["user_id"] = userID
		}

		// Add error if present
		if len(c.Errors) > 0 {
			fields["errors"] = c.Errors.String()
		}

		// Log at appropriate level
		logEntry := logger.WithFields(fields)

		switch {
		case statusCode >= 500:
			logEntry.Error("Server error")
		case statusCode >= 400:
			logEntry.Warn("Client error")
		case statusCode >= 300:
			logEntry.Info("Redirect")
		default:
			logEntry.Info("Request completed")
		}
	}
}

// RecoveryMiddleware recovers from panics and logs them
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.WithFields(logrus.Fields{
					"error":  err,
					"path":   c.Request.URL.Path,
					"method": c.Request.Method,
					"ip":     c.ClientIP(),
				}).Error("Panic recovered")

				c.AbortWithStatus(500)
			}
		}()

		c.Next()
	}
}
