package migrations

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
	"log"
)

// RunSprint4Migrations runs all Sprint 4 database migrations
func RunSprint4Migrations(db *gorm.DB) error {
	log.Println("Running Sprint 4 migrations...")

	// Auto-migrate new tables and update existing tables with new columns
	// AutoMigrate will automatically add missing columns with proper constraints and indexes
	err := db.AutoMigrate(
		&models.Report{},
		&models.ReportExecution{},
		&models.TaxCategory{},
		&models.Transaction{}, // Include Transaction to ensure tax_category_id column is added with proper constraints
	)

	if err != nil {
		log.Printf("Error running Sprint 4 migrations: %v", err)
		return err
	}

	log.Println("✓ Sprint 4 migrations completed successfully")
	return nil
}
