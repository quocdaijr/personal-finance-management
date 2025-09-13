package main

import (
	"fmt"
	"log"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/infrastructure/database"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	fmt.Println("Testing repository operations...")

	// Initialize DB with SQLite
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	err = db.AutoMigrate(
		&models.User{},
		&models.Account{},
		&models.Transaction{},
		&models.Budget{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed database
	fmt.Println("Seeding database...")
	err = database.SeedDatabase(db)
	if err != nil {
		log.Fatal("Failed to seed database:", err)
	}
	fmt.Println("Database seeded successfully!")

	// Test repositories
	fmt.Println("Testing repositories...")

	// Test User Repository
	userRepo := repository.NewUserRepository(db)
	users, err := userRepo.GetAll()
	if err != nil {
		log.Fatal("Failed to get users:", err)
	}
	fmt.Printf("Found %d users\n", len(users))

	if len(users) > 0 {
		user := users[0]
		fmt.Printf("Test user: %s (%s)\n", user.Username, user.Email)

		// Test Account Repository
		accountRepo := repository.NewAccountRepository(db)
		accounts, err := accountRepo.GetAll(user.ID)
		if err != nil {
			log.Fatal("Failed to get accounts:", err)
		}
		fmt.Printf("Found %d accounts for user %s\n", len(accounts), user.Username)

		// Test Transaction Repository
		transactionRepo := repository.NewTransactionRepository(db)
		transactions, err := transactionRepo.GetAll(user.ID)
		if err != nil {
			log.Fatal("Failed to get transactions:", err)
		}
		fmt.Printf("Found %d transactions for user %s\n", len(transactions), user.Username)

		// Test Budget Repository
		budgetRepo := repository.NewBudgetRepository(db)
		budgets, err := budgetRepo.GetAll(user.ID)
		if err != nil {
			log.Fatal("Failed to get budgets:", err)
		}
		fmt.Printf("Found %d budgets for user %s\n", len(budgets), user.Username)

		// Test summary operations
		accountSummary, err := accountRepo.GetSummary(user.ID)
		if err != nil {
			log.Fatal("Failed to get account summary:", err)
		}
		fmt.Printf("Account Summary - Total Assets: $%.2f, Net Worth: $%.2f\n", 
			accountSummary.TotalAssets, accountSummary.NetWorth)

		budgetSummary, err := budgetRepo.GetSummary(user.ID)
		if err != nil {
			log.Fatal("Failed to get budget summary:", err)
		}
		fmt.Printf("Budget Summary - Total Budgeted: $%.2f, Total Spent: $%.2f\n", 
			budgetSummary.TotalBudgeted, budgetSummary.TotalSpent)
	}

	fmt.Println("All repository tests passed!")
}
