package utils

import (
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/quocdaijr/finance-management-backend/internal/config"
)

// GenerateAnalyticsToken generates a JWT token for the Analytics API
func GenerateAnalyticsToken(userID uint, config *config.Config) (string, error) {
	// Create the claims
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * time.Duration(config.JWTExpiryHours)).Unix(),
		"iat":     time.Now().Unix(),
		"iss":     "finance-management-backend",
		"aud":     "finance-management-analytics",
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString([]byte(config.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
