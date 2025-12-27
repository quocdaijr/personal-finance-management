package models

import "time"

// TaxCategory represents a tax category for transaction tagging
type TaxCategory struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description *string   `gorm:"type:text" json:"description,omitempty"`
	TaxType     string    `gorm:"type:varchar(50);not null" json:"tax_type"` // deduction, income, capital_gain
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Associations
	User         User          `gorm:"foreignKey:UserID" json:"-"`
	Transactions []Transaction `gorm:"foreignKey:TaxCategoryID" json:"transactions,omitempty"`
}

// TableName overrides the table name
func (TaxCategory) TableName() string {
	return "tax_categories"
}

// CreateTaxCategoryRequest represents the request to create a tax category
type CreateTaxCategoryRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	TaxType     string  `json:"tax_type" binding:"required,oneof=deduction income capital_gain"`
}

// UpdateTaxCategoryRequest represents the request to update a tax category
type UpdateTaxCategoryRequest struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	TaxType     *string `json:"tax_type,omitempty"`
}

// TaxReportResponse represents the annual tax report
type TaxReportResponse struct {
	Year          int                       `json:"year"`
	TotalIncome   float64                   `json:"total_income"`
	TotalDeductions float64                 `json:"total_deductions"`
	CapitalGains  float64                   `json:"capital_gains"`
	ByCategory    []TaxCategorySummary      `json:"by_category"`
	Transactions  []TaxTransactionSummary   `json:"transactions"`
}

// TaxCategorySummary represents aggregated data by tax category
type TaxCategorySummary struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	TaxType      string  `json:"tax_type"`
	TotalAmount  float64 `json:"total_amount"`
	Count        int64   `json:"count"`
}

// TaxTransactionSummary represents a transaction in the tax report
type TaxTransactionSummary struct {
	ID              uint    `json:"id"`
	Date            string  `json:"date"`
	Description     string  `json:"description"`
	Amount          float64 `json:"amount"`
	Category        string  `json:"category"`
	TaxCategoryName string  `json:"tax_category_name"`
	TaxType         string  `json:"tax_type"`
}
