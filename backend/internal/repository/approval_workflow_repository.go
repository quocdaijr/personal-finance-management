package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// ApprovalWorkflowRepository handles database operations for approval workflows
type ApprovalWorkflowRepository struct {
	db *gorm.DB
}

// NewApprovalWorkflowRepository creates a new approval workflow repository
func NewApprovalWorkflowRepository(db *gorm.DB) *ApprovalWorkflowRepository {
	return &ApprovalWorkflowRepository{db: db}
}

// Create creates a new approval workflow
func (r *ApprovalWorkflowRepository) Create(workflow *models.ApprovalWorkflow) error {
	return r.db.Create(workflow).Error
}

// GetByID gets an approval workflow by ID
func (r *ApprovalWorkflowRepository) GetByID(id uint) (*models.ApprovalWorkflow, error) {
	var workflow models.ApprovalWorkflow
	err := r.db.Preload("Account").Preload("Transaction").
		Preload("Requester").Preload("Approver").
		Where("id = ?", id).First(&workflow).Error
	if err != nil {
		return nil, err
	}
	return &workflow, nil
}

// GetByTransaction gets approval workflow for a transaction
func (r *ApprovalWorkflowRepository) GetByTransaction(transactionID uint) (*models.ApprovalWorkflow, error) {
	var workflow models.ApprovalWorkflow
	err := r.db.Preload("Account").Preload("Requester").Preload("Approver").
		Where("transaction_id = ?", transactionID).
		Order("created_at DESC").
		First(&workflow).Error
	if err != nil {
		return nil, err
	}
	return &workflow, nil
}

// GetByAccount gets all approval workflows for an account
func (r *ApprovalWorkflowRepository) GetByAccount(accountID uint) ([]models.ApprovalWorkflow, error) {
	var workflows []models.ApprovalWorkflow
	err := r.db.Preload("Transaction").Preload("Requester").Preload("Approver").
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&workflows).Error
	return workflows, err
}

// GetPending gets all pending approvals for an account
func (r *ApprovalWorkflowRepository) GetPending(accountID uint) ([]models.ApprovalWorkflow, error) {
	var workflows []models.ApprovalWorkflow
	err := r.db.Preload("Transaction").Preload("Requester").
		Where("account_id = ? AND status = ?", accountID, "pending").
		Order("created_at ASC").
		Find(&workflows).Error
	return workflows, err
}

// GetPendingByUser gets pending approvals that a user can approve
func (r *ApprovalWorkflowRepository) GetPendingByUser(accountID, userID uint) ([]models.ApprovalWorkflow, error) {
	var workflows []models.ApprovalWorkflow
	err := r.db.Preload("Transaction").Preload("Requester").
		Where("account_id = ? AND status = ? AND requested_by != ?", accountID, "pending", userID).
		Order("created_at ASC").
		Find(&workflows).Error
	return workflows, err
}

// Update updates an approval workflow
func (r *ApprovalWorkflowRepository) Update(workflow *models.ApprovalWorkflow) error {
	return r.db.Save(workflow).Error
}

// UpdateStatus updates the status of an approval workflow
func (r *ApprovalWorkflowRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.ApprovalWorkflow{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// Delete deletes an approval workflow
func (r *ApprovalWorkflowRepository) Delete(id uint) error {
	return r.db.Delete(&models.ApprovalWorkflow{}, id).Error
}

// ExistsByTransaction checks if an approval workflow exists for a transaction
func (r *ApprovalWorkflowRepository) ExistsByTransaction(transactionID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.ApprovalWorkflow{}).
		Where("transaction_id = ?", transactionID).
		Count(&count).Error
	return count > 0, err
}
