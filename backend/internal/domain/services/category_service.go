package services

import (
	"errors"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// CategoryService handles business logic for categories
type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

// NewCategoryService creates a new category service
func NewCategoryService(categoryRepo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

// GetAll gets all categories for a user
func (s *CategoryService) GetAll(userID uint) ([]models.Category, error) {
	return s.categoryRepo.GetAll(userID)
}

// GetByType gets categories by type
func (s *CategoryService) GetByType(userID uint, categoryType string) ([]models.Category, error) {
	var catType models.CategoryType
	switch categoryType {
	case "income":
		catType = models.CategoryTypeIncome
	case "expense":
		catType = models.CategoryTypeExpense
	default:
		catType = models.CategoryTypeBoth
	}
	return s.categoryRepo.GetByType(userID, catType)
}

// GetByID gets a category by ID
func (s *CategoryService) GetByID(id uint, userID uint) (*models.Category, error) {
	return s.categoryRepo.GetByID(id, userID)
}

// Create creates a new category
func (s *CategoryService) Create(userID uint, req *models.CreateCategoryRequest) (*models.Category, error) {
	// Check if category with same name exists
	existing, _ := s.categoryRepo.GetByName(userID, req.Name)
	if existing != nil {
		return nil, errors.New("category with this name already exists")
	}

	// Determine category type
	catType := models.CategoryTypeBoth
	if req.Type == "income" {
		catType = models.CategoryTypeIncome
	} else if req.Type == "expense" {
		catType = models.CategoryTypeExpense
	}

	category := &models.Category{
		UserID:   userID,
		Name:     req.Name,
		Type:     catType,
		Icon:     req.Icon,
		Color:    req.Color,
		ParentID: req.ParentID,
		IsSystem: false,
		IsActive: true,
	}

	if err := s.categoryRepo.Create(category); err != nil {
		return nil, err
	}

	return category, nil
}

// Update updates a category
func (s *CategoryService) Update(id uint, userID uint, req *models.UpdateCategoryRequest) (*models.Category, error) {
	category, err := s.categoryRepo.GetByID(id, userID)
	if err != nil {
		return nil, errors.New("category not found")
	}

	// Don't allow updating system categories' core properties
	if category.IsSystem {
		// Only allow updating sort order for system categories
		if req.SortOrder != nil {
			category.SortOrder = *req.SortOrder
		}
	} else {
		// Update non-system category
		if req.Name != nil {
			category.Name = *req.Name
		}
		if req.Type != nil {
			switch *req.Type {
			case "income":
				category.Type = models.CategoryTypeIncome
			case "expense":
				category.Type = models.CategoryTypeExpense
			default:
				category.Type = models.CategoryTypeBoth
			}
		}
		if req.Icon != nil {
			category.Icon = *req.Icon
		}
		if req.Color != nil {
			category.Color = *req.Color
		}
		if req.IsActive != nil {
			category.IsActive = *req.IsActive
		}
		if req.SortOrder != nil {
			category.SortOrder = *req.SortOrder
		}
		if req.ParentID != nil {
			category.ParentID = req.ParentID
		}
	}

	if err := s.categoryRepo.Update(category); err != nil {
		return nil, err
	}

	return category, nil
}

// Delete deletes a category
func (s *CategoryService) Delete(id uint, userID uint) error {
	category, err := s.categoryRepo.GetByID(id, userID)
	if err != nil {
		return errors.New("category not found")
	}

	if category.IsSystem {
		return errors.New("cannot delete system category")
	}

	return s.categoryRepo.Delete(id, userID)
}

// InitializeForUser initializes default categories for a new user
func (s *CategoryService) InitializeForUser(userID uint) error {
	return s.categoryRepo.InitializeDefaultCategories(userID)
}

