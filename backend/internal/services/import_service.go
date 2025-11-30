package services

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// ImportService handles data import operations
type ImportService struct {
	transactionRepo *repository.TransactionRepository
	accountRepo     *repository.AccountRepository
}

// NewImportService creates a new import service
func NewImportService(
	transactionRepo *repository.TransactionRepository,
	accountRepo *repository.AccountRepository,
) *ImportService {
	return &ImportService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

// ImportResult contains the result of an import operation
type ImportResult struct {
	TotalRows    int      `json:"total_rows"`
	Imported     int      `json:"imported"`
	Skipped      int      `json:"skipped"`
	Errors       []string `json:"errors"`
	Transactions []uint   `json:"transaction_ids"`
}

// ImportTransactionsCSV imports transactions from CSV data
func (s *ImportService) ImportTransactionsCSV(userID uint, data io.Reader) (*ImportResult, error) {
	reader := csv.NewReader(data)

	// Read header
	header, err := reader.Read()
	if err != nil {
		return nil, errors.New("failed to read CSV header")
	}

	// Map column names to indices
	colMap := make(map[string]int)
	for i, col := range header {
		colMap[strings.ToLower(strings.TrimSpace(col))] = i
	}

	// Required columns
	required := []string{"amount", "type", "date"}
	for _, req := range required {
		if _, ok := colMap[req]; !ok {
			return nil, fmt.Errorf("missing required column: %s", req)
		}
	}

	// Get user's accounts for validation
	accounts, err := s.accountRepo.GetAll(userID)
	if err != nil {
		return nil, errors.New("failed to get user accounts")
	}

	// Create account name to ID map
	accountMap := make(map[string]uint)
	var defaultAccountID uint
	for _, acc := range accounts {
		accountMap[strings.ToLower(acc.Name)] = acc.ID
		if defaultAccountID == 0 {
			defaultAccountID = acc.ID
		}
	}

	if defaultAccountID == 0 {
		return nil, errors.New("no accounts found - please create an account first")
	}

	result := &ImportResult{
		Errors:       []string{},
		Transactions: []uint{},
	}

	// Process rows
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: failed to read", result.TotalRows+1))
			result.Skipped++
			result.TotalRows++
			continue
		}

		result.TotalRows++

		// Parse transaction
		transaction, parseErr := s.parseTransactionRow(record, colMap, accountMap, defaultAccountID, userID)
		if parseErr != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: %s", result.TotalRows, parseErr.Error()))
			result.Skipped++
			continue
		}

		// Save transaction
		if err := s.transactionRepo.Create(transaction); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: failed to save", result.TotalRows))
			result.Skipped++
			continue
		}

		// Update account balance
		account, _ := s.accountRepo.GetByID(transaction.AccountID, userID)
		if account != nil {
			if transaction.Type == "income" {
				account.Balance += transaction.Amount
			} else {
				account.Balance -= transaction.Amount
			}
			s.accountRepo.Update(account)
		}

		result.Imported++
		result.Transactions = append(result.Transactions, transaction.ID)
	}

	return result, nil
}

func (s *ImportService) parseTransactionRow(record []string, colMap map[string]int, accountMap map[string]uint, defaultAccountID uint, userID uint) (*models.Transaction, error) {
	getValue := func(col string) string {
		if idx, ok := colMap[col]; ok && idx < len(record) {
			return strings.TrimSpace(record[idx])
		}
		return ""
	}

	// Parse amount
	amountStr := getValue("amount")
	amount, err := strconv.ParseFloat(strings.ReplaceAll(amountStr, ",", ""), 64)
	if err != nil {
		return nil, fmt.Errorf("invalid amount: %s", amountStr)
	}
	if amount < 0 {
		amount = -amount
	}

	// Parse type
	transType := strings.ToLower(getValue("type"))
	if transType != "income" && transType != "expense" {
		return nil, fmt.Errorf("invalid type: %s (must be 'income' or 'expense')", transType)
	}

	// Parse date
	dateStr := getValue("date")
	var date time.Time
	dateFormats := []string{
		"2006-01-02",
		"01/02/2006",
		"02/01/2006",
		"2006-01-02T15:04:05Z",
		"2006-01-02 15:04:05",
	}
	for _, format := range dateFormats {
		if parsed, err := time.Parse(format, dateStr); err == nil {
			date = parsed
			break
		}
	}
	if date.IsZero() {
		return nil, fmt.Errorf("invalid date format: %s", dateStr)
	}

	// Parse account
	accountID := defaultAccountID
	if accName := getValue("account"); accName != "" {
		if id, ok := accountMap[strings.ToLower(accName)]; ok {
			accountID = id
		}
	}

	// Get optional fields
	description := getValue("description")
	if description == "" {
		description = "Imported transaction"
	}

	category := getValue("category")
	if category == "" {
		category = "Other"
	}

	tags := getValue("tags")

	return &models.Transaction{
		UserID:      userID,
		Amount:      amount,
		Description: description,
		Category:    category,
		Type:        transType,
		Date:        date,
		AccountID:   accountID,
		Tags:        tags,
	}, nil
}

