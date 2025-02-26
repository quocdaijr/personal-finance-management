package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// AccountRepository handles database operations for accounts
type AccountRepository struct {
	db *gorm.DB
}

// NewAccountRepository creates a new account repository
func NewAccountRepository(db *gorm.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

// Create creates a new account
func (r *AccountRepository) Create(account *models.Account) error {
	// If this account is set as default, update other accounts
	if account.IsDefault {
		if err := r.db.Model(&models.Account{}).Where("user_id = ?", account.UserID).
			Update("is_default", false).Error; err != nil {
			return err
		}
	}

	// If this is the first account, make it default
	var count int64
	r.db.Model(&models.Account{}).Where("user_id = ?", account.UserID).Count(&count)
	if count == 0 {
		account.IsDefault = true
	}

	return r.db.Create(account).Error
}

// GetByID gets an account by ID
func (r *AccountRepository) GetByID(id uint, userID uint) (*models.Account, error) {
	var account models.Account
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// GetAll gets all accounts for a user
func (r *AccountRepository) GetAll(userID uint) ([]models.Account, error) {
	var accounts []models.Account
	err := r.db.Where("user_id = ?", userID).Find(&accounts).Error
	if err != nil {
		return nil, err
	}
	return accounts, nil
}

// Update updates an account
func (r *AccountRepository) Update(account *models.Account) error {
	// If this account is being set as default, update other accounts
	if account.IsDefault {
		if err := r.db.Model(&models.Account{}).Where("user_id = ? AND id != ?", account.UserID, account.ID).
			Update("is_default", false).Error; err != nil {
			return err
		}
	}

	return r.db.Save(account).Error
}

// Delete deletes an account
func (r *AccountRepository) Delete(id uint, userID uint) error {
	// Check if this is the default account
	var account models.Account
	if err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		return err
	}

	if account.IsDefault {
		return gorm.ErrInvalidTransaction // Cannot delete default account
	}

	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Account{}).Error
}

// GetSummary gets a summary of accounts for a user
func (r *AccountRepository) GetSummary(userID uint) (*models.AccountSummary, error) {
	// Get all accounts for the user
	accounts, err := r.GetAll(userID)
	if err != nil {
		return nil, err
	}

	// Calculate summary
	summary := &models.AccountSummary{
		TotalAccounts:    len(accounts),
		TotalAssets:      0,
		TotalLiabilities: 0,
		NetWorth:         0,
	}

	// Calculate totals
	for _, a := range accounts {
		if a.Balance > 0 {
			summary.TotalAssets += a.Balance
		} else {
			summary.TotalLiabilities += -a.Balance
		}
	}

	// Calculate net worth
	summary.NetWorth = summary.TotalAssets - summary.TotalLiabilities

	return summary, nil
}

// GetAccountTypes gets all account types
func (r *AccountRepository) GetAccountTypes() []models.AccountType {
	return []models.AccountType{
		{ID: "checking", Name: "Checking Account"},
		{ID: "savings", Name: "Savings Account"},
		{ID: "credit", Name: "Credit Card"},
		{ID: "investment", Name: "Investment Account"},
		{ID: "cash", Name: "Cash"},
		{ID: "other", Name: "Other"},
	}
}
