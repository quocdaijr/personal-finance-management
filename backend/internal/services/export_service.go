package services

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// ExportService handles data export operations
type ExportService struct {
	transactionRepo *repository.TransactionRepository
	accountRepo     *repository.AccountRepository
	budgetRepo      *repository.BudgetRepository
}

// NewExportService creates a new export service
func NewExportService(
	transactionRepo *repository.TransactionRepository,
	accountRepo *repository.AccountRepository,
	budgetRepo *repository.BudgetRepository,
) *ExportService {
	return &ExportService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		budgetRepo:      budgetRepo,
	}
}

// ExportTransactionsCSV exports transactions to CSV format
func (s *ExportService) ExportTransactionsCSV(userID uint, startDate, endDate *time.Time) ([]byte, error) {
	// Get transactions
	var transactions []models.Transaction
	var err error

	if startDate != nil && endDate != nil {
		transactions, err = s.transactionRepo.GetByPeriod(userID, *startDate, *endDate)
	} else {
		transactions, err = s.transactionRepo.GetAll(userID)
	}

	if err != nil {
		return nil, err
	}

	// Get accounts for name mapping
	accounts, _ := s.accountRepo.GetAll(userID)
	accountMap := make(map[uint]string)
	for _, acc := range accounts {
		accountMap[acc.ID] = acc.Name
	}

	// Create CSV buffer
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Write header
	header := []string{"ID", "Date", "Type", "Category", "Description", "Amount", "Account", "Tags", "Created At"}
	if err := writer.Write(header); err != nil {
		return nil, err
	}

	// Write transactions
	for _, t := range transactions {
		accountName := accountMap[t.AccountID]
		if accountName == "" {
			accountName = fmt.Sprintf("Account #%d", t.AccountID)
		}

		row := []string{
			fmt.Sprintf("%d", t.ID),
			t.Date.Format("2006-01-02"),
			t.Type,
			t.Category,
			t.Description,
			fmt.Sprintf("%.2f", t.Amount),
			accountName,
			t.Tags,
			t.CreatedAt.Format("2006-01-02 15:04:05"),
		}
		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// ExportTransactionsJSON exports transactions to JSON format
func (s *ExportService) ExportTransactionsJSON(userID uint, startDate, endDate *time.Time) ([]byte, error) {
	// Get transactions
	var transactions []models.Transaction
	var err error

	if startDate != nil && endDate != nil {
		transactions, err = s.transactionRepo.GetByPeriod(userID, *startDate, *endDate)
	} else {
		transactions, err = s.transactionRepo.GetAll(userID)
	}

	if err != nil {
		return nil, err
	}

	// Convert to response format
	var response []*models.TransactionResponse
	for _, t := range transactions {
		response = append(response, t.ToResponse())
	}

	// Marshal to JSON
	return json.MarshalIndent(response, "", "  ")
}

// ExportAccountsCSV exports accounts to CSV format
func (s *ExportService) ExportAccountsCSV(userID uint) ([]byte, error) {
	accounts, err := s.accountRepo.GetAll(userID)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Write header
	header := []string{"ID", "Name", "Type", "Balance", "Currency", "Created At"}
	if err := writer.Write(header); err != nil {
		return nil, err
	}

	// Write accounts
	for _, a := range accounts {
		row := []string{
			fmt.Sprintf("%d", a.ID),
			a.Name,
			a.Type,
			fmt.Sprintf("%.2f", a.Balance),
			a.Currency,
			a.CreatedAt.Format("2006-01-02 15:04:05"),
		}
		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	return buf.Bytes(), writer.Error()
}

