package services

import (
	"fmt"
	"strings"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// TransactionService handles business logic for transactions
type TransactionService struct {
	transactionRepo *repository.TransactionRepository
	accountRepo     *repository.AccountRepository
}

// NewTransactionService creates a new transaction service
func NewTransactionService(
	transactionRepo *repository.TransactionRepository,
	accountRepo *repository.AccountRepository,
) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

// Create creates a new transaction
func (s *TransactionService) Create(userID uint, req *models.TransactionRequest) (*models.Transaction, error) {
	// Convert account ID from string to uint
	var accountID uint
	_, err := fmt.Sscanf(req.AccountID, "%d", &accountID)
	if err != nil {
		return nil, err
	}

	// Check if account exists and belongs to user
	account, err := s.accountRepo.GetByID(accountID, userID)
	if err != nil {
		return nil, err
	}

	// Create transaction
	transaction := &models.Transaction{
		UserID:      userID,
		Amount:      req.Amount,
		Description: req.Description,
		Category:    req.Category,
		Type:        req.Type,
		Date:        req.Date,
		AccountID:   account.ID,
		Tags:        strings.Join(req.Tags, ","),
	}

	// Save transaction
	if err := s.transactionRepo.Create(transaction); err != nil {
		return nil, err
	}

	// Update account balance
	if req.Type == "income" {
		account.Balance += req.Amount
	} else {
		account.Balance -= req.Amount
	}

	// Save account
	if err := s.accountRepo.Update(account); err != nil {
		return nil, err
	}

	return transaction, nil
}

// GetByID gets a transaction by ID
func (s *TransactionService) GetByID(id uint, userID uint) (*models.Transaction, error) {
	return s.transactionRepo.GetByID(id, userID)
}

// GetAll gets all transactions for a user
func (s *TransactionService) GetAll(userID uint) ([]models.Transaction, error) {
	return s.transactionRepo.GetAll(userID)
}

// Update updates a transaction
func (s *TransactionService) Update(id uint, userID uint, req *models.TransactionRequest) (*models.Transaction, error) {
	// Get existing transaction
	transaction, err := s.transactionRepo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	// Convert account ID from string to uint
	var accountID uint
	_, err = fmt.Sscanf(req.AccountID, "%d", &accountID)
	if err != nil {
		return nil, err
	}

	// Check if account exists and belongs to user
	newAccount, err := s.accountRepo.GetByID(accountID, userID)
	if err != nil {
		return nil, err
	}

	// Get old account if different
	var oldAccount *models.Account
	if transaction.AccountID != newAccount.ID {
		oldAccount, err = s.accountRepo.GetByID(transaction.AccountID, userID)
		if err != nil {
			return nil, err
		}
	}

	// Calculate balance adjustments
	if oldAccount != nil {
		// Reverse the effect of the old transaction
		if transaction.Type == "income" {
			oldAccount.Balance -= transaction.Amount
		} else {
			oldAccount.Balance += transaction.Amount
		}

		// Save old account
		if err := s.accountRepo.Update(oldAccount); err != nil {
			return nil, err
		}
	}

	// Apply the new transaction
	if req.Type == "income" {
		newAccount.Balance += req.Amount
	} else {
		newAccount.Balance -= req.Amount
	}

	// Save new account
	if err := s.accountRepo.Update(newAccount); err != nil {
		return nil, err
	}

	// Update transaction
	transaction.Amount = req.Amount
	transaction.Description = req.Description
	transaction.Category = req.Category
	transaction.Type = req.Type
	transaction.Date = req.Date
	transaction.AccountID = newAccount.ID
	transaction.Tags = strings.Join(req.Tags, ",")

	// Save transaction
	if err := s.transactionRepo.Update(transaction); err != nil {
		return nil, err
	}

	return transaction, nil
}

// Delete deletes a transaction
func (s *TransactionService) Delete(id uint, userID uint) error {
	// Get transaction
	transaction, err := s.transactionRepo.GetByID(id, userID)
	if err != nil {
		return err
	}

	// Get account
	account, err := s.accountRepo.GetByID(transaction.AccountID, userID)
	if err != nil {
		return err
	}

	// Adjust account balance
	if transaction.Type == "income" {
		account.Balance -= transaction.Amount
	} else {
		account.Balance += transaction.Amount
	}

	// Save account
	if err := s.accountRepo.Update(account); err != nil {
		return err
	}

	// Delete transaction
	return s.transactionRepo.Delete(id, userID)
}

// GetCategories gets all transaction categories
func (s *TransactionService) GetCategories() []string {
	return []string{
		"Food & Dining",
		"Shopping",
		"Housing",
		"Transportation",
		"Entertainment",
		"Health & Fitness",
		"Travel",
		"Education",
		"Personal Care",
		"Gifts & Donations",
		"Bills & Utilities",
		"Income",
		"Investments",
		"Uncategorized",
	}
}

// GetSummary gets a summary of transactions for a specific period
func (s *TransactionService) GetSummary(userID uint, period string) (*models.TransactionSummary, error) {
	// Calculate start and end dates based on period
	now := time.Now()
	var startDate time.Time

	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7)
	case "month":
		startDate = now.AddDate(0, -1, 0)
	case "year":
		startDate = now.AddDate(-1, 0, 0)
	default:
		startDate = now.AddDate(0, -1, 0)
	}

	return s.transactionRepo.GetSummary(userID, startDate, now)
}
