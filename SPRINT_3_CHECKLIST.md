# Sprint 3 Implementation Checklist

**Last Updated:** December 26, 2025
**Status:** 🚧 17% Complete

Use this checklist to track your progress through Sprint 3 implementation.

---

## Phase 1: Setup & Foundation ✅ COMPLETE

- [x] **Create WebSocket Infrastructure**
  - [x] `backend/internal/websocket/client.go`
  - [x] `backend/internal/websocket/hub.go`
  - [x] `backend/internal/api/handlers/websocket_handler.go`

- [x] **Create Documentation**
  - [x] `SPRINT_3_IMPLEMENTATION_GUIDE.md`
  - [x] `SPRINT_3_README.md`
  - [x] `SPRINT_3_IMPLEMENTATION_SUMMARY.md`
  - [x] `SPRINT_3_CHECKLIST.md` (this file)

- [x] **Environment Configuration**
  - [x] `backend/.env.sprint3.example`
  - [x] `frontend/.env.sprint3.example`
  - [x] `backend/GO_MOD_ADDITIONS.md`

- [x] **Installation Scripts**
  - [x] `scripts/install-sprint3-dependencies.sh`

---

## Phase 2: Backend Integration 🚧 IN PROGRESS

### Step 1: Install Dependencies
- [ ] Run `./scripts/install-sprint3-dependencies.sh`
- [ ] Verify Go dependencies installed: `go mod verify`
- [ ] Verify npm dependencies: `npm list socket.io-client firebase react-toastify`

### Step 2: Update Backend

#### File: `backend/cmd/api/main.go`
- [ ] Add WebSocket import: `import ws "github.com/quocdaijr/finance-management-backend/internal/websocket"`
- [ ] Initialize hub (after line 95): `hub := ws.NewHub()`
- [ ] Start hub goroutine: `go hub.Run()`
- [ ] Initialize WebSocket handler: `wsHandler := handlers.NewWebSocketHandler(hub)`
- [ ] Pass `wsHandler` to `setupRoutes` function
- [ ] Add `wsHandler *handlers.WebSocketHandler` parameter to `setupRoutes`

#### File: `backend/cmd/api/main.go` - setupRoutes function
- [ ] Add WebSocket routes in protected group:
  ```go
  protected.GET("/ws", wsHandler.HandleConnection)
  protected.GET("/ws/stats", wsHandler.GetConnectionStats)
  ```

#### File: `backend/internal/api/handlers/transaction_handler.go`
- [ ] Add `wsHub *ws.Hub` field to `TransactionHandler` struct
- [ ] Update `NewTransactionHandler` to accept `wsHub` parameter
- [ ] In `Create()`: Add broadcast after transaction creation
- [ ] In `Update()`: Add broadcast after transaction update
- [ ] In `Delete()`: Add broadcast after transaction deletion

### Step 3: Test Backend WebSocket
- [ ] Start backend: `cd backend && go run cmd/api/main.go`
- [ ] Verify no compilation errors
- [ ] Check logs for "WebSocket hub started" message
- [ ] Test WebSocket endpoint: `wscat -c ws://localhost:8080/api/v1/ws`
- [ ] Verify authentication required
- [ ] Test with valid JWT token

---

## Phase 3: Frontend WebSocket Client 🔜 TODO

### Step 1: Create WebSocket Service

#### File: `frontend/src/services/websocketService.js`
- [ ] Create file with WebSocket service class
- [ ] Implement connection management
- [ ] Implement auto-reconnection with exponential backoff
- [ ] Implement event listener system
- [ ] Implement message sending
- [ ] Export singleton instance
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

### Step 2: Create React Hooks

#### File: `frontend/src/hooks/useWebSocket.js`
- [ ] Create custom hook for WebSocket
- [ ] Manage connection state
- [ ] Provide subscribe/unsubscribe methods
- [ ] Auto-cleanup on unmount

#### File: `frontend/src/hooks/useRealtimeTransactions.js`
- [ ] Create hook for transaction updates
- [ ] Subscribe to transaction events
- [ ] Update local state on events

### Step 3: Create WebSocket Context

#### File: `frontend/src/contexts/WebSocketContext.jsx`
- [ ] Create React context
- [ ] Provide WebSocket connection state
- [ ] Auto-connect on auth
- [ ] Auto-disconnect on logout

### Step 4: Integrate into App

#### File: `frontend/src/App.tsx`
- [ ] Import WebSocket context
- [ ] Wrap app with WebSocketProvider
- [ ] Connect to WebSocket after login

#### File: `frontend/src/services/authService.js`
- [ ] Import websocketService
- [ ] Connect WebSocket on successful login
- [ ] Disconnect WebSocket on logout

### Step 5: Update Transaction Components

#### File: `frontend/src/pages/Transactions.jsx`
- [ ] Use `useRealtimeTransactions` hook
- [ ] Handle real-time transaction creation
- [ ] Handle real-time transaction updates
- [ ] Handle real-time transaction deletion
- [ ] Show toast notification on updates

### Step 6: Test Frontend WebSocket
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Login to application
- [ ] Open browser console
- [ ] Verify WebSocket connection established
- [ ] Create transaction via UI
- [ ] Verify real-time update in console
- [ ] Open app in two browser tabs
- [ ] Create transaction in tab 1
- [ ] Verify appears in tab 2 without refresh

---

## Phase 4: Push Notifications 🔜 TODO

### Step 1: Backend Push Service

#### File: `backend/internal/notification/push_service.go`
- [ ] Create PushService struct
- [ ] Initialize FCM client
- [ ] Initialize APNS client
- [ ] Implement `SendToFCM()` method
- [ ] Implement `SendToAPNS()` method
- [ ] Implement error handling and retries
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `backend/internal/notification/email_digest.go`
- [ ] Create EmailDigestService
- [ ] Implement daily digest
- [ ] Implement weekly digest
- [ ] Implement monthly digest
- [ ] Set up cron scheduler

#### File: `backend/internal/api/handlers/notification_handler.go`
- [ ] Create NotificationHandler
- [ ] Implement `RegisterFCMToken()` endpoint
- [ ] Implement `RegisterAPNSToken()` endpoint
- [ ] Implement `SendTestNotification()` endpoint
- [ ] Add routes to setupRoutes

### Step 2: Frontend Service Worker

#### File: `frontend/public/service-worker.js`
- [ ] Implement service worker
- [ ] Handle push event
- [ ] Handle notification click
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `frontend/src/services/notificationService.js`
- [ ] Initialize Firebase
- [ ] Request notification permission
- [ ] Get FCM token
- [ ] Register token with backend
- [ ] Handle incoming messages

#### File: `frontend/src/main.tsx`
- [ ] Register service worker
- [ ] Initialize notification service
- [ ] Request permission on first load

### Step 3: Notification Center UI

#### File: `frontend/src/components/notifications/NotificationCenter.jsx`
- [ ] Create NotificationCenter component
- [ ] Display notification list
- [ ] Implement mark as read
- [ ] Implement clear all
- [ ] Add notification sound (optional)
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `frontend/src/components/notifications/NotificationBadge.jsx`
- [ ] Create badge component
- [ ] Show unread count
- [ ] Add to app header

### Step 4: Test Push Notifications
- [ ] Test FCM on Android device
- [ ] Test FCM on web browser
- [ ] Test APNS on iOS device
- [ ] Test email digests
- [ ] Verify delivery rate > 95%

---

## Phase 5: Notification Preferences 🔜 TODO

### Step 1: Database Migration

#### File: `backend/cmd/migrate/notification_preferences.sql`
- [ ] Create migration file
- [ ] Add `notification_preferences` table
- [ ] Add indexes
- [ ] Run migration

### Step 2: Backend Models & Repository

#### File: `backend/internal/domain/models/notification_preference.go`
- [ ] Create NotificationPreference model
- [ ] Add all fields from schema
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `backend/internal/repository/notification_preference_repository.go`
- [ ] Create repository interface
- [ ] Implement `GetByUserID()`
- [ ] Implement `Create()`
- [ ] Implement `Update()`
- [ ] Implement `UpdateFCMToken()`
- [ ] Implement `UpdateAPNSToken()`
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

### Step 3: Backend Service & Handler

#### File: `backend/internal/domain/services/notification_preference_service.go`
- [ ] Create service
- [ ] Implement business logic
- [ ] Validate quiet hours
- [ ] Validate frequency settings

#### File: `backend/internal/api/handlers/notification_preference_handler.go`
- [ ] Create handler
- [ ] Implement `GetPreferences()`
- [ ] Implement `UpdatePreferences()`
- [ ] Implement `RegisterPushToken()`
- [ ] Add routes

### Step 4: Frontend Settings UI

#### File: `frontend/src/pages/settings/NotificationSettings.jsx`
- [ ] Create settings page
- [ ] Channel toggles (email, push, SMS)
- [ ] Alert type toggles
- [ ] Quiet hours configuration
- [ ] Frequency selector
- [ ] Save button
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `frontend/src/services/notificationPreferenceService.js`
- [ ] Create API service
- [ ] Implement `getPreferences()`
- [ ] Implement `updatePreferences()`

### Step 5: Test Preferences
- [ ] Save preferences
- [ ] Verify database updated
- [ ] Test quiet hours enforcement
- [ ] Test channel preferences

---

## Phase 6: Budget Alert System 🔜 TODO

### Step 1: Backend Alert Service

#### File: `backend/internal/budget/alert_service.go`
- [ ] Create BudgetAlertService
- [ ] Implement threshold checking (50%, 75%, 90%, 100%)
- [ ] Implement predictive alerts
- [ ] Integrate with notification service
- [ ] Integrate with WebSocket hub
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `backend/internal/budget/threshold_monitor.go`
- [ ] Create threshold monitor
- [ ] Implement real-time monitoring
- [ ] Run on transaction creation

#### File: `backend/internal/budget/prediction_engine.go`
- [ ] Create prediction engine
- [ ] Calculate daily spending rate
- [ ] Project end-of-period spending
- [ ] Generate alerts

### Step 2: Frontend Budget Alerts

#### File: `frontend/src/components/budgets/BudgetAlerts.jsx`
- [ ] Create alert component
- [ ] Display active alerts
- [ ] Show threshold warnings
- [ ] Show predictive warnings

#### File: `frontend/src/hooks/useBudgetAlerts.js`
- [ ] Create hook
- [ ] Subscribe to WebSocket alerts
- [ ] Show toast notifications

### Step 3: Test Budget Alerts
- [ ] Create budget
- [ ] Add transactions to reach thresholds
- [ ] Verify alerts at 50%, 75%, 90%, 100%
- [ ] Test predictive alerts
- [ ] Verify WebSocket broadcast

---

## Phase 7: Real-time Analytics 🔜 TODO

### Step 1: Backend Analytics Service

#### File: `backend/internal/analytics/realtime_service.go`
- [ ] Create RealtimeAnalyticsService
- [ ] Implement `BroadcastSpendingUpdate()`
- [ ] Implement `BroadcastBudgetProgress()`
- [ ] Implement `BroadcastNetWorth()`
- [ ] Integrate with transaction handlers
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

### Step 2: Frontend Live Dashboard

#### File: `frontend/src/components/dashboard/LiveAnalytics.jsx`
- [ ] Create component
- [ ] Subscribe to analytics events
- [ ] Display live spending chart
- [ ] Display live net worth
- [ ] Display budget progress bars
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `frontend/src/hooks/useRealtimeAnalytics.js`
- [ ] Create hook
- [ ] Subscribe to WebSocket events
- [ ] Manage analytics state

### Step 3: Update Dashboard

#### File: `frontend/src/pages/Dashboard.jsx`
- [ ] Import LiveAnalytics component
- [ ] Replace static charts
- [ ] Show real-time indicator

### Step 4: Test Real-time Analytics
- [ ] Create transaction
- [ ] Verify spending chart updates
- [ ] Verify budget progress updates
- [ ] Verify net worth updates
- [ ] Measure update latency < 500ms

---

## Phase 8: Activity Feed 🔜 TODO

### Step 1: Backend Activity Service

#### File: `backend/internal/activity/feed_service.go`
- [ ] Create ActivityFeedService
- [ ] Implement `GetFeed()` with pagination
- [ ] Aggregate from multiple sources
- [ ] Sort by timestamp
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `backend/internal/repository/activity_repository.go`
- [ ] Create repository
- [ ] Implement activity queries

#### File: `backend/internal/api/handlers/activity_handler.go`
- [ ] Create handler
- [ ] Implement `GetFeed()` endpoint
- [ ] Add routes

### Step 2: Frontend Activity Feed

#### File: `frontend/src/components/activity/ActivityFeed.jsx`
- [ ] Create component
- [ ] Implement infinite scroll
- [ ] Display activity items
- [ ] Subscribe to WebSocket for new activities
- [ ] **Code provided in SPRINT_3_IMPLEMENTATION_GUIDE.md**

#### File: `frontend/src/pages/ActivityFeed.jsx`
- [ ] Create page
- [ ] Add to navigation

### Step 3: Test Activity Feed
- [ ] Load activity feed
- [ ] Scroll to load more
- [ ] Create transaction
- [ ] Verify new activity appears
- [ ] Test filtering

---

## Phase 9: Testing 🔜 TODO

### Unit Tests

#### Backend
- [ ] `backend/internal/websocket/hub_test.go`
- [ ] `backend/internal/websocket/client_test.go`
- [ ] `backend/internal/notification/push_service_test.go`
- [ ] `backend/internal/budget/alert_service_test.go`

#### Frontend
- [ ] `frontend/src/services/websocketService.test.js`
- [ ] `frontend/src/hooks/useWebSocket.test.js`
- [ ] `frontend/src/components/notifications/NotificationCenter.test.jsx`

### Integration Tests
- [ ] WebSocket connection flow
- [ ] Real-time transaction broadcasting
- [ ] Push notification delivery
- [ ] Budget alert triggering

### E2E Tests (Playwright)
- [ ] `tests/e2e/websocket.spec.js`
- [ ] `tests/e2e/push-notifications.spec.js`
- [ ] `tests/e2e/real-time-updates.spec.js`

### Load Tests
- [ ] WebSocket load test (1,000+ connections)
- [ ] Notification delivery test (10,000+ messages)
- [ ] Real-time update stress test

### Performance Tests
- [ ] Measure WebSocket latency
- [ ] Measure notification delivery time
- [ ] Measure real-time update propagation
- [ ] Memory usage per connection
- [ ] CPU usage under load

---

## Phase 10: Documentation & Deployment 🔜 TODO

### Documentation
- [ ] Update `CLAUDE.md` with Sprint 3 details
- [ ] Update `SPRINT_ROADMAP.md` status
- [ ] Create `backend/docs/WEBSOCKET.md`
- [ ] Create `backend/docs/NOTIFICATIONS.md`
- [ ] Update API documentation

### Deployment Preparation
- [ ] Update `docker-compose.yml` with WebSocket config
- [ ] Create production `.env` template
- [ ] Document Firebase setup steps
- [ ] Document APNS certificate generation
- [ ] Create deployment runbook

### Production Deployment
- [ ] Deploy to staging environment
- [ ] Test all features in staging
- [ ] Load test staging environment
- [ ] Security audit
- [ ] Deploy to production
- [ ] Monitor metrics for 24 hours
- [ ] Gradual rollout (10% → 50% → 100%)

---

## Success Criteria ✅

Check all boxes to complete Sprint 3:

### Functionality
- [ ] WebSocket connections stable (> 99% uptime)
- [ ] Real-time transaction updates working
- [ ] Push notifications delivering (> 95% success rate)
- [ ] Email digests sending correctly
- [ ] Budget alerts triggering at thresholds
- [ ] Activity feed loading and updating
- [ ] Notification preferences working

### Performance
- [ ] WebSocket latency < 500ms
- [ ] Notification delivery < 2 seconds
- [ ] Real-time update latency < 500ms
- [ ] Activity feed loads < 1 second
- [ ] Support 1,000+ concurrent connections
- [ ] Memory usage < 10KB per connection

### Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load tests meeting targets
- [ ] Security audit passed

### Documentation
- [ ] Implementation guide complete
- [ ] API documentation updated
- [ ] Deployment guide complete
- [ ] Troubleshooting guide complete

### Deployment
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Monitoring and alerts configured
- [ ] Rollback plan tested

---

## Progress Tracker

**Overall Completion:** 17% (as of 2025-12-26)

| Phase | Status | % Complete |
|-------|--------|------------|
| Phase 1: Setup & Foundation | ✅ Complete | 100% |
| Phase 2: Backend Integration | 🚧 In Progress | 0% |
| Phase 3: Frontend WebSocket | 🔜 Todo | 0% |
| Phase 4: Push Notifications | 🔜 Todo | 0% |
| Phase 5: Notification Preferences | 🔜 Todo | 0% |
| Phase 6: Budget Alerts | 🔜 Todo | 0% |
| Phase 7: Real-time Analytics | 🔜 Todo | 0% |
| Phase 8: Activity Feed | 🔜 Todo | 0% |
| Phase 9: Testing | 🔜 Todo | 0% |
| Phase 10: Deployment | 🔜 Todo | 0% |

---

## Daily Progress Log

### 2025-12-26
- ✅ Created WebSocket infrastructure (client.go, hub.go, handler)
- ✅ Created comprehensive documentation (4 markdown files)
- ✅ Created environment configuration templates
- ✅ Created installation script
- ✅ Phase 1 complete (17% overall progress)

### [Next Date]
- [ ] Install dependencies
- [ ] Integrate WebSocket into main.go
- [ ] Test WebSocket connectivity

---

## Notes

- All code examples are provided in `SPRINT_3_IMPLEMENTATION_GUIDE.md`
- Environment variables templates in `.env.sprint3.example` files
- Installation script at `scripts/install-sprint3-dependencies.sh`
- For troubleshooting, see `SPRINT_3_README.md`

---

**Keep this checklist updated as you progress through Sprint 3!**
