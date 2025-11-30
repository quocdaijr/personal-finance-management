package services

import (
	"strings"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// SearchResult represents a search result item
type SearchResult struct {
	Type        string      `json:"type"`        // "transaction", "account", "budget", "goal"
	ID          uint        `json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Amount      float64     `json:"amount,omitempty"`
	Date        string      `json:"date,omitempty"`
	URL         string      `json:"url"`
}

// SearchResponse represents the search response
type SearchResponse struct {
	Query        string         `json:"query"`
	TotalResults int            `json:"total_results"`
	Results      []SearchResult `json:"results"`
}

// SearchService handles global search operations
type SearchService struct {
	transactionRepo *repository.TransactionRepository
	accountRepo     *repository.AccountRepository
	budgetRepo      *repository.BudgetRepository
	goalRepo        *repository.GoalRepository
}

// NewSearchService creates a new search service
func NewSearchService(
	transactionRepo *repository.TransactionRepository,
	accountRepo *repository.AccountRepository,
	budgetRepo *repository.BudgetRepository,
	goalRepo *repository.GoalRepository,
) *SearchService {
	return &SearchService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		budgetRepo:      budgetRepo,
		goalRepo:        goalRepo,
	}
}

// Search performs a global search across all entities
func (s *SearchService) Search(userID uint, query string, limit int) (*SearchResponse, error) {
	if limit <= 0 {
		limit = 20
	}

	query = strings.ToLower(strings.TrimSpace(query))
	if query == "" {
		return &SearchResponse{Query: query, TotalResults: 0, Results: []SearchResult{}}, nil
	}

	var results []SearchResult

	// Search transactions
	transactions, err := s.searchTransactions(userID, query, limit)
	if err == nil {
		results = append(results, transactions...)
	}

	// Search accounts
	accounts, err := s.searchAccounts(userID, query, limit)
	if err == nil {
		results = append(results, accounts...)
	}

	// Search budgets
	budgets, err := s.searchBudgets(userID, query, limit)
	if err == nil {
		results = append(results, budgets...)
	}

	// Search goals
	goals, err := s.searchGoals(userID, query, limit)
	if err == nil {
		results = append(results, goals...)
	}

	// Limit total results
	if len(results) > limit {
		results = results[:limit]
	}

	return &SearchResponse{
		Query:        query,
		TotalResults: len(results),
		Results:      results,
	}, nil
}

func (s *SearchService) searchTransactions(userID uint, query string, limit int) ([]SearchResult, error) {
	var results []SearchResult

	filter := &models.TransactionFilter{
		Search:   query,
		Page:     1,
		PageSize: limit,
	}

	transactions, _, err := s.transactionRepo.GetFiltered(userID, filter)
	if err != nil {
		return nil, err
	}

	for _, t := range transactions {
		results = append(results, SearchResult{
			Type:        "transaction",
			ID:          t.ID,
			Title:       t.Description,
			Description: t.Category + " • " + t.Type,
			Amount:      t.Amount,
			Date:        t.Date.Format("2006-01-02"),
			URL:         "/transactions",
		})
	}

	return results, nil
}

func (s *SearchService) searchAccounts(userID uint, query string, limit int) ([]SearchResult, error) {
	var results []SearchResult

	accounts, err := s.accountRepo.GetAll(userID)
	if err != nil {
		return nil, err
	}

	for _, a := range accounts {
		if strings.Contains(strings.ToLower(a.Name), query) ||
			strings.Contains(strings.ToLower(a.Type), query) {
			results = append(results, SearchResult{
				Type:        "account",
				ID:          a.ID,
				Title:       a.Name,
				Description: a.Type + " Account",
				Amount:      a.Balance,
				URL:         "/accounts",
			})
		}
		if len(results) >= limit {
			break
		}
	}

	return results, nil
}

func (s *SearchService) searchBudgets(userID uint, query string, limit int) ([]SearchResult, error) {
	var results []SearchResult

	budgets, err := s.budgetRepo.GetAll(userID)
	if err != nil {
		return nil, err
	}

	for _, b := range budgets {
		if strings.Contains(strings.ToLower(b.Name), query) ||
			strings.Contains(strings.ToLower(b.Category), query) {
			results = append(results, SearchResult{
				Type:        "budget",
				ID:          b.ID,
				Title:       b.Name,
				Description: b.Category + " • " + b.Period,
				Amount:      b.Amount,
				URL:         "/budgets",
			})
		}
		if len(results) >= limit {
			break
		}
	}

	return results, nil
}

func (s *SearchService) searchGoals(userID uint, query string, limit int) ([]SearchResult, error) {
	var results []SearchResult

	goals, err := s.goalRepo.GetAll(userID)
	if err != nil {
		return nil, err
	}

	for _, g := range goals {
		if strings.Contains(strings.ToLower(g.Name), query) ||
			strings.Contains(strings.ToLower(g.Category), query) {
			results = append(results, SearchResult{
				Type:        "goal",
				ID:          g.ID,
				Title:       g.Name,
				Description: g.Category,
				Amount:      g.TargetAmount,
				Date:        g.TargetDate.Format("2006-01-02"),
				URL:         "/goals",
			})
		}
		if len(results) >= limit {
			break
		}
	}

	return results, nil
}

