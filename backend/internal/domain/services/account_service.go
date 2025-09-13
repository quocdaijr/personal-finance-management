package services

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// AccountService handles business logic for accounts
type AccountService struct {
	accountRepo *repository.AccountRepository
}

// NewAccountService creates a new account service
func NewAccountService(accountRepo *repository.AccountRepository) *AccountService {
	return &AccountService{
		accountRepo: accountRepo,
	}
}

// Create creates a new account
func (s *AccountService) Create(userID uint, req *models.AccountRequest) (*models.Account, error) {
	// Create account
	account := &models.Account{
		UserID:    userID,
		Name:      req.Name,
		Type:      req.Type,
		Balance:   req.Balance,
		Currency:  req.Currency,
		IsDefault: req.IsDefault,
	}

	// Save account
	if err := s.accountRepo.Create(account); err != nil {
		return nil, err
	}

	return account, nil
}

// GetByID gets an account by ID
func (s *AccountService) GetByID(id uint, userID uint) (*models.Account, error) {
	return s.accountRepo.GetByID(id, userID)
}

// GetAll gets all accounts for a user
func (s *AccountService) GetAll(userID uint) ([]models.Account, error) {
	return s.accountRepo.GetAll(userID)
}

// Update updates an account
func (s *AccountService) Update(id uint, userID uint, req *models.AccountRequest) (*models.Account, error) {
	// Get existing account
	account, err := s.accountRepo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	// Update account
	account.Name = req.Name
	account.Type = req.Type
	account.Balance = req.Balance
	account.Currency = req.Currency
	account.IsDefault = req.IsDefault

	// Save account
	if err := s.accountRepo.Update(account); err != nil {
		return nil, err
	}

	return account, nil
}

// Delete deletes an account
func (s *AccountService) Delete(id uint, userID uint) error {
	return s.accountRepo.Delete(id, userID)
}

// GetAccountTypes gets all account types
func (s *AccountService) GetAccountTypes() []models.AccountType {
	return s.accountRepo.GetAccountTypes()
}

// GetSummary gets a summary of accounts for a user
func (s *AccountService) GetSummary(userID uint) (*models.AccountSummary, error) {
	return s.accountRepo.GetSummary(userID)
}
