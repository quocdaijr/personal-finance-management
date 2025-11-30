package database

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/utils"
	"gorm.io/gorm"
)

// SeedDatabase populates the database with initial test data
func SeedDatabase(db *gorm.DB) error {
	// Check if data already exists
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		return nil // Data already exists
	}

	// Create test user
	hashedPassword, err := utils.HashPassword("password123")
	if err != nil {
		return err
	}

	testUser := &models.User{
		Username:         "testuser",
		Email:           "test@example.com",
		Password:        hashedPassword,
		FirstName:       "Test",
		LastName:        "User",
		IsActive:        true,
		IsEmailVerified: true,
		TwoFactorEnabled: false,
	}

	if err := db.Create(testUser).Error; err != nil {
		return err
	}

	// Create dainq user
	dainqPassword, err := utils.HashPassword("11111111")
	if err != nil {
		return err
	}

	dainqUser := &models.User{
		Username:         "dainq",
		Email:           "dainq@example.com",
		Password:        dainqPassword,
		FirstName:       "Dai",
		LastName:        "Nguyen",
		IsActive:        true,
		IsEmailVerified: true,
		TwoFactorEnabled: false,
	}

	if err := db.Create(dainqUser).Error; err != nil {
		return err
	}

	// Create test accounts
	accounts := []*models.Account{
		{
			UserID:    testUser.ID,
			Name:      "Checking Account",
			Type:      "checking",
			Balance:   1500.00,
			Currency:  "USD",
			IsDefault: true,
		},
		{
			UserID:   testUser.ID,
			Name:     "Savings Account",
			Type:     "savings",
			Balance:  5000.00,
			Currency: "USD",
		},
		{
			UserID:   testUser.ID,
			Name:     "Credit Card",
			Type:     "credit",
			Balance:  -250.00,
			Currency: "USD",
		},
	}

	for _, account := range accounts {
		if err := db.Create(account).Error; err != nil {
			return err
		}
	}

	// Create accounts for dainq user
	dainqAccounts := []*models.Account{
		{
			UserID:    dainqUser.ID,
			Name:      "Main Checking",
			Type:      "checking",
			Balance:   3500.00,
			Currency:  "USD",
			IsDefault: true,
		},
		{
			UserID:   dainqUser.ID,
			Name:     "Emergency Fund",
			Type:     "savings",
			Balance:  10000.00,
			Currency: "USD",
		},
		{
			UserID:   dainqUser.ID,
			Name:     "Visa Card",
			Type:     "credit",
			Balance:  -500.00,
			Currency: "USD",
		},
	}

	for _, account := range dainqAccounts {
		if err := db.Create(account).Error; err != nil {
			return err
		}
	}

	// Create test transactions
	now := time.Now()
	transactions := []*models.Transaction{
		{
			UserID:      testUser.ID,
			Amount:      -85.50,
			Description: "Grocery shopping",
			Category:    "Food & Dining",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -1),
			AccountID:   accounts[0].ID,
			Tags:        "groceries,food",
		},
		{
			UserID:      testUser.ID,
			Amount:      -45.00,
			Description: "Gas station",
			Category:    "Transportation",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -2),
			AccountID:   accounts[0].ID,
			Tags:        "gas,transportation",
		},
		{
			UserID:      testUser.ID,
			Amount:      2500.00,
			Description: "Salary deposit",
			Category:    "Income",
			Type:        "income",
			Date:        now.AddDate(0, 0, -3),
			AccountID:   accounts[0].ID,
			Tags:        "salary,income",
		},
		{
			UserID:      testUser.ID,
			Amount:      -120.00,
			Description: "Electric bill",
			Category:    "Bills & Utilities",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -5),
			AccountID:   accounts[0].ID,
			Tags:        "utilities,bills",
		},
		{
			UserID:      testUser.ID,
			Amount:      -35.99,
			Description: "Netflix subscription",
			Category:    "Entertainment",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -7),
			AccountID:   accounts[0].ID,
			Tags:        "subscription,entertainment",
		},
	}

	for _, transaction := range transactions {
		if err := db.Create(transaction).Error; err != nil {
			return err
		}
	}

	// Create transactions for dainq user
	dainqTransactions := []*models.Transaction{
		{
			UserID:      dainqUser.ID,
			Amount:      -150.00,
			Description: "Restaurant dinner",
			Category:    "Food & Dining",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -1),
			AccountID:   dainqAccounts[0].ID,
			Tags:        "dining,food",
		},
		{
			UserID:      dainqUser.ID,
			Amount:      -60.00,
			Description: "Uber rides",
			Category:    "Transportation",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -2),
			AccountID:   dainqAccounts[0].ID,
			Tags:        "uber,transportation",
		},
		{
			UserID:      dainqUser.ID,
			Amount:      5000.00,
			Description: "Monthly salary",
			Category:    "Income",
			Type:        "income",
			Date:        now.AddDate(0, 0, -3),
			AccountID:   dainqAccounts[0].ID,
			Tags:        "salary,income",
		},
		{
			UserID:      dainqUser.ID,
			Amount:      -200.00,
			Description: "Internet bill",
			Category:    "Bills & Utilities",
			Type:        "expense",
			Date:        now.AddDate(0, 0, -5),
			AccountID:   dainqAccounts[0].ID,
			Tags:        "utilities,bills",
		},
	}

	for _, transaction := range dainqTransactions {
		if err := db.Create(transaction).Error; err != nil {
			return err
		}
	}

	// Create test budgets
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)

	budgets := []*models.Budget{
		{
			UserID:    testUser.ID,
			Name:      "Food Budget",
			Amount:    500.00,
			Spent:     85.50,
			Category:  "Food & Dining",
			Period:    "monthly",
			StartDate: startOfMonth,
			EndDate:   endOfMonth,
		},
		{
			UserID:    testUser.ID,
			Name:      "Transportation Budget",
			Amount:    200.00,
			Spent:     45.00,
			Category:  "Transportation",
			Period:    "monthly",
			StartDate: startOfMonth,
			EndDate:   endOfMonth,
		},
		{
			UserID:    testUser.ID,
			Name:      "Entertainment Budget",
			Amount:    150.00,
			Spent:     35.99,
			Category:  "Entertainment",
			Period:    "monthly",
			StartDate: startOfMonth,
			EndDate:   endOfMonth,
		},
	}

	for _, budget := range budgets {
		if err := db.Create(budget).Error; err != nil {
			return err
		}
	}

	return nil
}
