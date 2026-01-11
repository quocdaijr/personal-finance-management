package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// RoleRepository handles database operations for roles
type RoleRepository struct {
	db *gorm.DB
}

// NewRoleRepository creates a new role repository
func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

// Create creates a new role
func (r *RoleRepository) Create(role *models.Role) error {
	return r.db.Create(role).Error
}

// GetByID gets a role by ID
func (r *RoleRepository) GetByID(id uint) (*models.Role, error) {
	var role models.Role
	err := r.db.Where("id = ?", id).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// GetByAccount gets all roles for an account (including system roles)
func (r *RoleRepository) GetByAccount(accountID uint) ([]models.Role, error) {
	var roles []models.Role
	err := r.db.Where("account_id = ? OR is_system_role = ?", accountID, true).
		Find(&roles).Error
	return roles, err
}

// GetSystemRoles gets all system roles
func (r *RoleRepository) GetSystemRoles() ([]models.Role, error) {
	var roles []models.Role
	err := r.db.Where("is_system_role = ?", true).Find(&roles).Error
	return roles, err
}

// GetByName gets a role by name and account
func (r *RoleRepository) GetByName(name string, accountID *uint) (*models.Role, error) {
	var role models.Role
	query := r.db.Where("name = ?", name)
	if accountID != nil {
		query = query.Where("account_id = ?", accountID)
	} else {
		query = query.Where("is_system_role = ?", true)
	}
	err := query.First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// Update updates a role
func (r *RoleRepository) Update(role *models.Role) error {
	return r.db.Save(role).Error
}

// Delete deletes a role (only custom roles)
func (r *RoleRepository) Delete(id uint) error {
	return r.db.Where("id = ? AND is_system_role = ?", id, false).
		Delete(&models.Role{}).Error
}
