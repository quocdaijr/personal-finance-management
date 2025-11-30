package services

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// BudgetAlertService handles budget alert checks and notifications
type BudgetAlertService struct {
	budgetRepo       *repository.BudgetRepository
	transactionRepo  *repository.TransactionRepository
	notificationRepo *repository.NotificationRepository
}

// NewBudgetAlertService creates a new budget alert service
func NewBudgetAlertService(
	budgetRepo *repository.BudgetRepository,
	transactionRepo *repository.TransactionRepository,
	notificationRepo *repository.NotificationRepository,
) *BudgetAlertService {
	return &BudgetAlertService{
		budgetRepo:       budgetRepo,
		transactionRepo:  transactionRepo,
		notificationRepo: notificationRepo,
	}
}

// CheckBudgetsAfterTransaction checks if any budgets are exceeded after a transaction
func (s *BudgetAlertService) CheckBudgetsAfterTransaction(userID uint, category string) error {
	// Get all active budgets for the user
	budgets, err := s.budgetRepo.GetActive(userID)
	if err != nil {
		return err
	}

	now := time.Now()

	for _, budget := range budgets {
		// Check if the category matches (or if budget applies to all categories)
		if budget.Category != "" && budget.Category != category {
			continue
		}

		// Calculate spent amount
		var startDate, endDate time.Time
		switch budget.Period {
		case "weekly":
			startDate = now.AddDate(0, 0, -int(now.Weekday()))
			endDate = now
		case "monthly":
			startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
			endDate = now
		case "yearly":
			startDate = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
			endDate = now
		default:
			startDate = budget.StartDate
			endDate = now
		}

		// Get spent amount for this budget
		spent, err := s.transactionRepo.GetTotalSpentByCategory(userID, budget.Category, startDate, endDate)
		if err != nil {
			continue
		}

		percentage := (spent / budget.Amount) * 100

		// Check thresholds and create notifications
		if percentage >= 100 {
			s.createBudgetNotification(userID, budget.ID, budget.Name, percentage, "exceeded")
		} else if percentage >= 90 {
			s.createBudgetNotification(userID, budget.ID, budget.Name, percentage, "warning_90")
		} else if percentage >= 75 {
			s.createBudgetNotification(userID, budget.ID, budget.Name, percentage, "warning_75")
		} else if percentage >= 50 {
			s.createBudgetNotification(userID, budget.ID, budget.Name, percentage, "info_50")
		}
	}

	return nil
}

func (s *BudgetAlertService) createBudgetNotification(userID uint, budgetID uint, budgetName string, percentage float64, alertType string) {
	// Check if we already sent this type of notification recently (within 24 hours)
	// This prevents spamming the user with the same notification
	recentNotifications, _ := s.notificationRepo.GetAll(userID, 50)
	for _, n := range recentNotifications {
		if n.RelatedID != nil && *n.RelatedID == budgetID && n.Type == models.NotificationTypeBudgetAlert {
			// Check if notification was created within last 24 hours
			if time.Since(n.CreatedAt) < 24*time.Hour {
				return // Already notified recently
			}
		}
	}

	var title, message string
	var priority models.NotificationPriority

	switch alertType {
	case "exceeded":
		title = "🚨 Budget Exceeded!"
		message = "You've exceeded your " + budgetName + " budget!"
		priority = models.PriorityHigh
	case "warning_90":
		title = "⚠️ Budget Warning"
		message = "You've used 90% of your " + budgetName + " budget."
		priority = models.PriorityHigh
	case "warning_75":
		title = "📊 Budget Alert"
		message = "You've used 75% of your " + budgetName + " budget."
		priority = models.PriorityMedium
	case "info_50":
		title = "💡 Budget Update"
		message = "You've used 50% of your " + budgetName + " budget."
		priority = models.PriorityLow
	default:
		return
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

	s.notificationRepo.Create(notification)
}

// CheckAllBudgets checks all budgets for a user (can be called periodically)
func (s *BudgetAlertService) CheckAllBudgets(userID uint) error {
	return s.CheckBudgetsAfterTransaction(userID, "")
}

