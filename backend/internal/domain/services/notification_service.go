package services

import (
	"fmt"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// NotificationService handles business logic for notifications
type NotificationService struct {
	notificationRepo *repository.NotificationRepository
	budgetRepo       *repository.BudgetRepository
	goalRepo         *repository.GoalRepository
	recurringRepo    *repository.RecurringTransactionRepository
}

// NewNotificationService creates a new notification service
func NewNotificationService(
	notificationRepo *repository.NotificationRepository,
	budgetRepo *repository.BudgetRepository,
	goalRepo *repository.GoalRepository,
	recurringRepo *repository.RecurringTransactionRepository,
) *NotificationService {
	return &NotificationService{
		notificationRepo: notificationRepo,
		budgetRepo:       budgetRepo,
		goalRepo:         goalRepo,
		recurringRepo:    recurringRepo,
	}
}

// GetAll gets all notifications for a user
func (s *NotificationService) GetAll(userID uint, limit int) ([]models.Notification, error) {
	return s.notificationRepo.GetAll(userID, limit)
}

// GetUnread gets all unread notifications for a user
func (s *NotificationService) GetUnread(userID uint) ([]models.Notification, error) {
	return s.notificationRepo.GetUnread(userID)
}

// GetSummary gets notification summary for a user
func (s *NotificationService) GetSummary(userID uint) (*models.NotificationSummary, error) {
	return s.notificationRepo.GetSummary(userID)
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(id uint, userID uint) error {
	return s.notificationRepo.MarkAsRead(id, userID)
}

// MarkAllAsRead marks all notifications as read
func (s *NotificationService) MarkAllAsRead(userID uint) error {
	return s.notificationRepo.MarkAllAsRead(userID)
}

// Delete deletes a notification
func (s *NotificationService) Delete(id uint, userID uint) error {
	return s.notificationRepo.Delete(id, userID)
}

// CreateBudgetAlert creates a budget alert notification
func (s *NotificationService) CreateBudgetAlert(userID uint, budgetID uint, budgetName string, percentage float64) error {
	priority := models.PriorityMedium
	title := fmt.Sprintf("Budget Alert: %s", budgetName)
	message := fmt.Sprintf("You've used %.0f%% of your %s budget.", percentage, budgetName)

	if percentage >= 100 {
		priority = models.PriorityHigh
		message = fmt.Sprintf("You've exceeded your %s budget!", budgetName)
	} else if percentage >= 90 {
		priority = models.PriorityHigh
	}

	notification := &models.Notification{
		UserID:      userID,
		Type:        models.NotificationTypeBudgetAlert,
		Title:       title,
		Message:     message,
		Priority:    priority,
		ActionURL:   "/budgets",
		RelatedID:   &budgetID,
		RelatedType: "budget",
	}

	return s.notificationRepo.Create(notification)
}

// CreateGoalReminder creates a goal reminder notification
func (s *NotificationService) CreateGoalReminder(userID uint, goalID uint, goalName string, daysRemaining int, progress float64) error {
	priority := models.PriorityMedium
	title := fmt.Sprintf("Goal Reminder: %s", goalName)
	message := fmt.Sprintf("You're %.0f%% towards your goal. ", progress)

	if daysRemaining <= 7 && progress < 90 {
		priority = models.PriorityHigh
		message += fmt.Sprintf("Only %d days left!", daysRemaining)
	} else if daysRemaining <= 30 {
		message += fmt.Sprintf("%d days remaining.", daysRemaining)
	}

	notification := &models.Notification{
		UserID:      userID,
		Type:        models.NotificationTypeGoalReminder,
		Title:       title,
		Message:     message,
		Priority:    priority,
		ActionURL:   "/goals",
		RelatedID:   &goalID,
		RelatedType: "goal",
	}

	return s.notificationRepo.Create(notification)
}

// CreateGoalAchievement creates an achievement notification
func (s *NotificationService) CreateGoalAchievement(userID uint, goalID uint, goalName string) error {
	notification := &models.Notification{
		UserID:      userID,
		Type:        models.NotificationTypeAchievement,
		Title:       "🎉 Goal Achieved!",
		Message:     fmt.Sprintf("Congratulations! You've completed your goal: %s", goalName),
		Priority:    models.PriorityMedium,
		ActionURL:   "/goals",
		RelatedID:   &goalID,
		RelatedType: "goal",
	}

	return s.notificationRepo.Create(notification)
}

// CreateRecurringDueNotification creates notification for due recurring transactions
func (s *NotificationService) CreateRecurringDueNotification(userID uint, recurringID uint, description string) error {
	notification := &models.Notification{
		UserID:      userID,
		Type:        models.NotificationTypeRecurringDue,
		Title:       "Recurring Transaction Due",
		Message:     fmt.Sprintf("Your recurring transaction '%s' is due today.", description),
		Priority:    models.PriorityMedium,
		ActionURL:   "/recurring",
		RelatedID:   &recurringID,
		RelatedType: "recurring",
	}

	return s.notificationRepo.Create(notification)
}

