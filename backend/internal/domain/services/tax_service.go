package services

import (
	"errors"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// TaxService handles tax category business logic
type TaxService struct {
	taxRepo *repository.TaxRepository
}

// NewTaxService creates a new tax service
func NewTaxService(taxRepo *repository.TaxRepository) *TaxService {
	return &TaxService{
		taxRepo: taxRepo,
	}
}

// CreateCategory creates a new tax category
func (s *TaxService) CreateCategory(userID uint, req *models.CreateTaxCategoryRequest) (*models.TaxCategory, error) {
	// Validate tax type
	validTypes := map[string]bool{
		"deduction":    true,
		"income":       true,
		"capital_gain": true,
	}

	if !validTypes[req.TaxType] {
		return nil, errors.New("invalid tax type")
	}

	category := &models.TaxCategory{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		TaxType:     req.TaxType,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.taxRepo.CreateCategory(category)
	return category, err
}

// GetCategory retrieves a tax category by ID
func (s *TaxService) GetCategory(id, userID uint) (*models.TaxCategory, error) {
	return s.taxRepo.GetCategoryByID(id, userID)
}

// ListCategories lists all tax categories for a user
func (s *TaxService) ListCategories(userID uint) ([]models.TaxCategory, error) {
	return s.taxRepo.GetCategoriesByUserID(userID)
}

// UpdateCategory updates a tax category
func (s *TaxService) UpdateCategory(id, userID uint, req *models.UpdateTaxCategoryRequest) (*models.TaxCategory, error) {
	category, err := s.taxRepo.GetCategoryByID(id, userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Description != nil {
		category.Description = req.Description
	}
	if req.TaxType != nil {
		validTypes := map[string]bool{
			"deduction":    true,
			"income":       true,
			"capital_gain": true,
		}
		if !validTypes[*req.TaxType] {
			return nil, errors.New("invalid tax type")
		}
		category.TaxType = *req.TaxType
	}

	category.UpdatedAt = time.Now()

	err = s.taxRepo.UpdateCategory(category)
	return category, err
}

// DeleteCategory deletes a tax category
func (s *TaxService) DeleteCategory(id, userID uint) error {
	return s.taxRepo.DeleteCategory(id, userID)
}

// GetTaxReport generates an annual tax report
func (s *TaxService) GetTaxReport(userID uint, year int) (*models.TaxReportResponse, error) {
	// Validate year
	currentYear := time.Now().Year()
	if year < 2000 || year > currentYear {
		return nil, errors.New("invalid year")
	}

	return s.taxRepo.GetTaxReport(userID, year)
}
