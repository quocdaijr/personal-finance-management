package repository

import (
	"github.com/yourusername/finance-management/internal/domain/models"
	"gorm.io/gorm"
	"time"
)

// TaxRepository handles tax category data access
type TaxRepository struct {
	db *gorm.DB
}

// NewTaxRepository creates a new tax repository
func NewTaxRepository(db *gorm.DB) *TaxRepository {
	return &TaxRepository{db: db}
}

// CreateCategory creates a new tax category
func (r *TaxRepository) CreateCategory(category *models.TaxCategory) error {
	return r.db.Create(category).Error
}

// GetCategoryByID retrieves a tax category by ID
func (r *TaxRepository) GetCategoryByID(id, userID uint) (*models.TaxCategory, error) {
	var category models.TaxCategory
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetCategoriesByUserID retrieves all tax categories for a user
func (r *TaxRepository) GetCategoriesByUserID(userID uint) ([]models.TaxCategory, error) {
	var categories []models.TaxCategory
	err := r.db.Where("user_id = ?", userID).
		Order("name ASC").
		Find(&categories).Error
	return categories, err
}

// UpdateCategory updates a tax category
func (r *TaxRepository) UpdateCategory(category *models.TaxCategory) error {
	return r.db.Save(category).Error
}

// DeleteCategory deletes a tax category
func (r *TaxRepository) DeleteCategory(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.TaxCategory{}).Error
}

// GetTaxReport generates annual tax report data
func (r *TaxRepository) GetTaxReport(userID uint, year int) (*models.TaxReportResponse, error) {
	startDate := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(year, 12, 31, 23, 59, 59, 0, time.UTC)

	// Get all transactions with tax categories for the year
	var transactions []models.Transaction
	err := r.db.Where("user_id = ? AND date >= ? AND date <= ? AND tax_category_id IS NOT NULL",
		userID, startDate, endDate).
		Preload("TaxCategory").
		Find(&transactions).Error

	if err != nil {
		return nil, err
	}

	// Aggregate data
	var totalIncome, totalDeductions, capitalGains float64
	categoryMap := make(map[uint]*models.TaxCategorySummary)
	var taxTransactions []models.TaxTransactionSummary

	for _, txn := range transactions {
		if txn.TaxCategoryID == nil {
			continue
		}

		// Get tax category info
		var taxCategory models.TaxCategory
		r.db.First(&taxCategory, *txn.TaxCategoryID)

		// Aggregate by category
		if _, exists := categoryMap[*txn.TaxCategoryID]; !exists {
			categoryMap[*txn.TaxCategoryID] = &models.TaxCategorySummary{
				CategoryID:   *txn.TaxCategoryID,
				CategoryName: taxCategory.Name,
				TaxType:      taxCategory.TaxType,
				TotalAmount:  0,
				Count:        0,
			}
		}

		categoryMap[*txn.TaxCategoryID].TotalAmount += txn.Amount
		categoryMap[*txn.TaxCategoryID].Count++

		// Aggregate by tax type
		switch taxCategory.TaxType {
		case "income":
			totalIncome += txn.Amount
		case "deduction":
			totalDeductions += txn.Amount
		case "capital_gain":
			capitalGains += txn.Amount
		}

		// Add to transaction summary
		taxTransactions = append(taxTransactions, models.TaxTransactionSummary{
			ID:              txn.ID,
			Date:            txn.Date.Format("2006-01-02"),
			Description:     txn.Description,
			Amount:          txn.Amount,
			Category:        txn.Category,
			TaxCategoryName: taxCategory.Name,
			TaxType:         taxCategory.TaxType,
		})
	}

	// Convert map to slice
	var byCategory []models.TaxCategorySummary
	for _, summary := range categoryMap {
		byCategory = append(byCategory, *summary)
	}

	return &models.TaxReportResponse{
		Year:            year,
		TotalIncome:     totalIncome,
		TotalDeductions: totalDeductions,
		CapitalGains:    capitalGains,
		ByCategory:      byCategory,
		Transactions:    taxTransactions,
	}, nil
}
