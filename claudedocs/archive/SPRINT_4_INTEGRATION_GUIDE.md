# Sprint 4 Integration Guide

Quick guide for integrating Sprint 4 features into the main application.

---

## 1. Backend Integration

### A. Update `backend/cmd/api/main.go`

Add Sprint 4 migrations and route registration:

```go
package main

import (
    // ... existing imports ...
    "github.com/yourusername/finance-management/internal/infrastructure/migrations"
    reportRepo "github.com/yourusername/finance-management/internal/repository"
    reportSvc "github.com/yourusername/finance-management/internal/domain/services"
    reportHandler "github.com/yourusername/finance-management/internal/api/handlers"
)

func main() {
    // ... existing initialization ...

    // Run Sprint 4 migrations
    if err := migrations.RunSprint4Migrations(db); err != nil {
        log.Fatal("Failed to run Sprint 4 migrations:", err)
    }

    // Initialize Sprint 4 repositories
    reportRepository := reportRepo.NewReportRepository(db)
    taxRepository := reportRepo.NewTaxRepository(db)

    // Initialize Sprint 4 services
    reportService := reportSvc.NewReportService(reportRepository)
    taxService := reportSvc.NewTaxService(taxRepository)

    // Initialize Sprint 4 handlers
    reportHandler := reportHandler.NewReportHandler(reportService)
    taxHandler := reportHandler.NewTaxHandler(taxService)

    // Register Sprint 4 routes (add to routes.go or here)
    protected := router.Group("/api")
    protected.Use(middleware.AuthMiddleware())
    {
        // Report routes
        protected.POST("/reports", reportHandler.CreateReport)
        protected.GET("/reports", reportHandler.ListReports)
        protected.GET("/reports/:id", reportHandler.GetReport)
        protected.PUT("/reports/:id", reportHandler.UpdateReport)
        protected.DELETE("/reports/:id", reportHandler.DeleteReport)
        protected.POST("/reports/:id/generate", reportHandler.GenerateReport)
        protected.GET("/reports/:id/download/:execution_id", reportHandler.DownloadReport)

        // Tax routes
        protected.POST("/tax/categories", taxHandler.CreateCategory)
        protected.GET("/tax/categories", taxHandler.ListCategories)
        protected.GET("/tax/categories/:id", taxHandler.GetCategory)
        protected.PUT("/tax/categories/:id", taxHandler.UpdateCategory)
        protected.DELETE("/tax/categories/:id", taxHandler.DeleteCategory)
        protected.GET("/tax/report", taxHandler.GetTaxReport)
        protected.GET("/tax/export", taxHandler.ExportTaxData)
    }

    // ... rest of existing code ...
}
```

### B. Update `backend/internal/api/routes/routes.go`

Alternative approach - add to routes file:

```go
package routes

import (
    "github.com/gin-gonic/gin"
    "github.com/yourusername/finance-management/internal/api/handlers"
)

func SetupSprint4Routes(router *gin.Engine, reportHandler *handlers.ReportHandler, taxHandler *handlers.TaxHandler) {
    protected := router.Group("/api")
    // protected.Use(middleware.AuthMiddleware()) // if not already applied

    // Report routes
    reports := protected.Group("/reports")
    {
        reports.POST("", reportHandler.CreateReport)
        reports.GET("", reportHandler.ListReports)
        reports.GET("/:id", reportHandler.GetReport)
        reports.PUT("/:id", reportHandler.UpdateReport)
        reports.DELETE("/:id", reportHandler.DeleteReport)
        reports.POST("/:id/generate", reportHandler.GenerateReport)
        reports.GET("/:id/download/:execution_id", reportHandler.DownloadReport)
    }

    // Tax routes
    tax := protected.Group("/tax")
    {
        tax.POST("/categories", taxHandler.CreateCategory)
        tax.GET("/categories", taxHandler.ListCategories)
        tax.GET("/categories/:id", taxHandler.GetCategory)
        tax.PUT("/categories/:id", taxHandler.UpdateCategory)
        tax.DELETE("/categories/:id", taxHandler.DeleteCategory)
        tax.GET("/report", taxHandler.GetTaxReport)
        tax.GET("/export", taxHandler.ExportTaxData)
    }
}
```

---

## 2. Analytics Service Integration

The Sprint 4 analytics endpoints are already integrated into `analytics/main.py`:

```python
# Sprint 4 router is automatically included
from main_sprint4 import router as sprint4_router
app.include_router(sprint4_router)
```

**No additional changes needed** - just ensure the analytics service is running.

---

## 3. Environment Variables

Add to `.env` files:

### Backend `.env`
```bash
# Sprint 4: Report Storage
REPORT_STORAGE_PATH=/var/reports
ENABLE_REPORT_GENERATION=true

# Sprint 4: Analytics
ANALYTICS_SERVICE_URL=http://localhost:8000
```

### Analytics `.env`
```bash
# Sprint 4: Report Generation
REPORT_STORAGE_PATH=/var/reports
ENABLE_AI_INSIGHTS=true
```

---

## 4. Install Dependencies

### Analytics Service
```bash
cd analytics
pip install -r requirements.txt
```

New dependencies:
- reportlab==4.2.5
- openpyxl==3.1.5
- numpy==2.3.0

### Backend Service
No new Go dependencies required.

---

## 5. Run Migrations

### Option A: Automatic Migration (Recommended)
The migration runs automatically on application startup if you added the migration call to `main.go`.

### Option B: Manual Migration
```bash
cd backend
go run scripts/migrate.go sprint4
```

---

## 6. Testing the Integration

### Run Test Script
```bash
./scripts/test-sprint4.sh
```

### Manual Testing

#### Test Analytics Endpoints
```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Test spending patterns
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/analytics/spending-patterns

# Test anomalies
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/analytics/anomalies
```

#### Test Report Endpoints
```bash
# Create report
curl -X POST http://localhost:8080/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Monthly Report","report_type":"monthly","parameters":{"format":"pdf"}}'

# List reports
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/reports
```

#### Test Tax Endpoints
```bash
# Create tax category
curl -X POST http://localhost:8080/api/tax/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Business Expenses","tax_type":"deduction"}'

# Get tax report
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/tax/report?year=2025"
```

---

## 7. Database Schema Verification

Verify new tables were created:

```sql
-- PostgreSQL
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('reports', 'report_executions', 'tax_categories');

-- SQLite
SELECT name FROM sqlite_master
WHERE type='table'
AND name IN ('reports', 'report_executions', 'tax_categories');

-- Verify transactions column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'transactions'
AND column_name = 'tax_category_id';
```

---

## 8. Frontend Integration (Next Steps)

### Create Frontend Services

#### `frontend/src/services/analyticsService.js`
```javascript
// Advanced Analytics
export const getSpendingPatterns = (groupBy = 'month') => {
  return api.get(`/analytics/spending-patterns?group_by=${groupBy}`);
};

export const getAnomalies = (sensitivity = 'medium', days = 90) => {
  return api.get(`/analytics/anomalies?sensitivity=${sensitivity}&days=${days}`);
};

export const getBudgetRecommendations = () => {
  return api.get('/analytics/recommendations');
};

// ... more methods
```

#### `frontend/src/services/reportService.js`
```javascript
export const createReport = (data) => {
  return api.post('/reports', data);
};

export const generateReport = (reportId, format) => {
  return api.post(`/reports/${reportId}/generate`, { format });
};
```

#### `frontend/src/services/taxService.js`
```javascript
export const createTaxCategory = (data) => {
  return api.post('/tax/categories', data);
};

export const getTaxReport = (year) => {
  return api.get(`/tax/report?year=${year}`);
};
```

---

## 9. Troubleshooting

### Analytics Service Not Responding
```bash
# Check if running
ps aux | grep python | grep main.py

# Check logs
tail -f analytics/app.log

# Restart service
cd analytics && python main.py
```

### Database Migration Errors
```bash
# Check migration status
# Add to backend code:
if db.Migrator().HasTable(&models.Report{}) {
    log.Println("✓ reports table exists")
}
```

### Import Errors in Analytics
```bash
cd analytics
pip install -r requirements.txt --upgrade
```

### JWT Token Issues
Ensure `JWT_SECRET` is the same in both backend and analytics `.env` files.

---

## 10. Performance Optimization

### Add Database Indexes
```sql
CREATE INDEX idx_transactions_tax_category ON transactions(tax_category_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_report_executions_report_id ON report_executions(report_id);
```

### Enable Caching (Optional)
```python
# In analytics service
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_analytics(user_id, period):
    # Expensive analytics query
    pass
```

---

## 11. Monitoring

### Health Checks
```bash
# Backend
curl http://localhost:8080/health

# Analytics
curl http://localhost:8000/health
```

### Log Monitoring
```bash
# Backend logs
tail -f backend/logs/app.log

# Analytics logs
tail -f analytics/logs/app.log
```

---

## 12. Deployment Checklist

- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Install Python dependencies
- [ ] Test all endpoints
- [ ] Verify authentication works
- [ ] Check report generation
- [ ] Verify tax categories work
- [ ] Test analytics queries
- [ ] Monitor performance
- [ ] Set up error alerting

---

## Quick Start Commands

```bash
# 1. Install dependencies
cd analytics && pip install -r requirements.txt

# 2. Run migrations (automatic on startup)
cd backend && go run cmd/api/main.go

# 3. Start analytics service
cd analytics && python main.py

# 4. Test integration
./scripts/test-sprint4.sh

# 5. View logs
tail -f backend/logs/app.log
tail -f analytics/logs/app.log
```

---

## Support

For issues or questions:
1. Check `SPRINT_4_IMPLEMENTATION_SUMMARY.md`
2. Review API documentation in endpoint files
3. Run test script: `./scripts/test-sprint4.sh`
4. Check application logs

---

**Status:** Ready for integration and testing
**Version:** Sprint 4.0
**Date:** December 27, 2025
