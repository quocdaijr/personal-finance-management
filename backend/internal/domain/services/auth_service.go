package services

import (
	"errors"

	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
)

type AuthService struct {
	userRepo *repository.UserRepository
	config   *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, config *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		config:   config,
	}
}

// Register registers a new user
func (s *AuthService) Register(req *models.RegisterRequest) (*models.UserResponse, error) {
	// Check if username already exists
	exists, err := s.userRepo.UsernameExists(req.Username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("username already exists")
	}

	// Check if email already exists
	exists, err = s.userRepo.EmailExists(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create the user
	user := &models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	// Save the user
	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	// Return the user response
	return user.ToResponse(), nil
}

// Login authenticates a user and returns a token
func (s *AuthService) Login(req *models.LoginRequest) (*models.TokenResponse, error) {
	// Get the user by username
	user, err := s.userRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify the password
	err = utils.VerifyPassword(user.Password, req.Password)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check if the user is active
	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Check if 2FA is enabled
	if user.TwoFactorEnabled {
		return nil, errors.New("2FA is enabled, please provide a token")
	}

	// Update last login time
	err = s.userRepo.UpdateLastLogin(user.ID)
	if err != nil {
		return nil, err
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	// Generate analytics token for Flask API
	analyticsToken, err := utils.GenerateAnalyticsToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	// Return the token response
	return &models.TokenResponse{
		AccessToken:    accessToken,
		RefreshToken:   refreshToken,
		AnalyticsToken: analyticsToken,
		ExpiresIn:      int64(s.config.JWTExpiryHours * 3600),
		TokenType:      "Bearer",
		User:           user.ToResponse(),
	}, nil
}

// VerifyTwoFactor verifies a 2FA token
func (s *AuthService) VerifyTwoFactor(req *models.TwoFactorRequest) (*models.TokenResponse, error) {
	// Get the user by username
	user, err := s.userRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check if 2FA is enabled
	if !user.TwoFactorEnabled {
		return nil, errors.New("2FA is not enabled for this account")
	}

	// Verify the token
	valid := utils.ValidateTOTP(req.Token, user.TwoFactorSecret)
	if !valid {
		return nil, errors.New("invalid 2FA token")
	}

	// Update last login time
	err = s.userRepo.UpdateLastLogin(user.ID)
	if err != nil {
		return nil, err
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	// Return the token response
	return &models.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.config.JWTExpiryHours * 3600),
		TokenType:    "Bearer",
		User:         user.ToResponse(),
	}, nil
}

// RefreshToken refreshes an access token
func (s *AuthService) RefreshToken(req *models.RefreshTokenRequest) (*models.TokenResponse, error) {
	// Validate the refresh token
	claims, err := utils.ValidateRefreshToken(req.RefreshToken, s.config)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get the user
	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if the user is active
	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Generate a new access token
	accessToken, err := utils.GenerateToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	// Generate a new refresh token
	refreshToken, err := utils.GenerateRefreshToken(user.ID, s.config)
	if err != nil {
		return nil, err
	}

	// Return the token response
	return &models.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.config.JWTExpiryHours * 3600),
		TokenType:    "Bearer",
		User:         user.ToResponse(),
	}, nil
}

// SetupTwoFactor sets up 2FA for a user
func (s *AuthService) SetupTwoFactor(userID uint) (*models.TwoFactorSetupResponse, error) {
	// Get the user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Generate a new TOTP secret
	key, err := utils.GenerateTOTPSecret(user.Username, s.config.AppName)
	if err != nil {
		return nil, err
	}

	// Save the secret
	err = s.userRepo.UpdateTwoFactorSecret(user.ID, key.Secret())
	if err != nil {
		return nil, err
	}

	// Return the setup response
	return &models.TwoFactorSetupResponse{
		Secret:    key.Secret(),
		QRCodeURL: key.URL(),
	}, nil
}

// DisableTwoFactor disables 2FA for a user
func (s *AuthService) DisableTwoFactor(userID uint) error {
	// Get the user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	// Disable 2FA
	err = s.userRepo.DisableTwoFactor(user.ID)
	if err != nil {
		return err
	}

	return nil
}

// ChangePassword changes a user's password
func (s *AuthService) ChangePassword(userID uint, req *models.PasswordUpdateRequest) error {
	// Get the user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	// Verify the old password
	err = utils.VerifyPassword(user.Password, req.OldPassword)
	if err != nil {
		return errors.New("invalid old password")
	}

	// Hash the new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// Update the password
	err = s.userRepo.UpdatePassword(user.ID, hashedPassword)
	if err != nil {
		return err
	}

	return nil
}

// GetUserByID gets a user by ID
func (s *AuthService) GetUserByID(userID uint) (*models.UserResponse, error) {
	// Get the user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Return the user response
	return user.ToResponse(), nil
}

// UpdateUser updates a user's profile
func (s *AuthService) UpdateUser(userID uint, firstName, lastName string) (*models.UserResponse, error) {
	// Get the user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Update the user
	user.FirstName = firstName
	user.LastName = lastName

	// Save the user
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	// Return the user response
	return user.ToResponse(), nil
}
