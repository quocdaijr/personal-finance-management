package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// AccountMemberRepository handles database operations for account members
type AccountMemberRepository struct {
	db *gorm.DB
}

// NewAccountMemberRepository creates a new account member repository
func NewAccountMemberRepository(db *gorm.DB) *AccountMemberRepository {
	return &AccountMemberRepository{db: db}
}

// Create creates a new account member
func (r *AccountMemberRepository) Create(member *models.AccountMember) error {
	return r.db.Create(member).Error
}

// GetByID gets an account member by ID
func (r *AccountMemberRepository) GetByID(id uint) (*models.AccountMember, error) {
	var member models.AccountMember
	err := r.db.Preload("User").Preload("Account").
		Where("id = ?", id).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetByAccountAndUser gets a member by account ID and user ID
func (r *AccountMemberRepository) GetByAccountAndUser(accountID, userID uint) (*models.AccountMember, error) {
	var member models.AccountMember
	err := r.db.Where("account_id = ? AND user_id = ?", accountID, userID).
		First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetByAccount gets all members for an account
func (r *AccountMemberRepository) GetByAccount(accountID uint) ([]models.AccountMember, error) {
	var members []models.AccountMember
	err := r.db.Preload("User").
		Where("account_id = ? AND status = ?", accountID, "active").
		Find(&members).Error
	return members, err
}

// GetByUser gets all account memberships for a user
func (r *AccountMemberRepository) GetByUser(userID uint) ([]models.AccountMember, error) {
	var members []models.AccountMember
	err := r.db.Preload("Account").
		Where("user_id = ? AND status = ?", userID, "active").
		Find(&members).Error
	return members, err
}

// Update updates an account member
func (r *AccountMemberRepository) Update(member *models.AccountMember) error {
	return r.db.Save(member).Error
}

// UpdateRole updates a member's role
func (r *AccountMemberRepository) UpdateRole(id uint, role, permissions string) error {
	return r.db.Model(&models.AccountMember{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"role":        role,
			"permissions": permissions,
		}).Error
}

// Delete deletes an account member (revokes access)
func (r *AccountMemberRepository) Delete(id uint) error {
	return r.db.Model(&models.AccountMember{}).
		Where("id = ?", id).
		Update("status", "revoked").Error
}

// HasAccess checks if a user has access to an account
func (r *AccountMemberRepository) HasAccess(accountID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.AccountMember{}).
		Where("account_id = ? AND user_id = ? AND status = ?", accountID, userID, "active").
		Count(&count).Error
	return count > 0, err
}

// GetRole gets a user's role for an account
func (r *AccountMemberRepository) GetRole(accountID, userID uint) (string, error) {
	var member models.AccountMember
	err := r.db.Select("role").
		Where("account_id = ? AND user_id = ? AND status = ?", accountID, userID, "active").
		First(&member).Error
	if err != nil {
		return "", err
	}
	return member.Role, nil
}

// IsOwner checks if a user is the owner of an account
func (r *AccountMemberRepository) IsOwner(accountID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.AccountMember{}).
		Where("account_id = ? AND user_id = ? AND role = ? AND status = ?",
			accountID, userID, "owner", "active").
		Count(&count).Error
	return count > 0, err
}
