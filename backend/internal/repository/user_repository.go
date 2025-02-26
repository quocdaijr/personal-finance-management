package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll() ([]*models.User, error) {
	var users []*models.User
	result := r.db.Find(&users)
	return users, result.Error
}
func (r *UserRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	result := r.db.First(&user, id)
	return &user, result.Error
}
