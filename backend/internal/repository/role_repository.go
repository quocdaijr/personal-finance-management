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

// UserRoleRepository handles database operations for user role assignments
type UserRoleRepository struct {
	db *gorm.DB
}

// NewUserRoleRepository creates a new user role repository
func NewUserRoleRepository(db *gorm.DB) *UserRoleRepository {
	return &UserRoleRepository{db: db}
}

// Create creates a new user role assignment
func (r *UserRoleRepository) Create(userRole *models.UserRole) error {
	return r.db.Create(userRole).Error
}

// GetByID gets a user role by ID
func (r *UserRoleRepository) GetByID(id uint) (*models.UserRole, error) {
	var userRole models.UserRole
	err := r.db.Preload("User").Preload("Role").Preload("Account").
		Where("id = ?", id).First(&userRole).Error
	if err != nil {
		return nil, err
	}
	return &userRole, nil
}

// GetByUser gets all role assignments for a user
func (r *UserRoleRepository) GetByUser(userID uint) ([]models.UserRole, error) {
	var userRoles []models.UserRole
	err := r.db.Preload("Role").Preload("Account").
		Where("user_id = ?", userID).
		Find(&userRoles).Error
	return userRoles, err
}

// GetByUserAndAccount gets role assignments for a user in an account
func (r *UserRoleRepository) GetByUserAndAccount(userID, accountID uint) ([]models.UserRole, error) {
	var userRoles []models.UserRole
	err := r.db.Preload("Role").
		Where("user_id = ? AND account_id = ?", userID, accountID).
		Find(&userRoles).Error
	return userRoles, err
}

// GetByAccount gets all role assignments for an account
func (r *UserRoleRepository) GetByAccount(accountID uint) ([]models.UserRole, error) {
	var userRoles []models.UserRole
	err := r.db.Preload("User").Preload("Role").
		Where("account_id = ?", accountID).
		Find(&userRoles).Error
	return userRoles, err
}

// Delete deletes a user role assignment
func (r *UserRoleRepository) Delete(id uint) error {
	return r.db.Delete(&models.UserRole{}, id).Error
}

// DeleteByUserAndAccount deletes all role assignments for a user in an account
func (r *UserRoleRepository) DeleteByUserAndAccount(userID, accountID uint) error {
	return r.db.Where("user_id = ? AND account_id = ?", userID, accountID).
		Delete(&models.UserRole{}).Error
}

// PermissionAuditLogRepository handles database operations for permission audit logs
type PermissionAuditLogRepository struct {
	db *gorm.DB
}

// NewPermissionAuditLogRepository creates a new permission audit log repository
func NewPermissionAuditLogRepository(db *gorm.DB) *PermissionAuditLogRepository {
	return &PermissionAuditLogRepository{db: db}
}

// Create creates a new permission audit log entry
func (r *PermissionAuditLogRepository) Create(log *models.PermissionAuditLog) error {
	return r.db.Create(log).Error
}

// GetByUser gets audit logs for a user
func (r *PermissionAuditLogRepository) GetByUser(userID uint, limit int) ([]models.PermissionAuditLog, error) {
	var logs []models.PermissionAuditLog
	query := r.db.Where("user_id = ?", userID).Order("created_at DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&logs).Error
	return logs, err
}

// GetDenied gets all denied permission checks
func (r *PermissionAuditLogRepository) GetDenied(limit int) ([]models.PermissionAuditLog, error) {
	var logs []models.PermissionAuditLog
	query := r.db.Preload("User").
		Where("granted = ?", false).
		Order("created_at DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&logs).Error
	return logs, err
}

// GetByResource gets audit logs for a specific resource
func (r *PermissionAuditLogRepository) GetByResource(resourceType string, resourceID uint) ([]models.PermissionAuditLog, error) {
	var logs []models.PermissionAuditLog
	err := r.db.Preload("User").
		Where("resource_type = ? AND resource_id = ?", resourceType, resourceID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}
