package migrations

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
	"log"
)

// RunSprint4Migrations runs all Sprint 4 database migrations
func RunSprint4Migrations(db *gorm.DB) error {
	log.Println("Running Sprint 4 migrations...")

	// Auto-migrate new tables
	err := db.AutoMigrate(
		&models.Report{},
		&models.ReportExecution{},
		&models.TaxCategory{},
	)

	if err != nil {
		log.Printf("Error running Sprint 4 migrations: %v", err)
		return err
	}

	// Add tax_category_id column to transactions table if it doesn't exist
	if !db.Migrator().HasColumn(&models.Transaction{}, "tax_category_id") {
		err = db.Migrator().AddColumn(&models.Transaction{}, "tax_category_id")
		if err != nil {
			log.Printf("Error adding tax_category_id column: %v", err)
			return err
		}
		log.Println("✓ Added tax_category_id column to transactions table")
	}

	log.Println("✓ Sprint 4 migrations completed successfully")
	return nil
}
