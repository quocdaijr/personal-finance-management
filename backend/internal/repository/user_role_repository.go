package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// UserRoleRepository handles database operations for user roles
type UserRoleRepository struct {
	db *gorm.DB
}

// NewUserRoleRepository creates a new user role repository
func NewUserRoleRepository(db *gorm.DB) *UserRoleRepository {
	return &UserRoleRepository{db: db}
}

// Create creates a new user role assignment
func (r *UserRoleRepository) Create(userRole *models.UserRole) error {
	if userRole == nil {
		return gorm.ErrInvalidData
	}
	return r.db.Create(userRole).Error
}

// GetByID gets a user role assignment by ID
func (r *UserRoleRepository) GetByID(id uint) (*models.UserRole, error) {
	var userRole models.UserRole
	err := r.db.Preload("User").Preload("Role").Preload("Assigner").
		Where("id = ?", id).First(&userRole).Error
	if err != nil {
		return nil, err
	}
	return &userRole, nil
}

// GetByUserID gets all role assignments for a user
func (r *UserRoleRepository) GetByUserID(userID uint) ([]models.UserRole, error) {
	var userRoles []models.UserRole
	err := r.db.Preload("Role").Where("user_id = ?", userID).Find(&userRoles).Error
	return userRoles, err
}

// GetByAccountID gets all role assignments for an account
func (r *UserRoleRepository) GetByAccountID(accountID uint) ([]models.UserRole, error) {
	var userRoles []models.UserRole
	err := r.db.Preload("User").Preload("Role").
		Where("account_id = ?", accountID).Find(&userRoles).Error
	return userRoles, err
}

// Update updates a user role assignment
func (r *UserRoleRepository) Update(userRole *models.UserRole) error {
	if userRole == nil {
		return gorm.ErrInvalidData
	}
	return r.db.Save(userRole).Error
}

// Delete deletes a user role assignment
func (r *UserRoleRepository) Delete(id uint) error {
	return r.db.Where("id = ?", id).Delete(&models.UserRole{}).Error
}

// DeleteByUserAndRole deletes a role assignment for a specific user and role
func (r *UserRoleRepository) DeleteByUserAndRole(userID, roleID, accountID uint) error {
	return r.db.Where("user_id = ? AND role_id = ? AND account_id = ?", userID, roleID, accountID).
		Delete(&models.UserRole{}).Error
}
