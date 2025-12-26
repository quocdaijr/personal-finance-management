package services

import (
	"testing"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB creates an in-memory SQLite database for testing
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto-migrate models
	err = db.AutoMigrate(&models.User{}, &models.Account{}, &models.Transaction{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

// createTestUser creates a test user in the database
func createTestUser(t *testing.T, db *gorm.DB) *models.User {
	user := &models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "hashedpassword",
	}
	result := db.Create(user)
	if result.Error != nil {
		t.Fatalf("Failed to create test user: %v", result.Error)
	}
	return user
}

// createTestAccount creates a test account in the database
func createTestAccount(t *testing.T, db *gorm.DB, userID uint, balance float64) *models.Account {
	account := &models.Account{
		UserID:      userID,
		Name:        "Test Account",
		Type:        "checking",
		Balance:     balance,
		Currency:    "USD",
		Description: "Test account",
	}
	result := db.Create(account)
	if result.Error != nil {
		t.Fatalf("Failed to create test account: %v", result.Error)
	}
	return account
}

func TestTransactionService_Create(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Test data
	req := &models.TransactionRequest{
		Amount:      100.0,
		Description: "Grocery shopping",
		Category:    "Food & Dining",
		Type:        "expense",
		Date:        time.Now(),
		AccountID:   account.ID,
		Tags:        []string{"groceries"},
	}

	// Execute
	transaction, err := service.Create(user.ID, req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, transaction)
	assert.Equal(t, user.ID, transaction.UserID)
	assert.Equal(t, float64(100.0), transaction.Amount)
	assert.Equal(t, "Food & Dining", transaction.Category)
	assert.Equal(t, "expense", transaction.Type)

	// Verify account balance was updated
	var updatedAccount models.Account
	db.First(&updatedAccount, account.ID)
	assert.Equal(t, float64(900.0), updatedAccount.Balance) // 1000 - 100
}

func TestTransactionService_Create_Income(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Test data - income transaction
	req := &models.TransactionRequest{
		Amount:      500.0,
		Description: "Salary",
		Category:    "Income",
		Type:        "income",
		Date:        time.Now(),
		AccountID:   account.ID,
		Tags:        []string{"salary"},
	}

	// Execute
	transaction, err := service.Create(user.ID, req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, transaction)
	assert.Equal(t, "income", transaction.Type)

	// Verify account balance was updated
	var updatedAccount models.Account
	db.First(&updatedAccount, account.ID)
	assert.Equal(t, float64(1500.0), updatedAccount.Balance) // 1000 + 500
}

func TestTransactionService_Create_AccountNotFound(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Test data with non-existent account
	req := &models.TransactionRequest{
		Amount:      100.0,
		Description: "Test",
		Category:    "Food & Dining",
		Type:        "expense",
		Date:        time.Now(),
		AccountID:   999, // Non-existent account
		Tags:        []string{},
	}

	// Execute
	transaction, err := service.Create(user.ID, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, transaction)
}

func TestTransactionService_GetByID(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Create a transaction
	req := &models.TransactionRequest{
		Amount:      100.0,
		Description: "Test transaction",
		Category:    "Food & Dining",
		Type:        "expense",
		Date:        time.Now(),
		AccountID:   account.ID,
		Tags:        []string{},
	}
	createdTransaction, _ := service.Create(user.ID, req)

	// Execute
	transaction, err := service.GetByID(createdTransaction.ID, user.ID)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, transaction)
	assert.Equal(t, createdTransaction.ID, transaction.ID)
	assert.Equal(t, "Test transaction", transaction.Description)
}

func TestTransactionService_GetAll(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Create multiple transactions
	for i := 0; i < 3; i++ {
		req := &models.TransactionRequest{
			Amount:      float64(100 * (i + 1)),
			Description: "Test transaction",
			Category:    "Food & Dining",
			Type:        "expense",
			Date:        time.Now(),
			AccountID:   account.ID,
			Tags:        []string{},
		}
		service.Create(user.ID, req)
	}

	// Execute
	transactions, err := service.GetAll(user.ID)

	// Assert
	assert.NoError(t, err)
	assert.Len(t, transactions, 3)
}

func TestTransactionService_Update(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Create initial transaction
	req := &models.TransactionRequest{
		Amount:      100.0,
		Description: "Original transaction",
		Category:    "Food & Dining",
		Type:        "expense",
		Date:        time.Now(),
		AccountID:   account.ID,
		Tags:        []string{},
	}
	createdTransaction, _ := service.Create(user.ID, req)

	// Update transaction
	updateReq := &models.TransactionRequest{
		Amount:      150.0,
		Description: "Updated transaction",
		Category:    "Shopping",
		Type:        "expense",
		Date:        time.Now(),
		AccountID:   account.ID,
		Tags:        []string{"updated"},
	}

	// Execute
	updatedTransaction, err := service.Update(createdTransaction.ID, user.ID, updateReq)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, updatedTransaction)
	assert.Equal(t, float64(150.0), updatedTransaction.Amount)
	assert.Equal(t, "Updated transaction", updatedTransaction.Description)
	assert.Equal(t, "Shopping", updatedTransaction.Category)

	// Verify account balance was updated correctly
	var updatedAccount models.Account
	db.First(&updatedAccount, account.ID)
	// Original: 1000 - 100 = 900
	// Update reverses: 900 + 100 = 1000
	// Apply new: 1000 - 150 = 850
	assert.Equal(t, float64(850.0), updatedAccount.Balance)
}

func TestTransactionService_Delete(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Create transaction
	req := &models.TransactionRequest{
		Amount:      100.0,
		Description: "Test transaction",
		Category:    "Food & Dining",
		Type:        "expense",
		Date:        time.Now(),
		AccountID:   account.ID,
		Tags:        []string{},
	}
	createdTransaction, _ := service.Create(user.ID, req)

	// Execute
	err := service.Delete(createdTransaction.ID, user.ID)

	// Assert
	assert.NoError(t, err)

	// Verify transaction was deleted
	var deletedTransaction models.Transaction
	result := db.First(&deletedTransaction, createdTransaction.ID)
	assert.Error(t, result.Error)
	assert.Equal(t, gorm.ErrRecordNotFound, result.Error)

	// Verify account balance was restored
	var updatedAccount models.Account
	db.First(&updatedAccount, account.ID)
	assert.Equal(t, float64(1000.0), updatedAccount.Balance) // Back to original
}

func TestTransactionService_Transfer(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	fromAccount := createTestAccount(t, db, user.ID, 1000.0)
	toAccount := createTestAccount(t, db, user.ID, 500.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Test data
	req := &models.TransferRequest{
		FromAccountID: fromAccount.ID,
		ToAccountID:   toAccount.ID,
		Amount:        200.0,
		Description:   "Test transfer",
		Date:          time.Now(),
		Tags:          []string{"transfer"},
	}

	// Execute
	response, err := service.Transfer(user.ID, req)

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.NotNil(t, response.FromTransaction)
	assert.NotNil(t, response.ToTransaction)
	assert.Equal(t, "Transfer completed successfully", response.Message)

	// Verify account balances
	var updatedFromAccount models.Account
	var updatedToAccount models.Account
	db.First(&updatedFromAccount, fromAccount.ID)
	db.First(&updatedToAccount, toAccount.ID)

	assert.Equal(t, float64(800.0), updatedFromAccount.Balance)  // 1000 - 200
	assert.Equal(t, float64(700.0), updatedToAccount.Balance)    // 500 + 200
}

func TestTransactionService_Transfer_SameAccount(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	account := createTestAccount(t, db, user.ID, 1000.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Test data - same account
	req := &models.TransferRequest{
		FromAccountID: account.ID,
		ToAccountID:   account.ID,
		Amount:        200.0,
		Description:   "Invalid transfer",
		Date:          time.Now(),
		Tags:          []string{},
	}

	// Execute
	response, err := service.Transfer(user.ID, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "cannot transfer to the same account")
}

func TestTransactionService_Transfer_InsufficientBalance(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	user := createTestUser(t, db)
	fromAccount := createTestAccount(t, db, user.ID, 100.0)
	toAccount := createTestAccount(t, db, user.ID, 500.0)

	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Test data - insufficient balance
	req := &models.TransferRequest{
		FromAccountID: fromAccount.ID,
		ToAccountID:   toAccount.ID,
		Amount:        200.0, // More than available
		Description:   "Invalid transfer",
		Date:          time.Now(),
		Tags:          []string{},
	}

	// Execute
	response, err := service.Transfer(user.ID, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "insufficient balance")
}

func TestTransactionService_GetCategories(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	transactionRepo := repository.NewTransactionRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	service := NewTransactionService(transactionRepo, accountRepo, db)

	// Execute
	categories := service.GetCategories()

	// Assert
	assert.NotEmpty(t, categories)
	assert.Contains(t, categories, "Food & Dining")
	assert.Contains(t, categories, "Shopping")
	assert.Contains(t, categories, "Income")
}
