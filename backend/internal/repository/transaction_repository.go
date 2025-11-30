package repository

import (
	"strings"
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

// GetFiltered gets transactions with filters and pagination
func (r *TransactionRepository) GetFiltered(userID uint, filter *models.TransactionFilter) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	// Build query
	query := r.db.Model(&models.Transaction{}).Where("user_id = ?", userID)

	// Apply filters
	if filter.Search != "" {
		searchTerm := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(tags) LIKE ?",
			searchTerm, searchTerm, searchTerm)
	}

	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}

	if filter.AccountID > 0 {
		query = query.Where("account_id = ?", filter.AccountID)
	}

	if filter.StartDate != "" {
		if startDate, err := time.Parse("2006-01-02", filter.StartDate); err == nil {
			query = query.Where("date >= ?", startDate)
		}
	}

	if filter.EndDate != "" {
		if endDate, err := time.Parse("2006-01-02", filter.EndDate); err == nil {
			query = query.Where("date <= ?", endDate)
		}
	}

	if filter.MinAmount > 0 {
		query = query.Where("amount >= ?", filter.MinAmount)
	}

	if filter.MaxAmount > 0 {
		query = query.Where("amount <= ?", filter.MaxAmount)
	}

	if filter.Tags != "" {
		tagTerm := "%" + filter.Tags + "%"
		query = query.Where("tags LIKE ?", tagTerm)
	}

	// Get total count
	query.Count(&total)

	// Apply sorting
	sortBy := "date"
	if filter.SortBy != "" {
		allowedSortFields := map[string]bool{
			"date": true, "amount": true, "category": true, "type": true, "created_at": true,
		}
		if allowedSortFields[filter.SortBy] {
			sortBy = filter.SortBy
		}
	}

	sortOrder := "DESC"
	if filter.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	query = query.Order(sortBy + " " + sortOrder)

	// Apply pagination
	page := filter.Page
	if page < 1 {
		page = 1
	}

	pageSize := filter.PageSize
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Execute query
	err := query.Find(&transactions).Error
	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// GetTotalSpentByCategory calculates total spent for a category within a date range
func (r *TransactionRepository) GetTotalSpentByCategory(userID uint, category string, startDate, endDate time.Time) (float64, error) {
	var total float64

	query := r.db.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND date >= ? AND date <= ?", userID, "expense", startDate, endDate)

	if category != "" {
		query = query.Where("category = ?", category)
	}

	err := query.Select("COALESCE(SUM(amount), 0)").Scan(&total).Error
	if err != nil {
		return 0, err
	}

	return total, nil
}

// GetTotalIncomeByPeriod calculates total income within a date range
func (r *TransactionRepository) GetTotalIncomeByPeriod(userID uint, startDate, endDate time.Time) (float64, error) {
	var total float64

	err := r.db.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND date >= ? AND date <= ?", userID, "income", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").Scan(&total).Error
	if err != nil {
		return 0, err
	}

	return total, nil
}
