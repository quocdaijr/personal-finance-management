package services

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetUsers() ([]*models.User, error) {
	return s.userRepo.GetAll()
}
func (s *UserService) GetUser(id uint) (*models.User, error) {
	return s.userRepo.GetByID(id)
}
