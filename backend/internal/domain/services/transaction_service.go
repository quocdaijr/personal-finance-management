package services

import (
	"errors"
	"strings"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"gorm.io/gorm"
)

// TransactionService handles business logic for transactions
type TransactionService struct {
	transactionRepo *repository.TransactionRepository
	accountRepo     *repository.AccountRepository
	db              *gorm.DB
}

// NewTransactionService creates a new transaction service
func NewTransactionService(
	transactionRepo *repository.TransactionRepository,
	accountRepo *repository.AccountRepository,
	db *gorm.DB,
) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		db:              db,
	}
}

// Create creates a new transaction atomically
func (s *TransactionService) Create(userID uint, req *models.TransactionRequest) (*models.Transaction, error) {
	var transaction *models.Transaction

	// Start database transaction
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Check if account exists and belongs to user
		account, err := s.accountRepo.GetByID(req.AccountID, userID)
		if err != nil {
			return err
		}

		// Create transaction
		transaction = &models.Transaction{
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
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		// Update account balance
		if req.Type == "income" {
			account.Balance += req.Amount
		} else {
			account.Balance -= req.Amount
		}

		// Save account with updated balance
		if err := tx.Save(account).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
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

// GetFiltered gets transactions with filters and pagination
func (s *TransactionService) GetFiltered(userID uint, filter *models.TransactionFilter) (*models.PaginatedTransactionResponse, error) {
	transactions, total, err := s.transactionRepo.GetFiltered(userID, filter)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var data []*models.TransactionResponse
	for _, t := range transactions {
		data = append(data, t.ToResponse())
	}

	// Calculate total pages
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 20
	}
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}

	return &models.PaginatedTransactionResponse{
		Data:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// Update updates a transaction atomically
func (s *TransactionService) Update(id uint, userID uint, req *models.TransactionRequest) (*models.Transaction, error) {
	var updatedTransaction *models.Transaction

	// Start database transaction
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Get existing transaction
		transaction, err := s.transactionRepo.GetByID(id, userID)
		if err != nil {
			return err
		}

		// Check if account exists and belongs to user
		newAccount, err := s.accountRepo.GetByID(req.AccountID, userID)
		if err != nil {
			return err
		}

		// Get old account if different
		var oldAccount *models.Account
		if transaction.AccountID != newAccount.ID {
			oldAccount, err = s.accountRepo.GetByID(transaction.AccountID, userID)
			if err != nil {
				return err
			}
		}

		// Calculate balance adjustments
		if oldAccount != nil {
			// Reverse the effect of the old transaction on old account
			if transaction.Type == "income" {
				oldAccount.Balance -= transaction.Amount
			} else {
				oldAccount.Balance += transaction.Amount
			}

			// Save old account
			if err := tx.Save(oldAccount).Error; err != nil {
				return err
			}
		} else {
			// Same account, reverse old transaction first
			if transaction.Type == "income" {
				newAccount.Balance -= transaction.Amount
			} else {
				newAccount.Balance += transaction.Amount
			}
		}

		// Apply the new transaction
		if req.Type == "income" {
			newAccount.Balance += req.Amount
		} else {
			newAccount.Balance -= req.Amount
		}

		// Save new account
		if err := tx.Save(newAccount).Error; err != nil {
			return err
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
		if err := tx.Save(transaction).Error; err != nil {
			return err
		}

		updatedTransaction = transaction
		return nil
	})

	if err != nil {
		return nil, err
	}

	return updatedTransaction, nil
}

// Delete deletes a transaction atomically
func (s *TransactionService) Delete(id uint, userID uint) error {
	// Start database transaction
	return s.db.Transaction(func(tx *gorm.DB) error {
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

		// Adjust account balance (reverse the transaction)
		if transaction.Type == "income" {
			account.Balance -= transaction.Amount
		} else {
			account.Balance += transaction.Amount
		}

		// Save account
		if err := tx.Save(account).Error; err != nil {
			return err
		}

		// Delete transaction
		if err := tx.Delete(&models.Transaction{}, id).Error; err != nil {
			return err
		}

		return nil
	})
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

// Transfer handles money transfer between two accounts atomically
func (s *TransactionService) Transfer(userID uint, req *models.TransferRequest) (*models.TransferResponse, error) {
	var response *models.TransferResponse

	// Validate that accounts are different
	if req.FromAccountID == req.ToAccountID {
		return nil, errors.New("cannot transfer to the same account")
	}

	// Start database transaction for atomic transfer
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Get source account
		fromAccount, err := s.accountRepo.GetByID(req.FromAccountID, userID)
		if err != nil {
			return errors.New("source account not found")
		}

		// Get destination account
		toAccount, err := s.accountRepo.GetByID(req.ToAccountID, userID)
		if err != nil {
			return errors.New("destination account not found")
		}

		// Check if source account has sufficient balance
		if fromAccount.Balance < req.Amount {
			return errors.New("insufficient balance in source account")
		}

		// Create description if not provided
		description := req.Description
		if description == "" {
			description = "Transfer from " + fromAccount.Name + " to " + toAccount.Name
		}

		// Create outgoing transaction (from source account)
		fromTransaction := &models.Transaction{
			UserID:      userID,
			Amount:      req.Amount,
			Description: description,
			Category:    "Transfer",
			Type:        "transfer",
			Date:        req.Date,
			AccountID:   fromAccount.ID,
			Tags:        strings.Join(req.Tags, ","),
		}

		if err := tx.Create(fromTransaction).Error; err != nil {
			return errors.New("failed to create outgoing transaction")
		}

		// Create incoming transaction (to destination account)
		toTransaction := &models.Transaction{
			UserID:      userID,
			Amount:      req.Amount,
			Description: description,
			Category:    "Transfer",
			Type:        "transfer",
			Date:        req.Date,
			AccountID:   toAccount.ID,
			Tags:        strings.Join(req.Tags, ","),
		}

		if err := tx.Create(toTransaction).Error; err != nil {
			return errors.New("failed to create incoming transaction")
		}

		// Update account balances
		fromAccount.Balance -= req.Amount
		toAccount.Balance += req.Amount

		if err := tx.Save(fromAccount).Error; err != nil {
			return errors.New("failed to update source account balance")
		}

		if err := tx.Save(toAccount).Error; err != nil {
			return errors.New("failed to update destination account balance")
		}

		response = &models.TransferResponse{
			FromTransaction: fromTransaction.ToResponse(),
			ToTransaction:   toTransaction.ToResponse(),
			Message:         "Transfer completed successfully",
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return response, nil
}
