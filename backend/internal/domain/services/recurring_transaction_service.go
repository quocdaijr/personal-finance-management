package services

import (
	"errors"
	"strings"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// RecurringTransactionService handles business logic for recurring transactions
type RecurringTransactionService struct {
	recurringRepo   *repository.RecurringTransactionRepository
	transactionRepo *repository.TransactionRepository
	accountRepo     *repository.AccountRepository
}

// NewRecurringTransactionService creates a new recurring transaction service
func NewRecurringTransactionService(
	recurringRepo *repository.RecurringTransactionRepository,
	transactionRepo *repository.TransactionRepository,
	accountRepo *repository.AccountRepository,
) *RecurringTransactionService {
	return &RecurringTransactionService{
		recurringRepo:   recurringRepo,
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

// Create creates a new recurring transaction
func (s *RecurringTransactionService) Create(userID uint, req *models.RecurringTransactionRequest) (*models.RecurringTransaction, error) {
	// Validate account exists
	_, err := s.accountRepo.GetByID(req.AccountID, userID)
	if err != nil {
		return nil, errors.New("account not found")
	}

	// Set default interval
	interval := req.Interval
	if interval < 1 {
		interval = 1
	}

	// Calculate next run date
	nextRunDate := req.StartDate
	if nextRunDate.Before(time.Now()) {
		nextRunDate = time.Now()
	}

	recurring := &models.RecurringTransaction{
		UserID:      userID,
		Amount:      req.Amount,
		Description: req.Description,
		Category:    req.Category,
		Type:        req.Type,
		AccountID:   req.AccountID,
		Tags:        strings.Join(req.Tags, ","),
		Frequency:   req.Frequency,
		Interval:    interval,
		DayOfWeek:   req.DayOfWeek,
		DayOfMonth:  req.DayOfMonth,
		MonthOfYear: req.MonthOfYear,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		NextRunDate: nextRunDate,
		IsActive:    true,
		MaxRuns:     req.MaxRuns,
	}

	if err := s.recurringRepo.Create(recurring); err != nil {
		return nil, err
	}

	return recurring, nil
}

// GetByID gets a recurring transaction by ID
func (s *RecurringTransactionService) GetByID(id uint, userID uint) (*models.RecurringTransaction, error) {
	return s.recurringRepo.GetByID(id, userID)
}

// GetAll gets all recurring transactions for a user
func (s *RecurringTransactionService) GetAll(userID uint) ([]models.RecurringTransaction, error) {
	return s.recurringRepo.GetAll(userID)
}

// GetActive gets all active recurring transactions for a user
func (s *RecurringTransactionService) GetActive(userID uint) ([]models.RecurringTransaction, error) {
	return s.recurringRepo.GetActive(userID)
}

// Update updates a recurring transaction
func (s *RecurringTransactionService) Update(id uint, userID uint, req *models.RecurringTransactionRequest) (*models.RecurringTransaction, error) {
	recurring, err := s.recurringRepo.GetByID(id, userID)
	if err != nil {
		return nil, errors.New("recurring transaction not found")
	}

	// Validate account
	_, err = s.accountRepo.GetByID(req.AccountID, userID)
	if err != nil {
		return nil, errors.New("account not found")
	}

	// Update fields
	recurring.Amount = req.Amount
	recurring.Description = req.Description
	recurring.Category = req.Category
	recurring.Type = req.Type
	recurring.AccountID = req.AccountID
	recurring.Tags = strings.Join(req.Tags, ",")
	recurring.Frequency = req.Frequency
	recurring.Interval = req.Interval
	recurring.DayOfWeek = req.DayOfWeek
	recurring.DayOfMonth = req.DayOfMonth
	recurring.MonthOfYear = req.MonthOfYear
	recurring.StartDate = req.StartDate
	recurring.EndDate = req.EndDate
	recurring.MaxRuns = req.MaxRuns

	if err := s.recurringRepo.Update(recurring); err != nil {
		return nil, err
	}

	return recurring, nil
}

// Delete deletes a recurring transaction
func (s *RecurringTransactionService) Delete(id uint, userID uint) error {
	return s.recurringRepo.Delete(id, userID)
}

// ToggleActive toggles the active state of a recurring transaction
func (s *RecurringTransactionService) ToggleActive(id uint, userID uint, active bool) error {
	if active {
		return s.recurringRepo.Activate(id, userID)
	}
	return s.recurringRepo.Deactivate(id, userID)
}

// ProcessDue processes all due recurring transactions
func (s *RecurringTransactionService) ProcessDue() (int, error) {
	dueRecurrings, err := s.recurringRepo.GetDue()
	if err != nil {
		return 0, err
	}

	processed := 0
	now := time.Now()

	for _, recurring := range dueRecurrings {
		// Check if we've exceeded max runs
		if recurring.MaxRuns > 0 && recurring.TotalRuns >= recurring.MaxRuns {
			recurring.IsActive = false
			s.recurringRepo.Update(&recurring)
			continue
		}

		// Check if past end date
		if recurring.EndDate != nil && now.After(*recurring.EndDate) {
			recurring.IsActive = false
			s.recurringRepo.Update(&recurring)
			continue
		}

		// Get account
		account, err := s.accountRepo.GetByID(recurring.AccountID, recurring.UserID)
		if err != nil {
			continue // Skip if account not found
		}

		// Create the transaction
		transaction := &models.Transaction{
			UserID:      recurring.UserID,
			Amount:      recurring.Amount,
			Description: recurring.Description + " (Recurring)",
			Category:    recurring.Category,
			Type:        recurring.Type,
			Date:        now,
			AccountID:   recurring.AccountID,
			Tags:        recurring.Tags,
		}

		if err := s.transactionRepo.Create(transaction); err != nil {
			continue // Skip if failed to create
		}

		// Update account balance
		if recurring.Type == "income" {
			account.Balance += recurring.Amount
		} else {
			account.Balance -= recurring.Amount
		}
		s.accountRepo.Update(account)

		// Update recurring transaction
		recurring.LastRunDate = &now
		recurring.NextRunDate = recurring.CalculateNextRunDate()
		recurring.TotalRuns++
		s.recurringRepo.Update(&recurring)

		processed++
	}

	return processed, nil
}

// RunNow manually runs a recurring transaction immediately
func (s *RecurringTransactionService) RunNow(id uint, userID uint) (*models.Transaction, error) {
	recurring, err := s.recurringRepo.GetByID(id, userID)
	if err != nil {
		return nil, errors.New("recurring transaction not found")
	}

	if !recurring.IsActive {
		return nil, errors.New("recurring transaction is not active")
	}

	// Get account
	account, err := s.accountRepo.GetByID(recurring.AccountID, userID)
	if err != nil {
		return nil, errors.New("account not found")
	}

	now := time.Now()

	// Create the transaction
	transaction := &models.Transaction{
		UserID:      userID,
		Amount:      recurring.Amount,
		Description: recurring.Description + " (Manual Run)",
		Category:    recurring.Category,
		Type:        recurring.Type,
		Date:        now,
		AccountID:   recurring.AccountID,
		Tags:        recurring.Tags,
	}

	if err := s.transactionRepo.Create(transaction); err != nil {
		return nil, errors.New("failed to create transaction")
	}

	// Update account balance
	if recurring.Type == "income" {
		account.Balance += recurring.Amount
	} else {
		account.Balance -= recurring.Amount
	}
	s.accountRepo.Update(account)

	// Update recurring transaction
	recurring.LastRunDate = &now
	recurring.TotalRuns++
	s.recurringRepo.Update(recurring)

	return transaction, nil
}

