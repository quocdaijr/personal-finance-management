package repository

import (
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"gorm.io/gorm"
)

// BalanceHistoryRepository handles database operations for balance history
type BalanceHistoryRepository struct {
	db *gorm.DB
}

// NewBalanceHistoryRepository creates a new balance history repository
func NewBalanceHistoryRepository(db *gorm.DB) *BalanceHistoryRepository {
	return &BalanceHistoryRepository{db: db}
}

// Create creates a new balance history record
func (r *BalanceHistoryRepository) Create(history *models.BalanceHistory) error {
	return r.db.Create(history).Error
}

// GetByAccountID gets all balance history for an account
func (r *BalanceHistoryRepository) GetByAccountID(userID uint, accountID uint, limit int) ([]models.BalanceHistory, error) {
	var history []models.BalanceHistory
	query := r.db.Where("user_id = ? AND account_id = ?", userID, accountID).
		Order("recorded_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&history).Error
	if err != nil {
		return nil, err
	}
	return history, nil
}

// GetByDateRange gets balance history within a date range
func (r *BalanceHistoryRepository) GetByDateRange(userID uint, accountID uint, startDate, endDate time.Time) ([]models.BalanceHistory, error) {
	var history []models.BalanceHistory
	err := r.db.Where("user_id = ? AND account_id = ? AND recorded_at >= ? AND recorded_at <= ?", 
		userID, accountID, startDate, endDate).
		Order("recorded_at ASC").
		Find(&history).Error
	if err != nil {
		return nil, err
	}
	return history, nil
}

// GetDailyBalances gets daily aggregated balances for an account
func (r *BalanceHistoryRepository) GetDailyBalances(userID uint, accountID uint, days int) ([]models.DailyBalance, error) {
	var results []models.DailyBalance
	
	startDate := time.Now().AddDate(0, 0, -days)
	
	// Get the last balance for each day
	err := r.db.Raw(`
		SELECT 
			DATE(recorded_at) as date,
			(SELECT balance FROM balance_histories bh2 
			 WHERE bh2.account_id = balance_histories.account_id 
			 AND DATE(bh2.recorded_at) = DATE(balance_histories.recorded_at)
			 ORDER BY bh2.recorded_at DESC LIMIT 1) as balance,
			COALESCE(SUM(CASE WHEN change_type = 'income' THEN change_amount ELSE 0 END), 0) as income,
			COALESCE(SUM(CASE WHEN change_type = 'expense' THEN ABS(change_amount) ELSE 0 END), 0) as expense
		FROM balance_histories
		WHERE user_id = ? AND account_id = ? AND recorded_at >= ?
		GROUP BY DATE(recorded_at)
		ORDER BY date ASC
	`, userID, accountID, startDate).Scan(&results).Error
	
	if err != nil {
		return nil, err
	}
	
	return results, nil
}

// GetAllAccountsDailyBalances gets daily balances for all accounts
func (r *BalanceHistoryRepository) GetAllAccountsDailyBalances(userID uint, days int) ([]models.DailyBalance, error) {
	var results []models.DailyBalance
	
	startDate := time.Now().AddDate(0, 0, -days)
	
	err := r.db.Raw(`
		SELECT 
			DATE(recorded_at) as date,
			SUM(balance) as balance,
			COALESCE(SUM(CASE WHEN change_type = 'income' THEN change_amount ELSE 0 END), 0) as income,
			COALESCE(SUM(CASE WHEN change_type = 'expense' THEN ABS(change_amount) ELSE 0 END), 0) as expense
		FROM (
			SELECT DISTINCT ON (account_id, DATE(recorded_at))
				account_id, DATE(recorded_at) as recorded_at, balance, change_type, change_amount
			FROM balance_histories
			WHERE user_id = ? AND recorded_at >= ?
			ORDER BY account_id, DATE(recorded_at), recorded_at DESC
		) daily_balances
		GROUP BY DATE(recorded_at)
		ORDER BY date ASC
	`, userID, startDate).Scan(&results).Error
	
	if err != nil {
		// Fallback for SQLite (which doesn't support DISTINCT ON)
		err = r.db.Raw(`
			SELECT 
				DATE(recorded_at) as date,
				SUM(balance) as balance,
				COALESCE(SUM(CASE WHEN change_type = 'income' THEN change_amount ELSE 0 END), 0) as income,
				COALESCE(SUM(CASE WHEN change_type = 'expense' THEN ABS(change_amount) ELSE 0 END), 0) as expense
			FROM balance_histories
			WHERE user_id = ? AND recorded_at >= ?
			GROUP BY DATE(recorded_at)
			ORDER BY date ASC
		`, userID, startDate).Scan(&results).Error
	}
	
	return results, err
}

// RecordBalanceChange records a balance change
func (r *BalanceHistoryRepository) RecordBalanceChange(userID uint, accountID uint, newBalance float64, changeAmount float64, changeType string, transactionID *uint, description string) error {
	history := &models.BalanceHistory{
		UserID:        userID,
		AccountID:     accountID,
		Balance:       newBalance,
		ChangeAmount:  changeAmount,
		ChangeType:    changeType,
		TransactionID: transactionID,
		Description:   description,
		RecordedAt:    time.Now(),
	}
	return r.Create(history)
}

