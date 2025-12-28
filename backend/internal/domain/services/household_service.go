package services

import (
	"errors"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
)

// HouseholdService handles business logic for households and family budgeting
type HouseholdService struct {
	householdRepo       *repository.HouseholdRepository
	householdMemberRepo *repository.HouseholdMemberRepository
	budgetRepo          *repository.BudgetRepository
	goalRepo            *repository.GoalRepository
	userRepo            *repository.UserRepository
	activityLogRepo     *repository.ActivityLogRepository
}

// NewHouseholdService creates a new household service
func NewHouseholdService(
	householdRepo *repository.HouseholdRepository,
	householdMemberRepo *repository.HouseholdMemberRepository,
	budgetRepo *repository.BudgetRepository,
	goalRepo *repository.GoalRepository,
	userRepo *repository.UserRepository,
	activityLogRepo *repository.ActivityLogRepository,
) *HouseholdService {
	return &HouseholdService{
		householdRepo:       householdRepo,
		householdMemberRepo: householdMemberRepo,
		budgetRepo:          budgetRepo,
		goalRepo:            goalRepo,
		userRepo:            userRepo,
		activityLogRepo:     activityLogRepo,
	}
}

// CreateHousehold creates a new household
func (s *HouseholdService) CreateHousehold(userID uint, req *models.HouseholdRequest) (*models.Household, error) {
	// Create household
	household := &models.Household{
		Name:      req.Name,
		CreatedBy: userID,
	}

	// Add creator as parent member
	member := &models.HouseholdMember{
		UserID:       userID,
		Relationship: "parent",
		IsDependent:  false,
	}

	// Create both household and member in a transaction
	if err := s.householdRepo.CreateWithMember(household, member); err != nil {
		return nil, err
	}

	return household, nil
}

// GetHouseholds gets all households a user is part of
func (s *HouseholdService) GetHouseholds(userID uint) ([]models.HouseholdResponse, error) {
	households, err := s.householdRepo.GetByUser(userID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.HouseholdResponse
	for _, household := range households {
		members := s.convertMembersToResponse(household.Members)
		response := models.HouseholdResponse{
			ID:        household.ID,
			Name:      household.Name,
			CreatedBy: household.CreatedBy,
			Members:   members,
			CreatedAt: household.CreatedAt,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// GetHousehold gets a household by ID
func (s *HouseholdService) GetHousehold(householdID, userID uint) (*models.HouseholdResponse, error) {
	// Check if user is a member
	isMember, err := s.householdRepo.IsMember(householdID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("you are not a member of this household")
	}

	household, err := s.householdRepo.GetByID(householdID)
	if err != nil {
		return nil, err
	}

	members := s.convertMembersToResponse(household.Members)
	response := &models.HouseholdResponse{
		ID:        household.ID,
		Name:      household.Name,
		CreatedBy: household.CreatedBy,
		Members:   members,
		CreatedAt: household.CreatedAt,
	}

	return response, nil
}

// AddMember adds a member to a household
func (s *HouseholdService) AddMember(householdID, adderID uint, req *models.HouseholdMemberRequest) (*models.HouseholdMember, error) {
	// Validate relationship
	validRelationships := map[string]bool{
		"parent": true,
		"child":  true,
		"spouse": true,
		"other":  true,
	}
	if !validRelationships[req.Relationship] {
		return nil, errors.New("invalid relationship: must be one of 'parent', 'child', 'spouse', or 'other'")
	}

	// Validate allowance amount (must be non-negative)
	if req.AllowanceAmount < 0 {
		return nil, errors.New("allowance amount must be non-negative")
	}

	// Validate frequency
	if req.AllowanceFrequency != "" {
		validFrequencies := map[string]bool{
			"daily":   true,
			"weekly":  true,
			"monthly": true,
			"yearly":  true,
		}
		if !validFrequencies[req.AllowanceFrequency] {
			return nil, errors.New("invalid allowance frequency: must be one of 'daily', 'weekly', 'monthly', or 'yearly'")
		}
	}

	// Check if adder is creator or parent
	household, err := s.householdRepo.GetByID(householdID)
	if err != nil {
		return nil, err
	}

	if household.CreatedBy != adderID {
		// Check if adder is a parent member
		adderMember, err := s.getHouseholdMemberByUser(householdID, adderID)
		if err != nil || adderMember == nil || adderMember.Relationship != "parent" {
			return nil, errors.New("only household creator or parents can add members")
		}
	}

	// Check if user exists
	_, err = s.userRepo.GetByID(req.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if already a member
	isMember, err := s.householdRepo.IsMember(householdID, req.UserID)
	if err != nil {
		return nil, err
	}
	if isMember {
		return nil, errors.New("user is already a member of this household")
	}

	// Create household member
	member := &models.HouseholdMember{
		HouseholdID:        householdID,
		UserID:             req.UserID,
		Relationship:       req.Relationship,
		IsDependent:        req.IsDependent,
		AllowanceAmount:    req.AllowanceAmount,
		AllowanceFrequency: req.AllowanceFrequency,
	}

	if err := s.householdMemberRepo.Create(member); err != nil {
		return nil, err
	}

	return member, nil
}

// UpdateAllowance updates a member's allowance
func (s *HouseholdService) UpdateAllowance(householdID, memberID, updaterID uint, amount float64, frequency string) error {
	// Validate amount (must be non-negative)
	if amount < 0 {
		return errors.New("allowance amount must be non-negative")
	}

	// Validate frequency
	validFrequencies := map[string]bool{
		"daily":   true,
		"weekly":  true,
		"monthly": true,
		"yearly":  true,
	}
	if frequency != "" && !validFrequencies[frequency] {
		return errors.New("invalid allowance frequency: must be one of 'daily', 'weekly', 'monthly', or 'yearly'")
	}

	// Check if updater is creator or parent
	household, err := s.householdRepo.GetByID(householdID)
	if err != nil {
		return err
	}

	if household.CreatedBy != updaterID {
		updaterMember, err := s.getHouseholdMemberByUser(householdID, updaterID)
		if err != nil || updaterMember == nil || updaterMember.Relationship != "parent" {
			return errors.New("only household creator or parents can update allowances")
		}
	}

	// Verify member belongs to this household (prevent cross-household updates)
	member, err := s.householdMemberRepo.GetByID(memberID)
	if err != nil {
		return err
	}
	if member.HouseholdID != householdID {
		return errors.New("member does not belong to this household")
	}

	// Update allowance
	if err := s.householdMemberRepo.UpdateAllowance(memberID, amount, frequency); err != nil {
		return err
	}

	return nil
}

// RemoveMember removes a member from a household
func (s *HouseholdService) RemoveMember(householdID, memberID, removerID uint) error {
	// Check if remover is creator or parent
	household, err := s.householdRepo.GetByID(householdID)
	if err != nil {
		return err
	}

	if household.CreatedBy != removerID {
		removerMember, err := s.getHouseholdMemberByUser(householdID, removerID)
		if err != nil || removerMember == nil || removerMember.Relationship != "parent" {
			return errors.New("only household creator or parents can remove members")
		}
	}

	// Get member to verify ownership and check if they're the creator
	member, err := s.householdMemberRepo.GetByID(memberID)
	if err != nil {
		return err
	}

	// Verify member belongs to this household (prevent cross-household deletions)
	if member.HouseholdID != householdID {
		return errors.New("member does not belong to this household")
	}

	if member.UserID == household.CreatedBy {
		return errors.New("cannot remove household creator")
	}

	// Remove member
	if err := s.householdMemberRepo.Delete(memberID); err != nil {
		return err
	}

	return nil
}

// GetHouseholdBudgets gets all budgets for a household
func (s *HouseholdService) GetHouseholdBudgets(householdID, userID uint) ([]models.Budget, error) {
	// Check if user is a member
	isMember, err := s.householdRepo.IsMember(householdID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("you are not a member of this household")
	}

	// Get household budgets
	var budgets []models.Budget
	err = s.budgetRepo.GetByHousehold(householdID, &budgets)
	return budgets, err
}

// GetHouseholdGoals gets all goals for a household
func (s *HouseholdService) GetHouseholdGoals(householdID, userID uint) ([]models.Goal, error) {
	// Check if user is a member
	isMember, err := s.householdRepo.IsMember(householdID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("you are not a member of this household")
	}

	// Get household goals
	var goals []models.Goal
	err = s.goalRepo.GetByHousehold(householdID, &goals)
	return goals, err
}

// Helper methods

func (s *HouseholdService) getHouseholdMemberByUser(householdID, userID uint) (*models.HouseholdMember, error) {
	members, err := s.householdMemberRepo.GetByHousehold(householdID)
	if err != nil {
		return nil, err
	}

	for _, member := range members {
		if member.UserID == userID {
			return &member, nil
		}
	}

	return nil, errors.New("user is not a member of this household")
}

func (s *HouseholdService) convertMembersToResponse(members []models.HouseholdMember) []models.HouseholdMemberResponse {
	var responses []models.HouseholdMemberResponse
	for _, member := range members {
		response := models.HouseholdMemberResponse{
			ID:                 member.ID,
			HouseholdID:        member.HouseholdID,
			UserID:             member.UserID,
			Relationship:       member.Relationship,
			IsDependent:        member.IsDependent,
			AllowanceAmount:    member.AllowanceAmount,
			AllowanceFrequency: member.AllowanceFrequency,
			CreatedAt:          member.CreatedAt,
		}

		// Safely access User relationship if it was preloaded
		if member.User != nil {
			response.Username = member.User.Username
			response.Email = member.User.Email
		}

		responses = append(responses, response)
	}
	return responses
}
