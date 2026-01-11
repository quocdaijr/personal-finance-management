package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// HouseholdRepository handles database operations for households
type HouseholdRepository struct {
	db *gorm.DB
}

// NewHouseholdRepository creates a new household repository
func NewHouseholdRepository(db *gorm.DB) *HouseholdRepository {
	return &HouseholdRepository{db: db}
}

// Create creates a new household
func (r *HouseholdRepository) Create(household *models.Household) error {
	return r.db.Create(household).Error
}

// CreateWithMember creates a household and adds the creator as a member in a transaction
func (r *HouseholdRepository) CreateWithMember(household *models.Household, member *models.HouseholdMember) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create household
		if err := tx.Create(household).Error; err != nil {
			return err
		}

		// Set household ID for member
		member.HouseholdID = household.ID

		// Create member
		if err := tx.Create(member).Error; err != nil {
			return err
		}

		return nil
	})
}

// GetByID gets a household by ID
func (r *HouseholdRepository) GetByID(id uint) (*models.Household, error) {
	var household models.Household
	err := r.db.Preload("Creator").Preload("Members").Preload("Members.User").
		Where("id = ?", id).First(&household).Error
	if err != nil {
		return nil, err
	}
	return &household, nil
}

// GetByUser gets all households a user is part of
func (r *HouseholdRepository) GetByUser(userID uint) ([]models.Household, error) {
	var households []models.Household
	err := r.db.Joins("JOIN household_members ON household_members.household_id = households.id").
		Where("household_members.user_id = ?", userID).
		Preload("Creator").Preload("Members").Preload("Members.User").
		Find(&households).Error
	return households, err
}

// GetByCreator gets all households created by a user
func (r *HouseholdRepository) GetByCreator(userID uint) ([]models.Household, error) {
	var households []models.Household
	err := r.db.Where("created_by = ?", userID).
		Preload("Members").Preload("Members.User").
		Find(&households).Error
	return households, err
}

// Update updates a household
func (r *HouseholdRepository) Update(household *models.Household) error {
	return r.db.Save(household).Error
}

// Delete deletes a household
func (r *HouseholdRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete all household members first
		if err := tx.Where("household_id = ?", id).Delete(&models.HouseholdMember{}).Error; err != nil {
			return err
		}
		// Delete household
		return tx.Delete(&models.Household{}, id).Error
	})
}

// IsMember checks if a user is a member of a household
func (r *HouseholdRepository) IsMember(householdID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.HouseholdMember{}).
		Where("household_id = ? AND user_id = ?", householdID, userID).
		Count(&count).Error
	return count > 0, err
}
