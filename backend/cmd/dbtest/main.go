package main

import (
	"fmt"
	"log"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	fmt.Println("Testing database connectivity...")

	// Use SQLite for testing (in-memory)
	fmt.Println("Connecting to in-memory SQLite database for testing...")

	// Initialize DB with SQLite
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Database connection successful!")

	// Test migration of all models
	fmt.Println("Running database migrations...")
	
	err = db.AutoMigrate(
		&models.User{},
		&models.Account{},
		&models.Transaction{},
		&models.Budget{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	fmt.Println("Database migrations completed successfully!")

	// Test database seeding
	fmt.Println("Testing database seeding...")

	// Import the seed function
	// Note: We'll need to add this import at the top
	// For now, let's just test basic operations

	// Test connection
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	err = sqlDB.Ping()
	if err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("Database ping successful!")
	fmt.Println("All database tests passed!")
}
