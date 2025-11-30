package repository

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// RecurringTransactionRepository handles database operations for recurring transactions
type RecurringTransactionRepository struct {
	db *gorm.DB
}

// NewRecurringTransactionRepository creates a new recurring transaction repository
func NewRecurringTransactionRepository(db *gorm.DB) *RecurringTransactionRepository {
	return &RecurringTransactionRepository{db: db}
}

// Create creates a new recurring transaction
func (r *RecurringTransactionRepository) Create(recurring *models.RecurringTransaction) error {
	return r.db.Create(recurring).Error
}

// GetByID gets a recurring transaction by ID
func (r *RecurringTransactionRepository) GetByID(id uint, userID uint) (*models.RecurringTransaction, error) {
	var recurring models.RecurringTransaction
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&recurring).Error
	if err != nil {
		return nil, err
	}
	return &recurring, nil
}

// GetAll gets all recurring transactions for a user
func (r *RecurringTransactionRepository) GetAll(userID uint) ([]models.RecurringTransaction, error) {
	var recurrings []models.RecurringTransaction
	err := r.db.Where("user_id = ?", userID).Order("next_run_date ASC").Find(&recurrings).Error
	if err != nil {
		return nil, err
	}
	return recurrings, nil
}

// GetActive gets all active recurring transactions for a user
func (r *RecurringTransactionRepository) GetActive(userID uint) ([]models.RecurringTransaction, error) {
	var recurrings []models.RecurringTransaction
	err := r.db.Where("user_id = ? AND is_active = ?", userID, true).
		Order("next_run_date ASC").Find(&recurrings).Error
	if err != nil {
		return nil, err
	}
	return recurrings, nil
}

// GetDue gets all recurring transactions that are due to run
func (r *RecurringTransactionRepository) GetDue() ([]models.RecurringTransaction, error) {
	var recurrings []models.RecurringTransaction
	now := time.Now()
	err := r.db.Where("is_active = ? AND next_run_date <= ?", true, now).
		Find(&recurrings).Error
	if err != nil {
		return nil, err
	}
	return recurrings, nil
}

// Update updates a recurring transaction
func (r *RecurringTransactionRepository) Update(recurring *models.RecurringTransaction) error {
	return r.db.Save(recurring).Error
}

// Delete deletes a recurring transaction
func (r *RecurringTransactionRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.RecurringTransaction{}).Error
}

// Deactivate deactivates a recurring transaction
func (r *RecurringTransactionRepository) Deactivate(id uint, userID uint) error {
	return r.db.Model(&models.RecurringTransaction{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_active", false).Error
}

// Activate activates a recurring transaction
func (r *RecurringTransactionRepository) Activate(id uint, userID uint) error {
	return r.db.Model(&models.RecurringTransaction{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_active", true).Error
}

