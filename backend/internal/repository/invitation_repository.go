package repository

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// InvitationRepository handles database operations for invitations
type InvitationRepository struct {
	db *gorm.DB
}

// NewInvitationRepository creates a new invitation repository
func NewInvitationRepository(db *gorm.DB) *InvitationRepository {
	return &InvitationRepository{db: db}
}

// Create creates a new invitation
func (r *InvitationRepository) Create(invitation *models.Invitation) error {
	return r.db.Create(invitation).Error
}

// GetByID gets an invitation by ID
func (r *InvitationRepository) GetByID(id uint) (*models.Invitation, error) {
	var invitation models.Invitation
	err := r.db.Preload("Account").Preload("Inviter").
		Where("id = ?", id).First(&invitation).Error
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

// GetByToken gets an invitation by token
func (r *InvitationRepository) GetByToken(token string) (*models.Invitation, error) {
	var invitation models.Invitation
	err := r.db.Preload("Account").Preload("Inviter").
		Where("token = ?", token).First(&invitation).Error
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

// GetByAccount gets all invitations for an account
func (r *InvitationRepository) GetByAccount(accountID uint) ([]models.Invitation, error) {
	var invitations []models.Invitation
	err := r.db.Preload("Inviter").
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&invitations).Error
	return invitations, err
}

// GetByEmail gets all invitations for an email
func (r *InvitationRepository) GetByEmail(email string) ([]models.Invitation, error) {
	var invitations []models.Invitation
	err := r.db.Preload("Account").Preload("Inviter").
		Where("email = ?", email).
		Order("created_at DESC").
		Find(&invitations).Error
	return invitations, err
}

// GetPendingByEmail gets pending invitations for an email
func (r *InvitationRepository) GetPendingByEmail(email string) ([]models.Invitation, error) {
	var invitations []models.Invitation
	err := r.db.Preload("Account").Preload("Inviter").
		Where("email = ? AND status = ? AND expires_at > ?", email, "pending", time.Now()).
		Order("created_at DESC").
		Find(&invitations).Error
	return invitations, err
}

// Update updates an invitation
func (r *InvitationRepository) Update(invitation *models.Invitation) error {
	return r.db.Save(invitation).Error
}

// UpdateStatus updates the status of an invitation
func (r *InvitationRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Invitation{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// Delete deletes an invitation
func (r *InvitationRepository) Delete(id uint) error {
	return r.db.Delete(&models.Invitation{}, id).Error
}

// Revoke revokes an invitation
func (r *InvitationRepository) Revoke(id uint) error {
	return r.UpdateStatus(id, "revoked")
}

// ExpireOldInvitations marks expired invitations as expired
func (r *InvitationRepository) ExpireOldInvitations() error {
	return r.db.Model(&models.Invitation{}).
		Where("status = ? AND expires_at < ?", "pending", time.Now()).
		Update("status", "expired").Error
}

// ExistsByAccountAndEmail checks if an active invitation exists
func (r *InvitationRepository) ExistsByAccountAndEmail(accountID uint, email string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Invitation{}).
		Where("account_id = ? AND email = ? AND status = ? AND expires_at > ?",
			accountID, email, "pending", time.Now()).
		Count(&count).Error
	return count > 0, err
}
