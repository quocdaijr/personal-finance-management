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
