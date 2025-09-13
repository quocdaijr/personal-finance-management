package database

import (
	"fmt"

	"github.com/quocdaijr/finance-management-backend/internal/config"
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func NewPostgresDB(cfg *config.Config) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	if cfg.UseSQLite {
		// Use SQLite for development/testing
		db, err = gorm.Open(sqlite.Open("finance-management.db"), &gorm.Config{})
		if err != nil {
			return nil, fmt.Errorf("failed to connect to SQLite database: %w", err)
		}
	} else {
		// Use PostgreSQL for production
		dsn := fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			cfg.DBHost,
			cfg.DBUser,
			cfg.DBPassword,
			cfg.DBName,
			cfg.DBPort,
			cfg.DBSSLMode,
		)

		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			return nil, fmt.Errorf("failed to connect database: %w", err)
		}
	}

	// Auto migrate models
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return db, nil
}
