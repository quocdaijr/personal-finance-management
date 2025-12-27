package models

// PaginationRequest represents pagination parameters
type PaginationRequest struct {
	Page      int    `form:"page" binding:"omitempty,min=1"`
	PageSize  int    `form:"page_size" binding:"omitempty,min=1,max=100"`
	SortBy    string `form:"sort_by"`
	SortOrder string `form:"sort_order" binding:"omitempty,oneof=asc desc ASC DESC"`
}

// PaginationResponse represents pagination metadata
type PaginationResponse struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// DefaultPagination returns default pagination values
func DefaultPagination() *PaginationRequest {
	return &PaginationRequest{
		Page:      1,
		PageSize:  20,
		SortOrder: "desc",
	}
}

// ApplyDefaults applies default values to pagination request
func (p *PaginationRequest) ApplyDefaults() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.PageSize < 1 {
		p.PageSize = 20
	}
	if p.PageSize > 100 {
		p.PageSize = 100
	}
	if p.SortOrder == "" {
		p.SortOrder = "desc"
	}
}

// GetOffset calculates the offset for database queries
func (p *PaginationRequest) GetOffset() int {
	return (p.Page - 1) * p.PageSize
}

// CalculateTotalPages calculates total pages from total records
func (p *PaginationRequest) CalculateTotalPages(total int64) int {
	if p.PageSize == 0 {
		return 0
	}
	totalPages := int(total) / p.PageSize
	if int(total)%p.PageSize > 0 {
		totalPages++
	}
	return totalPages
}

// NewPaginationResponse creates a new pagination response
func NewPaginationResponse(page, pageSize int, total int64) *PaginationResponse {
	pr := &PaginationRequest{Page: page, PageSize: pageSize}
	return &PaginationResponse{
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: pr.CalculateTotalPages(total),
	}
}
