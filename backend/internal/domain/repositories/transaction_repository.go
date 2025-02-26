package repositories

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// TransactionRepository handles database operations for transactions
type TransactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository creates a new transaction repository
func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// Create creates a new transaction
func (r *TransactionRepository) Create(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

// GetByID gets a transaction by ID
func (r *TransactionRepository) GetByID(id uint, userID uint) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

// GetAll gets all transactions for a user
func (r *TransactionRepository) GetAll(userID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("user_id = ?", userID).Order("date DESC").Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// Update updates a transaction
func (r *TransactionRepository) Update(transaction *models.Transaction) error {
	return r.db.Save(transaction).Error
}

// Delete deletes a transaction
func (r *TransactionRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Transaction{}).Error
}

// GetByPeriod gets transactions for a specific period
func (r *TransactionRepository) GetByPeriod(userID uint, startDate, endDate time.Time) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("user_id = ? AND date BETWEEN ? AND ?", userID, startDate, endDate).
		Order("date DESC").Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// GetSummary gets a summary of transactions for a specific period
func (r *TransactionRepository) GetSummary(userID uint, startDate, endDate time.Time) (*models.TransactionSummary, error) {
	// Get transactions for the period
	transactions, err := r.GetByPeriod(userID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Calculate summary
	summary := &models.TransactionSummary{
		Income:     0,
		Expenses:   0,
		Balance:    0,
		Count:      len(transactions),
		ByCategory: []models.CategorySummary{},
	}

	// Map to store category summaries
	categoryMap := make(map[string]*models.CategorySummary)

	// Calculate totals and category summaries
	for _, t := range transactions {
		if t.Type == "income" {
			summary.Income += t.Amount
		} else {
			summary.Expenses += t.Amount
		}

		// Update category summary
		if _, ok := categoryMap[t.Category]; !ok {
			categoryMap[t.Category] = &models.CategorySummary{
				Category: t.Category,
				Amount:   0,
				Count:    0,
			}
		}

		if t.Type == "income" {
			categoryMap[t.Category].Amount += t.Amount
		} else {
			categoryMap[t.Category].Amount -= t.Amount
		}
		categoryMap[t.Category].Count++
	}

	// Calculate balance
	summary.Balance = summary.Income - summary.Expenses

	// Convert category map to slice
	for _, cs := range categoryMap {
		summary.ByCategory = append(summary.ByCategory, *cs)
	}

	return summary, nil
}
