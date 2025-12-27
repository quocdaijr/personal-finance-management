package repository

import (
	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// CommentRepository handles database operations for comments
type CommentRepository struct {
	db *gorm.DB
}

// NewCommentRepository creates a new comment repository
func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// Create creates a new comment
func (r *CommentRepository) Create(comment *models.Comment) error {
	return r.db.Create(comment).Error
}

// GetByID gets a comment by ID
func (r *CommentRepository) GetByID(id uint) (*models.Comment, error) {
	var comment models.Comment
	err := r.db.Preload("User").Preload("Transaction").
		Where("id = ?", id).First(&comment).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// GetByTransaction gets all comments for a transaction
func (r *CommentRepository) GetByTransaction(transactionID uint) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("User").
		Where("transaction_id = ?", transactionID).
		Order("created_at ASC").
		Find(&comments).Error
	return comments, err
}

// GetByUser gets all comments by a user
func (r *CommentRepository) GetByUser(userID uint) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("Transaction").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&comments).Error
	return comments, err
}

// Update updates a comment
func (r *CommentRepository) Update(comment *models.Comment) error {
	return r.db.Save(comment).Error
}

// Delete deletes a comment
func (r *CommentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Comment{}, id).Error
}

// GetCommentsWithMentions gets comments that mention a specific user
func (r *CommentRepository) GetCommentsWithMentions(userID uint) ([]models.Comment, error) {
	var comments []models.Comment
	err := r.db.Preload("User").Preload("Transaction").
		Where("? = ANY(mentions)", userID).
		Order("created_at DESC").
		Find(&comments).Error
	return comments, err
}
