package utils

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUserIDFromContext gets the user ID from the Gin context
func GetUserIDFromContext(c *gin.Context) (uint, error) {
	// Get user ID from context
	userIDStr, exists := c.Get("userID")
	if !exists {
		return 0, errors.New("user ID not found in context")
	}

	// Convert to uint
	userID, ok := userIDStr.(uint)
	if !ok {
		// Try to convert from string
		userIDStr, ok := userIDStr.(string)
		if !ok {
			return 0, errors.New("invalid user ID format")
		}

		// Parse string to uint
		id, err := strconv.ParseUint(userIDStr, 10, 32)
		if err != nil {
			return 0, errors.New("invalid user ID format")
		}

		userID = uint(id)
	}

	return userID, nil
}
