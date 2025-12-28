package models

import (
	"time"
)

// Organization represents a business or team organization
type Organization struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	OwnerID   uint      `gorm:"not null" json:"owner_id"`
	Settings  string    `gorm:"type:text" json:"settings"` // JSON: {approval_threshold: 1000, expense_policies: {...}}
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Owner       *User        `gorm:"foreignKey:OwnerID" json:"-"`
	Departments []Department `gorm:"foreignKey:OrganizationID" json:"departments,omitempty"`
}

// Department represents a department within an organization
type Department struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	OrganizationID uint      `gorm:"not null;index:idx_departments_organization_id" json:"organization_id"`
	Name           string    `gorm:"not null" json:"name"`
	BudgetAmount   float64   `json:"budget_amount"`
	ManagerID      *uint     `json:"manager_id"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Organization *Organization `gorm:"foreignKey:OrganizationID" json:"-"`
	Manager      *User         `gorm:"foreignKey:ManagerID" json:"-"`
}

// Reimbursement represents an employee reimbursement request
type Reimbursement struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	OrganizationID uint       `gorm:"not null;index:idx_reimbursements_organization_id" json:"organization_id"`
	EmployeeID     uint       `gorm:"not null;index:idx_reimbursements_employee_id" json:"employee_id"`
	TransactionID  *uint      `json:"transaction_id"`
	Amount         float64    `gorm:"not null" json:"amount"`
	Status         string     `gorm:"not null;default:'pending'" json:"status"` // pending, approved, rejected, paid
	ReceiptURL     string     `json:"receipt_url"`
	Description    string     `json:"description"`
	ApprovedBy     *uint      `json:"approved_by"`
	ApprovedAt     *time.Time `json:"approved_at"`
	PaidAt         *time.Time `json:"paid_at"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	Organization *Organization `gorm:"foreignKey:OrganizationID" json:"-"`
	Employee     *User         `gorm:"foreignKey:EmployeeID" json:"-"`
	Transaction  *Transaction  `gorm:"foreignKey:TransactionID" json:"-"`
	Approver     *User         `gorm:"foreignKey:ApprovedBy" json:"-"`
}

// OrganizationSettings represents the settings structure
type OrganizationSettings struct {
	ApprovalThreshold float64                `json:"approval_threshold"`
	ExpensePolicies   map[string]interface{} `json:"expense_policies"`
}

// OrganizationRequest represents a request to create an organization
type OrganizationRequest struct {
	Name     string               `json:"name" binding:"required"`
	Settings OrganizationSettings `json:"settings"`
}

// DepartmentRequest represents a request to create a department
type DepartmentRequest struct {
	Name         string  `json:"name" binding:"required"`
	BudgetAmount float64 `json:"budget_amount"`
	ManagerID    *uint   `json:"manager_id"`
}

// ReimbursementRequest represents a request to create a reimbursement
type ReimbursementRequest struct {
	Amount        float64 `json:"amount" binding:"required"`
	Description   string  `json:"description" binding:"required"`
	ReceiptURL    string  `json:"receipt_url"`
	TransactionID *uint   `json:"transaction_id"`
}

// OrganizationResponse represents the response for an organization
type OrganizationResponse struct {
	ID          uint                 `json:"id"`
	Name        string               `json:"name"`
	OwnerID     uint                 `json:"owner_id"`
	Settings    OrganizationSettings `json:"settings"`
	Departments []DepartmentResponse `json:"departments,omitempty"`
	CreatedAt   time.Time            `json:"created_at"`
}

// DepartmentResponse represents the response for a department
type DepartmentResponse struct {
	ID             uint      `json:"id"`
	OrganizationID uint      `json:"organization_id"`
	Name           string    `json:"name"`
	BudgetAmount   float64   `json:"budget_amount"`
	ManagerID      *uint     `json:"manager_id,omitempty"`
	ManagerName    string    `json:"manager_name,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

// ReimbursementResponse represents the response for a reimbursement
type ReimbursementResponse struct {
	ID             uint       `json:"id"`
	OrganizationID uint       `json:"organization_id"`
	EmployeeID     uint       `json:"employee_id"`
	EmployeeName   string     `json:"employee_name"`
	Amount         float64    `json:"amount"`
	Status         string     `json:"status"`
	Description    string     `json:"description"`
	ReceiptURL     string     `json:"receipt_url,omitempty"`
	ApprovedBy     *uint      `json:"approved_by,omitempty"`
	ApproverName   string     `json:"approver_name,omitempty"`
	ApprovedAt     *time.Time `json:"approved_at,omitempty"`
	PaidAt         *time.Time `json:"paid_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
}

// TableName overrides the table name
func (Organization) TableName() string {
	return "organizations"
}

// TableName overrides the table name
func (Department) TableName() string {
	return "departments"
}

// TableName overrides the table name
func (Reimbursement) TableName() string {
	return "reimbursements"
}
