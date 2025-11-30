package services

import (
	"errors"

	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/quocdaijr/finance-management-backend/internal/services"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
)

type AuthService struct {
	userRepo     *repository.UserRepository
	tokenRepo    *repository.TokenRepository
	emailService *services.EmailService
	config       *config.Config
}

func NewAuthService(
	userRepo *repository.UserRepository,
	tokenRepo *repository.TokenRepository,
	emailService *services.EmailService,
	config *config.Config,
) *AuthService {
	return &AuthService{
		userRepo:     userRepo,
		tokenRepo:    tokenRepo,
		emailService: emailService,
		config:       config,
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
		Username:        req.Username,
		Email:           req.Email,
		Password:        hashedPassword,
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		IsEmailVerified: false, // Will be verified via email
	}

	// Save the user
	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	// Send email verification (don't fail registration if email fails)
	_ = s.CreateEmailVerificationOnRegister(user)

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
func (s *AuthService) UpdateUser(userID uint, firstName, lastName, preferredCurrency, dateFormat, preferredLanguage string) (*models.UserResponse, error) {
	// Get the user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Update the user
	user.FirstName = firstName
	user.LastName = lastName

	// Update preferences if provided
	if preferredCurrency != "" {
		user.PreferredCurrency = preferredCurrency
	}
	if dateFormat != "" {
		user.DateFormat = dateFormat
	}
	if preferredLanguage != "" {
		user.PreferredLanguage = preferredLanguage
	}

	// Save the user
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	// Return the user response
	return user.ToResponse(), nil
}

// ForgotPassword initiates the password reset process
func (s *AuthService) ForgotPassword(req *models.ForgotPasswordRequest) (*models.ForgotPasswordResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		// Don't reveal if email exists or not for security
		return &models.ForgotPasswordResponse{
			Message: "If the email exists, a password reset link will be sent",
		}, nil
	}

	// Check if user is active
	if !user.IsActive {
		return &models.ForgotPasswordResponse{
			Message: "If the email exists, a password reset link will be sent",
		}, nil
	}

	// Create password reset token
	token, err := s.tokenRepo.CreatePasswordResetToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to create password reset token")
	}

	// Send password reset email
	err = s.emailService.SendPasswordResetEmail(user.Email, token.Token)
	if err != nil {
		return nil, errors.New("failed to send password reset email")
	}

	return &models.ForgotPasswordResponse{
		Message: "If the email exists, a password reset link will be sent",
	}, nil
}

// ResetPassword resets the user's password using a reset token
func (s *AuthService) ResetPassword(req *models.ResetPasswordRequest) (*models.ResetPasswordResponse, error) {
	// Get the reset token
	token, err := s.tokenRepo.GetPasswordResetToken(req.Token)
	if err != nil {
		return nil, errors.New("invalid or expired reset token")
	}

	// Check if token is valid
	if !token.IsValid() {
		return nil, errors.New("invalid or expired reset token")
	}

	// Get the user
	user, err := s.userRepo.GetByID(token.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Hash the new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Update the password
	err = s.userRepo.UpdatePassword(user.ID, hashedPassword)
	if err != nil {
		return nil, errors.New("failed to update password")
	}

	// Mark token as used
	err = s.tokenRepo.MarkPasswordResetTokenUsed(token.ID)
	if err != nil {
		// Log but don't fail - password was already updated
	}

	return &models.ResetPasswordResponse{
		Message: "Password has been reset successfully",
	}, nil
}

// VerifyEmail verifies a user's email address
func (s *AuthService) VerifyEmail(req *models.VerifyEmailRequest) (*models.VerifyEmailResponse, error) {
	// Get the verification token
	token, err := s.tokenRepo.GetEmailVerificationToken(req.Token)
	if err != nil {
		return nil, errors.New("invalid or expired verification token")
	}

	// Check if token is valid
	if !token.IsValid() {
		return nil, errors.New("invalid or expired verification token")
	}

	// Get the user
	user, err := s.userRepo.GetByID(token.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if email is already verified
	if user.IsEmailVerified {
		return &models.VerifyEmailResponse{
			Message: "Email is already verified",
			User:    user.ToResponse(),
		}, nil
	}

	// Verify the email
	err = s.userRepo.VerifyEmail(user.ID)
	if err != nil {
		return nil, errors.New("failed to verify email")
	}

	// Mark token as used
	err = s.tokenRepo.MarkEmailVerificationTokenUsed(token.ID)
	if err != nil {
		// Log but don't fail - email was already verified
	}

	// Get updated user
	user, _ = s.userRepo.GetByID(user.ID)

	return &models.VerifyEmailResponse{
		Message: "Email verified successfully",
		User:    user.ToResponse(),
	}, nil
}

// ResendVerificationEmail resends the email verification email
func (s *AuthService) ResendVerificationEmail(req *models.ResendVerificationRequest) (*models.ResendVerificationResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		// Don't reveal if email exists or not for security
		return &models.ResendVerificationResponse{
			Message: "If the email exists and is not verified, a verification link will be sent",
		}, nil
	}

	// Check if already verified
	if user.IsEmailVerified {
		return &models.ResendVerificationResponse{
			Message: "If the email exists and is not verified, a verification link will be sent",
		}, nil
	}

	// Create email verification token
	token, err := s.tokenRepo.CreateEmailVerificationToken(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("failed to create verification token")
	}

	// Send verification email
	err = s.emailService.SendEmailVerification(user.Email, token.Token)
	if err != nil {
		return nil, errors.New("failed to send verification email")
	}

	return &models.ResendVerificationResponse{
		Message: "If the email exists and is not verified, a verification link will be sent",
	}, nil
}

// CreateEmailVerificationOnRegister creates an email verification token for a newly registered user
func (s *AuthService) CreateEmailVerificationOnRegister(user *models.User) error {
	// Create email verification token
	token, err := s.tokenRepo.CreateEmailVerificationToken(user.ID, user.Email)
	if err != nil {
		return err
	}

	// Send verification email
	return s.emailService.SendEmailVerification(user.Email, token.Token)
}
