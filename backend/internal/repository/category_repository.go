package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// CategoryRepository handles database operations for categories
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new category repository
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create creates a new category
func (r *CategoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

// GetByID gets a category by ID
func (r *CategoryRepository) GetByID(id uint, userID uint) (*models.Category, error) {
	var category models.Category
	err := r.db.Preload("Children").
		Where("id = ? AND (user_id = ? OR is_system = ?)", id, userID, true).
		First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetAll gets all categories for a user (including system categories)
func (r *CategoryRepository) GetAll(userID uint) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Preload("Children", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).
		Where("(user_id = ? OR is_system = ?) AND parent_id IS NULL AND is_active = ?", userID, true, true).
		Order("sort_order ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}

// GetByType gets categories by type
func (r *CategoryRepository) GetByType(userID uint, categoryType models.CategoryType) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Preload("Children", func(db *gorm.DB) *gorm.DB {
		return db.Where("type = ? OR type = ?", categoryType, models.CategoryTypeBoth).Order("sort_order ASC")
	}).
		Where("(user_id = ? OR is_system = ?) AND parent_id IS NULL AND is_active = ? AND (type = ? OR type = ?)",
			userID, true, true, categoryType, models.CategoryTypeBoth).
		Order("sort_order ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}

// GetByName gets a category by name for a user
func (r *CategoryRepository) GetByName(userID uint, name string) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("(user_id = ? OR is_system = ?) AND name = ? AND is_active = ?", userID, true, name, true).
		First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Update updates a category
func (r *CategoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

// Delete soft deletes a category (sets is_active to false)
func (r *CategoryRepository) Delete(id uint, userID uint) error {
	return r.db.Model(&models.Category{}).
		Where("id = ? AND user_id = ? AND is_system = ?", id, userID, false).
		Update("is_active", false).Error
}

// HardDelete permanently deletes a category (only for non-system categories)
func (r *CategoryRepository) HardDelete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ? AND is_system = ?", id, userID, false).
		Delete(&models.Category{}).Error
}

// InitializeDefaultCategories creates default categories for a new user
func (r *CategoryRepository) InitializeDefaultCategories(userID uint) error {
	defaults := models.DefaultCategories()
	for _, cat := range defaults {
		cat.UserID = userID
		if err := r.db.Create(&cat).Error; err != nil {
			// Ignore duplicate errors
			continue
		}
	}
	return nil
}

// CountByUser counts categories for a user
func (r *CategoryRepository) CountByUser(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Category{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&count).Error
	return count, err
}

// GetUserCategories gets only user-created categories (not system)
func (r *CategoryRepository) GetUserCategories(userID uint) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Where("user_id = ? AND is_system = ? AND is_active = ?", userID, false, true).
		Order("sort_order ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}

