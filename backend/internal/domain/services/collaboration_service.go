package services

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/quocdaijr/finance-management-backend/internal/domain/models"
	"github.com/quocdaijr/finance-management-backend/internal/repository"
	"github.com/lib/pq"
)

// CollaborationService handles business logic for collaboration features
type CollaborationService struct {
	commentRepo         *repository.CommentRepository
	activityLogRepo     *repository.ActivityLogRepository
	approvalRepo        *repository.ApprovalWorkflowRepository
	transactionRepo     *repository.TransactionRepository
	accountMemberRepo   *repository.AccountMemberRepository
	notificationRepo    *repository.NotificationRepository
	permissionService   *PermissionService
}

// NewCollaborationService creates a new collaboration service
func NewCollaborationService(
	commentRepo *repository.CommentRepository,
	activityLogRepo *repository.ActivityLogRepository,
	approvalRepo *repository.ApprovalWorkflowRepository,
	transactionRepo *repository.TransactionRepository,
	accountMemberRepo *repository.AccountMemberRepository,
	notificationRepo *repository.NotificationRepository,
	permissionService *PermissionService,
) *CollaborationService {
	return &CollaborationService{
		commentRepo:       commentRepo,
		activityLogRepo:   activityLogRepo,
		approvalRepo:      approvalRepo,
		transactionRepo:   transactionRepo,
		accountMemberRepo: accountMemberRepo,
		notificationRepo:  notificationRepo,
		permissionService: permissionService,
	}
}

// AddComment adds a comment to a transaction
func (s *CollaborationService) AddComment(transactionID, userID uint, req *models.CommentRequest) (*models.Comment, error) {
	// Get transaction to validate access
	transaction, err := s.transactionRepo.GetByID(transactionID, userID)
	if err != nil {
		return nil, errors.New("transaction not found or you don't have access")
	}

	// Convert mentions slice to pq.Int64Array
	var mentions pq.Int64Array
	if len(req.Mentions) > 0 {
		mentions = make(pq.Int64Array, len(req.Mentions))
		for i, m := range req.Mentions {
			mentions[i] = int64(m)
		}
	}

	// Create comment
	comment := &models.Comment{
		TransactionID: transactionID,
		UserID:        userID,
		Content:       req.Content,
		Mentions:      mentions,
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, err
	}

	// Create notifications for mentioned users
	if len(req.Mentions) > 0 {
		s.createMentionNotifications(transaction.AccountID, userID, req.Mentions, transactionID)
	}

	// Log activity
	s.logActivity(transaction.AccountID, userID, "added_comment", "transaction", transactionID, map[string]interface{}{
		"comment_id": comment.ID,
	})

	return comment, nil
}

// GetComments gets all comments for a transaction
func (s *CollaborationService) GetComments(transactionID, userID uint) ([]models.CommentResponse, error) {
	// Validate access
	_, err := s.transactionRepo.GetByID(transactionID, userID)
	if err != nil {
		return nil, errors.New("transaction not found or you don't have access")
	}

	comments, err := s.commentRepo.GetByTransaction(transactionID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.CommentResponse
	for _, comment := range comments {
		mentions := make([]uint, len(comment.Mentions))
		for i, m := range comment.Mentions {
			mentions[i] = uint(m)
		}

		response := models.CommentResponse{
			ID:            comment.ID,
			TransactionID: comment.TransactionID,
			UserID:        comment.UserID,
			Username:      comment.User.Username,
			Content:       comment.Content,
			Mentions:      mentions,
			CreatedAt:     comment.CreatedAt,
			UpdatedAt:     comment.UpdatedAt,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// DeleteComment deletes a comment
func (s *CollaborationService) DeleteComment(commentID, userID uint) error {
	// Get the comment to check ownership
	comment, err := s.commentRepo.GetByID(commentID)
	if err != nil {
		return errors.New("comment not found")
	}

	// Check if user is the comment owner
	if comment.UserID != userID {
		return errors.New("you can only delete your own comments")
	}

	// Delete the comment
	if err := s.commentRepo.Delete(commentID); err != nil {
		return errors.New("failed to delete comment")
	}

	// Log activity
	s.logActivity(comment.TransactionID, userID, "delete", "comment", commentID, nil)

	return nil
}

// GetActivityLog gets activity log for an account
func (s *CollaborationService) GetActivityLog(accountID, userID uint, limit int) ([]models.ActivityLogResponse, error) {
	// Check if user has access to the account
	hasAccess, err := s.accountMemberRepo.HasAccess(accountID, userID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("you don't have access to this account")
	}

	logs, err := s.activityLogRepo.GetByAccount(accountID, limit)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.ActivityLogResponse
	for _, log := range logs {
		response := models.ActivityLogResponse{
			ID:         log.ID,
			AccountID:  log.AccountID,
			UserID:     log.UserID,
			Username:   log.User.Username,
			Action:     log.Action,
			EntityType: log.EntityType,
			EntityID:   log.EntityID,
			Details:    log.Details,
			CreatedAt:  log.CreatedAt,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// RequestApproval requests approval for a transaction
func (s *CollaborationService) RequestApproval(accountID, userID uint, req *models.ApprovalRequest) (*models.ApprovalWorkflow, error) {
	// Check if user has access to the account
	hasAccess, err := s.accountMemberRepo.HasAccess(accountID, userID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("you don't have access to this account")
	}

	// Validate transaction exists
	_, err = s.transactionRepo.GetByID(req.TransactionID, userID)
	if err != nil {
		return nil, errors.New("transaction not found")
	}

	// Check if approval workflow already exists
	exists, err := s.approvalRepo.ExistsByTransaction(req.TransactionID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("approval workflow already exists for this transaction")
	}

	// Create approval workflow
	workflow := &models.ApprovalWorkflow{
		AccountID:       accountID,
		TransactionID:   req.TransactionID,
		RequestedBy:     userID,
		Status:          "pending",
		ThresholdAmount: req.ThresholdAmount,
	}

	if err := s.approvalRepo.Create(workflow); err != nil {
		return nil, err
	}

	// Create notifications for account admins/owners
	s.createApprovalNotifications(accountID, userID, workflow.ID)

	// Log activity
	s.logActivity(accountID, userID, "requested_approval", "approval_workflow", workflow.ID, map[string]interface{}{
		"transaction_id": req.TransactionID,
		"amount":         req.ThresholdAmount,
	})

	return workflow, nil
}

// ApproveTransaction approves a transaction
func (s *CollaborationService) ApproveTransaction(workflowID, approverID uint) error {
	workflow, err := s.approvalRepo.GetByID(workflowID)
	if err != nil {
		return err
	}

	// Check if approver can approve
	if !workflow.CanApprove(approverID) {
		return errors.New("you cannot approve this request")
	}

	// Check if approver has permission
	canManage, err := s.permissionService.CanManageAccount(approverID, workflow.AccountID)
	if err != nil {
		return err
	}
	if !canManage {
		return errors.New("you don't have permission to approve transactions")
	}

	// Update workflow
	now := time.Now()
	workflow.Status = "approved"
	workflow.ApprovedBy = &approverID
	workflow.ApprovedAt = &now

	if err := s.approvalRepo.Update(workflow); err != nil {
		return err
	}

	// Create notification for requester
	s.createApprovalStatusNotification(workflow.AccountID, workflow.RequestedBy, workflow.ID, "approved")

	// Log activity
	s.logActivity(workflow.AccountID, approverID, "approved_transaction", "approval_workflow", workflowID, map[string]interface{}{
		"transaction_id": workflow.TransactionID,
		"requested_by":   workflow.RequestedBy,
	})

	return nil
}

// RejectTransaction rejects a transaction
func (s *CollaborationService) RejectTransaction(workflowID, rejecterID uint, reason string) error {
	workflow, err := s.approvalRepo.GetByID(workflowID)
	if err != nil {
		return err
	}

	// Check if rejecter can reject
	if !workflow.CanApprove(rejecterID) {
		return errors.New("you cannot reject this request")
	}

	// Check if rejecter has permission
	canManage, err := s.permissionService.CanManageAccount(rejecterID, workflow.AccountID)
	if err != nil {
		return err
	}
	if !canManage {
		return errors.New("you don't have permission to reject transactions")
	}

	// Update workflow
	now := time.Now()
	workflow.Status = "rejected"
	workflow.RejectedBy = &rejecterID
	workflow.RejectedAt = &now
	workflow.RejectionReason = reason

	if err := s.approvalRepo.Update(workflow); err != nil {
		return err
	}

	// Create notification for requester
	s.createApprovalStatusNotification(workflow.AccountID, workflow.RequestedBy, workflow.ID, "rejected")

	// Log activity
	s.logActivity(workflow.AccountID, rejecterID, "rejected_transaction", "approval_workflow", workflowID, map[string]interface{}{
		"transaction_id": workflow.TransactionID,
		"requested_by":   workflow.RequestedBy,
		"reason":         reason,
	})

	return nil
}

// GetPendingApprovals gets all pending approvals for an account
func (s *CollaborationService) GetPendingApprovals(accountID, userID uint) ([]models.ApprovalWorkflowResponse, error) {
	// Check if user has access
	hasAccess, err := s.accountMemberRepo.HasAccess(accountID, userID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("you don't have access to this account")
	}

	// Get pending approvals that user can approve
	workflows, err := s.approvalRepo.GetPendingByUser(accountID, userID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.ApprovalWorkflowResponse
	for _, workflow := range workflows {
		response := models.ApprovalWorkflowResponse{
			ID:              workflow.ID,
			AccountID:       workflow.AccountID,
			TransactionID:   workflow.TransactionID,
			RequestedBy:     workflow.RequestedBy,
			RequesterName:   workflow.Requester.Username,
			Status:          workflow.Status,
			ThresholdAmount: workflow.ThresholdAmount,
			CreatedAt:       workflow.CreatedAt,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// logActivity logs an activity
func (s *CollaborationService) logActivity(accountID, userID uint, action, entityType string, entityID uint, details map[string]interface{}) {
	detailsJSON, _ := json.Marshal(details)
	log := &models.ActivityLog{
		AccountID:  accountID,
		UserID:     userID,
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		Details:    string(detailsJSON),
	}
	_ = s.activityLogRepo.Create(log)
}

// createMentionNotifications creates notifications for mentioned users
func (s *CollaborationService) createMentionNotifications(accountID, mentionerID uint, mentionedUserIDs []uint, transactionID uint) {
	for _, mentionedUserID := range mentionedUserIDs {
		notification := &models.Notification{
			UserID:  mentionedUserID,
			Type:    "mention",
			Title:   "You were mentioned in a comment",
			Message: "You were mentioned in a transaction comment",
			IsRead:  false,
		}
		_ = s.notificationRepo.Create(notification)
	}
}

// createApprovalNotifications creates notifications for approval requests
func (s *CollaborationService) createApprovalNotifications(accountID, requesterID, workflowID uint) {
	// Get account members who can approve (admins and owners)
	members, err := s.accountMemberRepo.GetByAccount(accountID)
	if err != nil {
		return
	}

	for _, member := range members {
		if member.UserID != requesterID && (member.Role == "owner" || member.Role == "admin") {
			notification := &models.Notification{
				UserID:  member.UserID,
				Type:    "approval_request",
				Title:   "Approval Required",
				Message: "A transaction requires your approval",
				IsRead:  false,
			}
			_ = s.notificationRepo.Create(notification)
		}
	}
}

// createApprovalStatusNotification creates notification for approval status change
func (s *CollaborationService) createApprovalStatusNotification(accountID, requesterID, workflowID uint, status string) {
	title := "Transaction Approved"
	message := "Your transaction has been approved"
	if status == "rejected" {
		title = "Transaction Rejected"
		message = "Your transaction has been rejected"
	}

	notification := &models.Notification{
		UserID:  requesterID,
		Type:    "approval_status",
		Title:   title,
		Message: message,
		IsRead:  false,
	}
	_ = s.notificationRepo.Create(notification)
}
