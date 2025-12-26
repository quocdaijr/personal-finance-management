package services

import (
	"testing"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/quocdaijr/finance-management-backend/internal/services"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupAuthTestDB creates an in-memory SQLite database for auth testing
func setupAuthTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto-migrate models
	err = db.AutoMigrate(&models.User{}, &models.Token{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

// setupAuthService creates a configured auth service for testing
func setupAuthService(t *testing.T, db *gorm.DB) *AuthService {
	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewTokenRepository(db)
	emailService := services.NewEmailService() // Mock email service

	cfg := &config.Config{
		JWTSecret:       "test-secret-key",
		JWTExpiryHours:  24,
		Environment:     "test",
		EmailEnabled:    false, // Disable actual email sending in tests
	}

	return NewAuthService(userRepo, tokenRepo, emailService, cfg)
}

func TestAuthService_Register(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Test data
	req := &models.RegisterRequest{
		Username:  "testuser",
		Email:     "test@example.com",
		Password:  "password123",
		FirstName: "Test",
		LastName:  "User",
	}

	// Execute
	response, err := service.Register(req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, "testuser", response.Username)
	assert.Equal(t, "test@example.com", response.Email)
	assert.Equal(t, "Test", response.FirstName)
	assert.Equal(t, "User", response.LastName)
	assert.False(t, response.IsEmailVerified) // Should be false initially

	// Verify password was hashed
	var user models.User
	db.Where("username = ?", "testuser").First(&user)
	assert.NotEqual(t, "password123", user.Password)
}

func TestAuthService_Register_DuplicateUsername(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Create initial user
	req1 := &models.RegisterRequest{
		Username: "testuser",
		Email:    "test1@example.com",
		Password: "password123",
	}
	service.Register(req1)

	// Try to register with same username
	req2 := &models.RegisterRequest{
		Username: "testuser",
		Email:    "test2@example.com",
		Password: "password456",
	}

	// Execute
	response, err := service.Register(req2)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "username already exists")
}

func TestAuthService_Register_DuplicateEmail(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Create initial user
	req1 := &models.RegisterRequest{
		Username: "testuser1",
		Email:    "test@example.com",
		Password: "password123",
	}
	service.Register(req1)

	// Try to register with same email
	req2 := &models.RegisterRequest{
		Username: "testuser2",
		Email:    "test@example.com",
		Password: "password456",
	}

	// Execute
	response, err := service.Register(req2)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "email already exists")
}

func TestAuthService_Login(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Register a user first
	hashedPassword, _ := utils.HashPassword("password123")
	user := &models.User{
		Username:  "testuser",
		Email:     "test@example.com",
		Password:  hashedPassword,
		IsActive:  true,
		TwoFactorEnabled: false,
	}
	db.Create(user)

	// Test data
	req := &models.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	// Execute
	response, err := service.Login(req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.NotEmpty(t, response.AccessToken)
	assert.NotEmpty(t, response.RefreshToken)
	assert.Equal(t, "Bearer", response.TokenType)
	assert.NotNil(t, response.User)
	assert.Equal(t, "testuser", response.User.Username)
}

func TestAuthService_Login_InvalidPassword(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Register a user
	hashedPassword, _ := utils.HashPassword("password123")
	user := &models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: hashedPassword,
		IsActive: true,
	}
	db.Create(user)

	// Test data - wrong password
	req := &models.LoginRequest{
		Username: "testuser",
		Password: "wrongpassword",
	}

	// Execute
	response, err := service.Login(req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "invalid credentials")
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Test data - non-existent user
	req := &models.LoginRequest{
		Username: "nonexistent",
		Password: "password123",
	}

	// Execute
	response, err := service.Login(req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "invalid credentials")
}

func TestAuthService_Login_InactiveUser(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Register an inactive user
	hashedPassword, _ := utils.HashPassword("password123")
	user := &models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: hashedPassword,
		IsActive: false, // Inactive
	}
	db.Create(user)

	// Test data
	req := &models.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	// Execute
	response, err := service.Login(req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "account is disabled")
}

func TestAuthService_Login_With2FAEnabled(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Register a user with 2FA enabled
	hashedPassword, _ := utils.HashPassword("password123")
	user := &models.User{
		Username:         "testuser",
		Email:            "test@example.com",
		Password:         hashedPassword,
		IsActive:         true,
		TwoFactorEnabled: true,
		TwoFactorSecret:  "secret123",
	}
	db.Create(user)

	// Test data
	req := &models.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	// Execute
	response, err := service.Login(req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "2FA is enabled")
}

func TestAuthService_RefreshToken(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Create a user
	hashedPassword, _ := utils.HashPassword("password123")
	user := &models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: hashedPassword,
		IsActive: true,
	}
	db.Create(user)

	// Login to get tokens
	loginReq := &models.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}
	loginResponse, _ := service.Login(loginReq)

	// Test data
	req := &models.RefreshTokenRequest{
		RefreshToken: loginResponse.RefreshToken,
	}

	// Execute
	response, err := service.RefreshToken(req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.NotEmpty(t, response.AccessToken)
	assert.NotEmpty(t, response.RefreshToken)
	assert.Equal(t, "Bearer", response.TokenType)
}

func TestAuthService_RefreshToken_Invalid(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Test data - invalid token
	req := &models.RefreshTokenRequest{
		RefreshToken: "invalid.token.here",
	}

	// Execute
	response, err := service.RefreshToken(req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "invalid refresh token")
}

func TestAuthService_Login_LastLoginUpdated(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Create a user with old last login
	hashedPassword, _ := utils.HashPassword("password123")
	oldTime := time.Now().Add(-24 * time.Hour)
	user := &models.User{
		Username:  "testuser",
		Email:     "test@example.com",
		Password:  hashedPassword,
		IsActive:  true,
		LastLogin: &oldTime,
	}
	db.Create(user)

	// Login
	req := &models.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}
	service.Login(req)

	// Verify last login was updated
	var updatedUser models.User
	db.First(&updatedUser, user.ID)
	assert.NotNil(t, updatedUser.LastLogin)
	assert.True(t, updatedUser.LastLogin.After(oldTime))
}

func TestAuthService_Register_PasswordHashing(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Test data
	plainPassword := "mySecurePassword123!"
	req := &models.RegisterRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: plainPassword,
	}

	// Execute
	response, err := service.Register(req)

	// Assert
	assert.NoError(t, err)

	// Verify password was hashed (not stored in plain text)
	var user models.User
	db.First(&user, response.ID)
	assert.NotEqual(t, plainPassword, user.Password)
	assert.NotEmpty(t, user.Password)

	// Verify the hash can be verified with original password
	err = utils.VerifyPassword(user.Password, plainPassword)
	assert.NoError(t, err)
}

func TestAuthService_TokenResponse_ContainsRequiredFields(t *testing.T) {
	// Setup
	db := setupAuthTestDB(t)
	service := setupAuthService(t, db)

	// Create and login user
	hashedPassword, _ := utils.HashPassword("password123")
	user := &models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: hashedPassword,
		IsActive: true,
	}
	db.Create(user)

	req := &models.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	// Execute
	response, err := service.Login(req)

	// Assert all required fields are present
	assert.NoError(t, err)
	assert.NotEmpty(t, response.AccessToken, "AccessToken should not be empty")
	assert.NotEmpty(t, response.RefreshToken, "RefreshToken should not be empty")
	assert.NotEmpty(t, response.AnalyticsToken, "AnalyticsToken should not be empty")
	assert.Greater(t, response.ExpiresIn, int64(0), "ExpiresIn should be positive")
	assert.Equal(t, "Bearer", response.TokenType, "TokenType should be Bearer")
	assert.NotNil(t, response.User, "User should not be nil")
}
