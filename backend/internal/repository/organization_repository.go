package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// OrganizationRepository handles database operations for organizations
type OrganizationRepository struct {
	db *gorm.DB
}

// NewOrganizationRepository creates a new organization repository
func NewOrganizationRepository(db *gorm.DB) *OrganizationRepository {
	return &OrganizationRepository{db: db}
}

// Create creates a new organization
func (r *OrganizationRepository) Create(org *models.Organization) error {
	return r.db.Create(org).Error
}

// GetByID gets an organization by ID
func (r *OrganizationRepository) GetByID(id uint) (*models.Organization, error) {
	var org models.Organization
	err := r.db.Preload("Owner").Preload("Departments").Preload("Departments.Manager").
		Where("id = ?", id).First(&org).Error
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// GetByOwner gets all organizations owned by a user
func (r *OrganizationRepository) GetByOwner(ownerID uint) ([]models.Organization, error) {
	var orgs []models.Organization
	err := r.db.Preload("Departments").
		Where("owner_id = ?", ownerID).
		Find(&orgs).Error
	return orgs, err
}

// Update updates an organization
func (r *OrganizationRepository) Update(org *models.Organization) error {
	return r.db.Save(org).Error
}

// Delete deletes an organization
func (r *OrganizationRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete all departments first
		if err := tx.Where("organization_id = ?", id).Delete(&models.Department{}).Error; err != nil {
			return err
		}
		// Delete organization
		return tx.Delete(&models.Organization{}, id).Error
	})
}

// DepartmentRepository handles database operations for departments
type DepartmentRepository struct {
	db *gorm.DB
}

// NewDepartmentRepository creates a new department repository
func NewDepartmentRepository(db *gorm.DB) *DepartmentRepository {
	return &DepartmentRepository{db: db}
}

// Create creates a new department
func (r *DepartmentRepository) Create(dept *models.Department) error {
	return r.db.Create(dept).Error
}

// GetByID gets a department by ID
func (r *DepartmentRepository) GetByID(id uint) (*models.Department, error) {
	var dept models.Department
	err := r.db.Preload("Organization").Preload("Manager").
		Where("id = ?", id).First(&dept).Error
	if err != nil {
		return nil, err
	}
	return &dept, nil
}

// GetByOrganization gets all departments for an organization
func (r *DepartmentRepository) GetByOrganization(orgID uint) ([]models.Department, error) {
	var depts []models.Department
	err := r.db.Preload("Manager").
		Where("organization_id = ?", orgID).
		Find(&depts).Error
	return depts, err
}

// Update updates a department
func (r *DepartmentRepository) Update(dept *models.Department) error {
	return r.db.Save(dept).Error
}

// Delete deletes a department
func (r *DepartmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Department{}, id).Error
}

// ReimbursementRepository handles database operations for reimbursements
type ReimbursementRepository struct {
	db *gorm.DB
}

// NewReimbursementRepository creates a new reimbursement repository
func NewReimbursementRepository(db *gorm.DB) *ReimbursementRepository {
	return &ReimbursementRepository{db: db}
}

// Create creates a new reimbursement
func (r *ReimbursementRepository) Create(reimbursement *models.Reimbursement) error {
	return r.db.Create(reimbursement).Error
}

// GetByID gets a reimbursement by ID
func (r *ReimbursementRepository) GetByID(id uint) (*models.Reimbursement, error) {
	var reimbursement models.Reimbursement
	err := r.db.Preload("Organization").Preload("Employee").
		Preload("Transaction").Preload("Approver").
		Where("id = ?", id).First(&reimbursement).Error
	if err != nil {
		return nil, err
	}
	return &reimbursement, nil
}

// GetByOrganization gets all reimbursements for an organization
func (r *ReimbursementRepository) GetByOrganization(orgID uint) ([]models.Reimbursement, error) {
	var reimbursements []models.Reimbursement
	err := r.db.Preload("Employee").Preload("Approver").
		Where("organization_id = ?", orgID).
		Order("created_at DESC").
		Find(&reimbursements).Error
	return reimbursements, err
}

// GetByEmployee gets all reimbursements for an employee
func (r *ReimbursementRepository) GetByEmployee(employeeID uint) ([]models.Reimbursement, error) {
	var reimbursements []models.Reimbursement
	err := r.db.Preload("Organization").Preload("Approver").
		Where("employee_id = ?", employeeID).
		Order("created_at DESC").
		Find(&reimbursements).Error
	return reimbursements, err
}

// GetPending gets all pending reimbursements for an organization
func (r *ReimbursementRepository) GetPending(orgID uint) ([]models.Reimbursement, error) {
	var reimbursements []models.Reimbursement
	err := r.db.Preload("Employee").
		Where("organization_id = ? AND status = ?", orgID, "pending").
		Order("created_at ASC").
		Find(&reimbursements).Error
	return reimbursements, err
}

// Update updates a reimbursement
func (r *ReimbursementRepository) Update(reimbursement *models.Reimbursement) error {
	return r.db.Save(reimbursement).Error
}

// UpdateStatus updates the status of a reimbursement
func (r *ReimbursementRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Reimbursement{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// Delete deletes a reimbursement
func (r *ReimbursementRepository) Delete(id uint) error {
	return r.db.Delete(&models.Reimbursement{}, id).Error
}
