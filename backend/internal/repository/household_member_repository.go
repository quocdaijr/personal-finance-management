package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// HouseholdMemberRepository handles database operations for household members
type HouseholdMemberRepository struct {
	db *gorm.DB
}

// NewHouseholdMemberRepository creates a new household member repository
func NewHouseholdMemberRepository(db *gorm.DB) *HouseholdMemberRepository {
	return &HouseholdMemberRepository{db: db}
}

// Create creates a new household member
func (r *HouseholdMemberRepository) Create(member *models.HouseholdMember) error {
	return r.db.Create(member).Error
}

// GetByID gets a household member by ID
func (r *HouseholdMemberRepository) GetByID(id uint) (*models.HouseholdMember, error) {
	var member models.HouseholdMember
	err := r.db.Preload("User").Where("id = ?", id).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetByHouseholdID gets all members of a household
func (r *HouseholdMemberRepository) GetByHouseholdID(householdID uint) ([]models.HouseholdMember, error) {
	var members []models.HouseholdMember
	err := r.db.Preload("User").Where("household_id = ?", householdID).Find(&members).Error
	return members, err
}

// Update updates a household member
func (r *HouseholdMemberRepository) Update(member *models.HouseholdMember) error {
	return r.db.Save(member).Error
}

// Delete deletes a household member
func (r *HouseholdMemberRepository) Delete(id uint) error {
	return r.db.Where("id = ?", id).Delete(&models.HouseholdMember{}).Error
}

// GetByHousehold is an alias for GetByHouseholdID for backward compatibility
func (r *HouseholdMemberRepository) GetByHousehold(householdID uint) ([]models.HouseholdMember, error) {
	return r.GetByHouseholdID(householdID)
}

// UpdateAllowance updates a household member's allowance amount and frequency
func (r *HouseholdMemberRepository) UpdateAllowance(memberID uint, amount float64, frequency string) error {
	return r.db.Model(&models.HouseholdMember{}).
		Where("id = ?", memberID).
		Updates(map[string]interface{}{
			"allowance_amount":    amount,
			"allowance_frequency": frequency,
		}).Error
}
