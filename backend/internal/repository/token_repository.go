package repository

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// TokenRepository handles database operations for tokens
type TokenRepository struct {
	db *gorm.DB
}

// NewTokenRepository creates a new token repository
func NewTokenRepository(db *gorm.DB) *TokenRepository {
	return &TokenRepository{db: db}
}

// GenerateSecureToken generates a cryptographically secure random token
func GenerateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ==================== Password Reset Token ====================

// CreatePasswordResetToken creates a new password reset token
func (r *TokenRepository) CreatePasswordResetToken(userID uint) (*models.PasswordResetToken, error) {
	// Generate a secure token
	tokenStr, err := GenerateSecureToken(32)
	if err != nil {
		return nil, err
	}

	// Invalidate any existing tokens for this user
	r.db.Model(&models.PasswordResetToken{}).
		Where("user_id = ? AND used = ?", userID, false).
		Update("used", true)

	// Create new token (expires in 1 hour)
	token := &models.PasswordResetToken{
		UserID:    userID,
		Token:     tokenStr,
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
	}

	if err := r.db.Create(token).Error; err != nil {
		return nil, err
	}

	return token, nil
}

// GetPasswordResetToken gets a password reset token by token string
func (r *TokenRepository) GetPasswordResetToken(token string) (*models.PasswordResetToken, error) {
	var resetToken models.PasswordResetToken
	err := r.db.Where("token = ?", token).First(&resetToken).Error
	if err != nil {
		return nil, err
	}
	return &resetToken, nil
}

// MarkPasswordResetTokenUsed marks a password reset token as used
func (r *TokenRepository) MarkPasswordResetTokenUsed(tokenID uint) error {
	return r.db.Model(&models.PasswordResetToken{}).
		Where("id = ?", tokenID).
		Update("used", true).Error
}

// DeleteExpiredPasswordResetTokens deletes expired password reset tokens
func (r *TokenRepository) DeleteExpiredPasswordResetTokens() error {
	return r.db.Where("expires_at < ? OR used = ?", time.Now(), true).
		Delete(&models.PasswordResetToken{}).Error
}

// ==================== Email Verification Token ====================

// CreateEmailVerificationToken creates a new email verification token
func (r *TokenRepository) CreateEmailVerificationToken(userID uint, email string) (*models.EmailVerificationToken, error) {
	// Generate a secure token
	tokenStr, err := GenerateSecureToken(32)
	if err != nil {
		return nil, err
	}

	// Invalidate any existing tokens for this user
	r.db.Model(&models.EmailVerificationToken{}).
		Where("user_id = ? AND used = ?", userID, false).
		Update("used", true)

	// Create new token (expires in 24 hours)
	token := &models.EmailVerificationToken{
		UserID:    userID,
		Token:     tokenStr,
		Email:     email,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Used:      false,
	}

	if err := r.db.Create(token).Error; err != nil {
		return nil, err
	}

	return token, nil
}

// GetEmailVerificationToken gets an email verification token by token string
func (r *TokenRepository) GetEmailVerificationToken(token string) (*models.EmailVerificationToken, error) {
	var verificationToken models.EmailVerificationToken
	err := r.db.Where("token = ?", token).First(&verificationToken).Error
	if err != nil {
		return nil, err
	}
	return &verificationToken, nil
}

// MarkEmailVerificationTokenUsed marks an email verification token as used
func (r *TokenRepository) MarkEmailVerificationTokenUsed(tokenID uint) error {
	return r.db.Model(&models.EmailVerificationToken{}).
		Where("id = ?", tokenID).
		Update("used", true).Error
}

// DeleteExpiredEmailVerificationTokens deletes expired email verification tokens
func (r *TokenRepository) DeleteExpiredEmailVerificationTokens() error {
	return r.db.Where("expires_at < ? OR used = ?", time.Now(), true).
		Delete(&models.EmailVerificationToken{}).Error
}

