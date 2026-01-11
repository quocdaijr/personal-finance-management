package models

import (
	"time"
)

// ApprovalWorkflow represents an approval workflow for large transactions
type ApprovalWorkflow struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	AccountID       uint       `gorm:"not null;index:idx_approval_workflows_account_id" json:"account_id"`
	TransactionID   uint       `gorm:"not null;index:idx_approval_workflows_transaction_id" json:"transaction_id"`
	RequestedBy     uint       `gorm:"not null" json:"requested_by"`
	Status          string     `gorm:"not null;default:'pending'" json:"status"` // pending, approved, rejected
	ApprovedBy      *uint      `json:"approved_by"`
	ApprovedAt      *time.Time `json:"approved_at"`
	RejectedBy      *uint      `json:"rejected_by"`
	RejectedAt      *time.Time `json:"rejected_at"`
	RejectionReason string     `json:"rejection_reason"`
	ThresholdAmount float64    `json:"threshold_amount"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Account     *Account     `gorm:"foreignKey:AccountID" json:"-"`
	Transaction *Transaction `gorm:"foreignKey:TransactionID" json:"-"`
	Requester   *User        `gorm:"foreignKey:RequestedBy" json:"-"`
	Approver    *User        `gorm:"foreignKey:ApprovedBy" json:"-"`
}

// ApprovalRequest represents a request to create an approval workflow
type ApprovalRequest struct {
	TransactionID   uint    `json:"transaction_id" binding:"required"`
	ThresholdAmount float64 `json:"threshold_amount" binding:"required"`
}

// ApprovalActionRequest represents a request to approve or reject
type ApprovalActionRequest struct {
	Action string `json:"action" binding:"required,oneof=approve reject"`
	Reason string `json:"reason"` // Required for rejection
}

// RejectionRequest represents a request to reject an approval
type RejectionRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// ApprovalWorkflowResponse represents the response for an approval workflow
type ApprovalWorkflowResponse struct {
	ID              uint       `json:"id"`
	AccountID       uint       `json:"account_id"`
	TransactionID   uint       `json:"transaction_id"`
	RequestedBy     uint       `json:"requested_by"`
	RequesterName   string     `json:"requester_name"`
	Status          string     `json:"status"`
	ApprovedBy      *uint      `json:"approved_by,omitempty"`
	ApproverName    string     `json:"approver_name,omitempty"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	RejectedBy      *uint      `json:"rejected_by,omitempty"`
	RejectedAt      *time.Time `json:"rejected_at,omitempty"`
	RejectionReason string     `json:"rejection_reason,omitempty"`
	ThresholdAmount float64    `json:"threshold_amount"`
	CreatedAt       time.Time  `json:"created_at"`
}

// TableName overrides the table name
func (ApprovalWorkflow) TableName() string {
	return "approval_workflows"
}

// IsPending checks if the approval is still pending
func (a *ApprovalWorkflow) IsPending() bool {
	return a.Status == "pending"
}

// CanApprove checks if a user can approve (cannot approve own requests)
func (a *ApprovalWorkflow) CanApprove(userID uint) bool {
	return a.IsPending() && a.RequestedBy != userID
}
