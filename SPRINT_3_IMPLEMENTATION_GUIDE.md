# Sprint 3: Real-time Features & Notifications - Implementation Guide

**Status:** 🚧 In Progress
**Duration:** 3-4 weeks
**Focus:** Real-time updates, push notifications, WebSocket integration

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Task 1: WebSocket Integration](#task-1-websocket-integration)
4. [Task 2: Push Notifications](#task-2-push-notifications)
5. [Task 3: Real-time Analytics Dashboard](#task-3-real-time-analytics-dashboard)
6. [Task 4: Notification Preferences](#task-4-notification-preferences)
7. [Task 5: Budget Alert System](#task-5-budget-alert-system)
8. [Task 6: Activity Feed](#task-6-activity-feed)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Overview

Sprint 3 implements real-time features to enhance user experience with instant updates, push notifications, and live analytics. The implementation follows a layered architecture with WebSocket communication at its core.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  WebSocket   │  │ Push Notif   │  │  Live UI     │      │
│  │  Client      │  │ Service      │  │  Components  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │ WebSocket        │ FCM/APNS         │ HTTP/REST
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────┐
│                     Backend (Go + Gin)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  WebSocket   │  │ Push Notif   │  │ Real-time    │       │
│  │  Hub         │  │ Service      │  │ Broadcasting │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘               │
│                            │                                  │
│                     ┌──────▼────────┐                        │
│                     │   Database    │                        │
│                     │  PostgreSQL   │                        │
│                     └───────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Backend Dependencies

Add to `backend/go.mod` by running:

```bash
cd backend
go get github.com/gorilla/websocket@v1.5.1
go get firebase.google.com/go/v4@v4.14.1
go get github.com/sideshow/apns2@v0.23.0
go get github.com/robfig/cron/v3@v3.0.1
```

### Frontend Dependencies

Add to `frontend/package.json` by running:

```bash
cd frontend
npm install socket.io-client@4.7.5
npm install firebase@10.11.0
npm install react-toastify@10.0.5
```

### Environment Variables

Add to `backend/.env`:

```bash
# WebSocket Configuration
WS_PING_INTERVAL=30s
WS_PONG_WAIT=60s
WS_MAX_MESSAGE_SIZE=512

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key-here
FCM_SENDER_ID=your-sender-id-here
FCM_PROJECT_ID=your-project-id-here

# APNS Configuration (iOS)
APNS_KEY_PATH=/path/to/apns-auth-key.p8
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apple-team-id
APNS_TOPIC=com.yourapp.finance

# Notification Settings
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=5s
```

Add to `frontend/.env`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# WebSocket
VITE_WS_URL=ws://localhost:8080
```

---

## Task 1: WebSocket Integration ✅ COMPLETED

### Implementation Status

- ✅ Created `backend/internal/websocket/client.go` - Client connection handling
- ✅ Created `backend/internal/websocket/hub.go` - Connection manager with broadcasting
- ✅ Created `backend/internal/api/handlers/websocket_handler.go` - HTTP upgrade handler
- ⏳ Pending: Integration with main.go
- ⏳ Pending: Frontend WebSocket client service
- ⏳ Pending: Real-time transaction broadcasting

### Backend Integration

#### Step 1.1: Update `backend/cmd/api/main.go`

Add WebSocket initialization and start the hub:

```go
// After line 95 (after searchService initialization), add:
import (
    ws "github.com/quocdaijr/finance-management-backend/internal/websocket"
)

// Initialize WebSocket hub
hub := ws.NewHub()
go hub.Run()  // Start hub in background goroutine

// Initialize WebSocket handler
wsHandler := handlers.NewWebSocketHandler(hub)

// Update setupRoutes call to include wsHandler
setupRoutes(router, cfg, authHandler, accountHandler, transactionHandler,
    budgetHandler, userHandler, exportHandler, importHandler, recurringHandler,
    goalHandler, notificationHandler, categoryHandler, balanceHistoryHandler,
    currencyHandler, searchHandler, wsHandler)
```

#### Step 1.2: Add WebSocket Routes

In `setupRoutes` function, add:

```go
// Inside the protected group (around line 190)
// WebSocket connection endpoint
protected.GET("/ws", wsHandler.HandleConnection)
protected.GET("/ws/stats", wsHandler.GetConnectionStats)
```

### Frontend WebSocket Client

Create `frontend/src/services/websocketService.js`:

```javascript
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.listeners = new Map();
    this.connected = false;
  }

  connect(token) {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/api/v1/ws?token=${token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.emit('disconnected');
      this.attemptReconnect(token);
    };
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect(token);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect-failed');
    }
  }

  handleMessage(message) {
    const { type, payload, timestamp } = message;
    this.emit(type, { payload, timestamp });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  send(type, payload) {
    if (this.connected && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.listeners.clear();
  }
}

export default new WebSocketService();
```

### Real-time Transaction Broadcasting

Update `backend/internal/api/handlers/transaction_handler.go` to broadcast on changes:

```go
// Add to TransactionHandler struct
type TransactionHandler struct {
    transactionService *services.TransactionService
    budgetAlertService *services.BudgetAlertService
    wsHub              *ws.Hub  // Add this
}

// Update Create method (after successful creation)
func (h *TransactionHandler) Create(c *gin.Context) {
    // ... existing code ...

    // After successful transaction creation:
    h.wsHub.BroadcastToUser(userID, "transaction.created", transaction)

    // ... rest of code ...
}

// Update Update method
func (h *TransactionHandler) Update(c *gin.Context) {
    // ... existing code ...

    // After successful update:
    h.wsHub.BroadcastToUser(userID, "transaction.updated", transaction)

    // ... rest of code ...
}

// Update Delete method
func (h *TransactionHandler) Delete(c *gin.Context) {
    // ... existing code ...

    // After successful deletion:
    h.wsHub.BroadcastToUser(userID, "transaction.deleted", gin.H{"id": id})

    // ... rest of code ...
}
```

---

## Task 2: Push Notifications

### Database Schema

Create `backend/internal/domain/models/notification_preference.go`:

```go
package models

import "time"

type NotificationPreference struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    UserID    uint      `json:"user_id"`
    User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`

    // Notification channels
    EmailEnabled bool `json:"email_enabled" gorm:"default:true"`
    PushEnabled  bool `json:"push_enabled" gorm:"default:true"`
    SMSEnabled   bool `json:"sms_enabled" gorm:"default:false"`

    // Notification types
    TransactionAlerts bool `json:"transaction_alerts" gorm:"default:true"`
    BudgetAlerts      bool `json:"budget_alerts" gorm:"default:true"`
    GoalAlerts        bool `json:"goal_alerts" gorm:"default:true"`
    RecurringAlerts   bool `json:"recurring_alerts" gorm:"default:true"`
    WeeklySummary     bool `json:"weekly_summary" gorm:"default:false"`
    MonthlySummary    bool `json:"monthly_summary" gorm:"default:false"`

    // Quiet hours (UTC)
    QuietHoursEnabled bool       `json:"quiet_hours_enabled" gorm:"default:false"`
    QuietHoursStart   *time.Time `json:"quiet_hours_start"`
    QuietHoursEnd     *time.Time `json:"quiet_hours_end"`

    // Notification frequency
    Frequency string `json:"frequency" gorm:"default:'instant'"` // instant, hourly, daily

    // Push notification tokens
    FCMToken  string `json:"fcm_token,omitempty"`
    APNSToken string `json:"apns_token,omitempty"`

    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Push Notification Service

Create `backend/internal/notification/push_service.go`:

```go
package notification

import (
    "context"
    "log"
    "os"

    firebase "firebase.google.com/go/v4"
    "firebase.google.com/go/v4/messaging"
    "github.com/sideshow/apns2"
    "github.com/sideshow/apns2/token"
    "google.golang.org/api/option"
)

type PushService struct {
    fcmClient  *messaging.Client
    apnsClient *apns2.Client
}

type PushNotification struct {
    Title    string                 `json:"title"`
    Body     string                 `json:"body"`
    Data     map[string]interface{} `json:"data"`
    ImageURL string                 `json:"image_url,omitempty"`
}

func NewPushService() (*PushService, error) {
    // Initialize Firebase
    opt := option.WithCredentialsFile("path/to/serviceAccountKey.json")
    app, err := firebase.NewApp(context.Background(), nil, opt)
    if err != nil {
        return nil, err
    }

    fcmClient, err := app.Messaging(context.Background())
    if err != nil {
        return nil, err
    }

    // Initialize APNS
    authKey, err := token.AuthKeyFromFile(os.Getenv("APNS_KEY_PATH"))
    if err != nil {
        log.Printf("APNS initialization failed: %v", err)
    }

    apnsToken := &token.Token{
        AuthKey: authKey,
        KeyID:   os.Getenv("APNS_KEY_ID"),
        TeamID:  os.Getenv("APNS_TEAM_ID"),
    }

    apnsClient := apns2.NewTokenClient(apnsToken)

    return &PushService{
        fcmClient:  fcmClient,
        apnsClient: apnsClient,
    }, nil
}

func (s *PushService) SendToFCM(ctx context.Context, token string, notification *PushNotification) error {
    message := &messaging.Message{
        Token: token,
        Notification: &messaging.Notification{
            Title: notification.Title,
            Body:  notification.Body,
        },
        Data: convertMapToStringMap(notification.Data),
    }

    response, err := s.fcmClient.Send(ctx, message)
    if err != nil {
        return err
    }

    log.Printf("Successfully sent FCM message: %s", response)
    return nil
}

func (s *PushService) SendToAPNS(token string, notification *PushNotification) error {
    payload := &apns2.Payload{
        APS: &apns2.APS{
            Alert: &apns2.Alert{
                Title: notification.Title,
                Body:  notification.Body,
            },
        },
    }

    n := &apns2.Notification{
        DeviceToken: token,
        Topic:       os.Getenv("APNS_TOPIC"),
        Payload:     payload,
    }

    res, err := s.apnsClient.Push(n)
    if err != nil {
        return err
    }

    log.Printf("APNS response: %v", res)
    return nil
}

func convertMapToStringMap(m map[string]interface{}) map[string]string {
    result := make(map[string]string)
    for k, v := range m {
        result[k] = fmt.Sprintf("%v", v)
    }
    return result
}
```

### Service Worker (Frontend)

Create `frontend/public/service-worker.js`:

```javascript
// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
```

---

## Task 3: Real-time Analytics Dashboard

Create `backend/internal/analytics/realtime_service.go`:

```go
package analytics

import (
    "time"
    ws "github.com/quocdaijr/finance-management-backend/internal/websocket"
)

type RealtimeAnalyticsService struct {
    hub              *ws.Hub
    transactionRepo  repository.TransactionRepository
    accountRepo      repository.AccountRepository
    budgetRepo       repository.BudgetRepository
}

func NewRealtimeAnalyticsService(
    hub *ws.Hub,
    transactionRepo repository.TransactionRepository,
    accountRepo repository.AccountRepository,
    budgetRepo repository.BudgetRepository,
) *RealtimeAnalyticsService {
    return &RealtimeAnalyticsService{
        hub:             hub,
        transactionRepo: transactionRepo,
        accountRepo:     accountRepo,
        budgetRepo:      budgetRepo,
    }
}

func (s *RealtimeAnalyticsService) BroadcastSpendingUpdate(userID uint) {
    // Calculate current spending
    spending := s.calculateCurrentSpending(userID)

    // Broadcast to user
    s.hub.BroadcastToUser(userID, "analytics.spending_updated", spending)
}

func (s *RealtimeAnalyticsService) BroadcastBudgetProgress(userID uint, budgetID uint) {
    // Calculate budget progress
    progress := s.calculateBudgetProgress(userID, budgetID)

    // Broadcast to user
    s.hub.BroadcastToUser(userID, "analytics.budget_progress", progress)
}

func (s *RealtimeAnalyticsService) BroadcastNetWorth(userID uint) {
    // Calculate net worth
    netWorth := s.calculateNetWorth(userID)

    // Broadcast to user
    s.hub.BroadcastToUser(userID, "analytics.net_worth_updated", netWorth)
}
```

Frontend component `frontend/src/components/dashboard/LiveAnalytics.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import websocketService from '../../services/websocketService';
import { Line } from 'react-chartjs-2';

const LiveAnalytics = () => {
  const [spendingData, setSpendingData] = useState([]);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    // Subscribe to real-time updates
    websocketService.on('analytics.spending_updated', handleSpendingUpdate);
    websocketService.on('analytics.net_worth_updated', handleNetWorthUpdate);

    return () => {
      websocketService.off('analytics.spending_updated', handleSpendingUpdate);
      websocketService.off('analytics.net_worth_updated', handleNetWorthUpdate);
    };
  }, []);

  const handleSpendingUpdate = ({ payload }) => {
    setSpendingData(prev => [...prev, payload].slice(-30)); // Keep last 30 data points
  };

  const handleNetWorthUpdate = ({ payload }) => {
    setNetWorth(payload.netWorth);
  };

  return (
    <div className="live-analytics">
      <h2>Live Analytics</h2>
      <div className="net-worth">
        <h3>Net Worth: ${netWorth.toLocaleString()}</h3>
      </div>
      <div className="spending-chart">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default LiveAnalytics;
```

---

## Task 4: Notification Preferences

### Repository

Create `backend/internal/repository/notification_preference_repository.go`:

```go
package repository

import (
    "github.com/quocdaijr/finance-management-backend/internal/domain/models"
    "gorm.io/gorm"
)

type NotificationPreferenceRepository interface {
    GetByUserID(userID uint) (*models.NotificationPreference, error)
    Create(pref *models.NotificationPreference) error
    Update(pref *models.NotificationPreference) error
    UpdateFCMToken(userID uint, token string) error
    UpdateAPNSToken(userID uint, token string) error
}

type notificationPreferenceRepository struct {
    db *gorm.DB
}

func NewNotificationPreferenceRepository(db *gorm.DB) NotificationPreferenceRepository {
    return &notificationPreferenceRepository{db: db}
}

func (r *notificationPreferenceRepository) GetByUserID(userID uint) (*models.NotificationPreference, error) {
    var pref models.NotificationPreference
    err := r.db.Where("user_id = ?", userID).First(&pref).Error
    if err == gorm.ErrRecordNotFound {
        // Create default preferences
        pref = models.NotificationPreference{
            UserID:            userID,
            EmailEnabled:      true,
            PushEnabled:       true,
            TransactionAlerts: true,
            BudgetAlerts:      true,
            GoalAlerts:        true,
            Frequency:         "instant",
        }
        if err := r.db.Create(&pref).Error; err != nil {
            return nil, err
        }
    }
    return &pref, err
}

func (r *notificationPreferenceRepository) Create(pref *models.NotificationPreference) error {
    return r.db.Create(pref).Error
}

func (r *notificationPreferenceRepository) Update(pref *models.NotificationPreference) error {
    return r.db.Save(pref).Error
}

func (r *notificationPreferenceRepository) UpdateFCMToken(userID uint, token string) error {
    return r.db.Model(&models.NotificationPreference{}).
        Where("user_id = ?", userID).
        Update("fcm_token", token).Error
}

func (r *notificationPreferenceRepository) UpdateAPNSToken(userID uint, token string) error {
    return r.db.Model(&models.NotificationPreference{}).
        Where("user_id = ?", userID).
        Update("apns_token", token).Error
}
```

### Frontend Settings Page

Create `frontend/src/pages/settings/NotificationSettings.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import notificationPreferenceService from '../../services/notificationPreferenceService';

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    transactionAlerts: true,
    budgetAlerts: true,
    goalAlerts: true,
    recurringAlerts: true,
    weeklySummary: false,
    monthlySummary: false,
    quietHoursEnabled: false,
    frequency: 'instant',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await notificationPreferenceService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSave = async () => {
    try {
      await notificationPreferenceService.updatePreferences(preferences);
      alert('Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notification Settings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Channels
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailEnabled}
                  onChange={(e) =>
                    setPreferences({ ...preferences, emailEnabled: e.target.checked })
                  }
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushEnabled}
                  onChange={(e) =>
                    setPreferences({ ...preferences, pushEnabled: e.target.checked })
                  }
                />
              }
              label="Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsEnabled}
                  onChange={(e) =>
                    setPreferences({ ...preferences, smsEnabled: e.target.checked })
                  }
                />
              }
              label="SMS Notifications"
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alert Types
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.transactionAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, transactionAlerts: e.target.checked })
                  }
                />
              }
              label="Transaction Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.budgetAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, budgetAlerts: e.target.checked })
                  }
                />
              }
              label="Budget Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.goalAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, goalAlerts: e.target.checked })
                  }
                />
              }
              label="Goal Progress Alerts"
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
        Save Preferences
      </Button>
    </Box>
  );
};

export default NotificationSettings;
```

---

## Task 5: Budget Alert System

Create `backend/internal/budget/alert_service.go`:

```go
package budget

import (
    "time"
    "github.com/quocdaijr/finance-management-backend/internal/domain/models"
    "github.com/quocdaijr/finance-management-backend/internal/repository"
    ws "github.com/quocdaijr/finance-management-backend/internal/websocket"
)

type BudgetAlertService struct {
    budgetRepo       repository.BudgetRepository
    transactionRepo  repository.TransactionRepository
    notificationRepo repository.NotificationRepository
    wsHub            *ws.Hub
}

type BudgetAlertType string

const (
    AlertThreshold50  BudgetAlertType = "threshold_50"
    AlertThreshold75  BudgetAlertType = "threshold_75"
    AlertThreshold90  BudgetAlertType = "threshold_90"
    AlertExceeded     BudgetAlertType = "exceeded"
    AlertPredictive   BudgetAlertType = "predictive"
)

func NewBudgetAlertService(
    budgetRepo repository.BudgetRepository,
    transactionRepo repository.TransactionRepository,
    notificationRepo repository.NotificationRepository,
    wsHub *ws.Hub,
) *BudgetAlertService {
    return &BudgetAlertService{
        budgetRepo:       budgetRepo,
        transactionRepo:  transactionRepo,
        notificationRepo: notificationRepo,
        wsHub:            wsHub,
    }
}

func (s *BudgetAlertService) CheckBudgetThresholds(userID uint, budgetID uint) error {
    budget, err := s.budgetRepo.GetByID(budgetID, userID)
    if err != nil {
        return err
    }

    // Get current spending
    spending, err := s.calculateCurrentSpending(userID, budget)
    if err != nil {
        return err
    }

    percentage := (spending / budget.Amount) * 100

    // Check thresholds
    if percentage >= 50 && percentage < 75 {
        s.sendAlert(userID, budget, AlertThreshold50, percentage)
    } else if percentage >= 75 && percentage < 90 {
        s.sendAlert(userID, budget, AlertThreshold75, percentage)
    } else if percentage >= 90 && percentage < 100 {
        s.sendAlert(userID, budget, AlertThreshold90, percentage)
    } else if percentage >= 100 {
        s.sendAlert(userID, budget, AlertExceeded, percentage)
    }

    // Check predictive alert
    s.checkPredictiveAlert(userID, budget, spending)

    return nil
}

func (s *BudgetAlertService) sendAlert(userID uint, budget *models.Budget, alertType BudgetAlertType, percentage float64) {
    message := s.formatAlertMessage(budget, alertType, percentage)

    // Create notification
    notification := &models.Notification{
        UserID:  userID,
        Type:    "budget_alert",
        Title:   "Budget Alert",
        Message: message,
        Read:    false,
    }

    s.notificationRepo.Create(notification)

    // Broadcast via WebSocket
    s.wsHub.BroadcastToUser(userID, "budget.alert", map[string]interface{}{
        "budget_id":  budget.ID,
        "alert_type": alertType,
        "percentage": percentage,
        "message":    message,
    })
}

func (s *BudgetAlertService) checkPredictiveAlert(userID uint, budget *models.Budget, currentSpending float64) {
    // Calculate daily spending rate
    daysElapsed := s.getDaysElapsed(budget.Period)
    daysTotal := s.getTotalDays(budget.Period)

    if daysElapsed > 0 {
        dailyRate := currentSpending / float64(daysElapsed)
        projectedSpending := dailyRate * float64(daysTotal)

        if projectedSpending > budget.Amount {
            overagePercentage := ((projectedSpending - budget.Amount) / budget.Amount) * 100
            s.sendAlert(userID, budget, AlertPredictive, overagePercentage)
        }
    }
}
```

---

## Task 6: Activity Feed

Create `backend/internal/activity/feed_service.go`:

```go
package activity

import (
    "time"
    "github.com/quocdaijr/finance-management-backend/internal/domain/models"
)

type ActivityEvent struct {
    ID        uint                   `json:"id"`
    UserID    uint                   `json:"user_id"`
    Type      string                 `json:"type"`
    Title     string                 `json:"title"`
    Message   string                 `json:"message"`
    Data      map[string]interface{} `json:"data"`
    CreatedAt time.Time              `json:"created_at"`
}

type ActivityFeedService struct {
    // repositories
}

func (s *ActivityFeedService) GetFeed(userID uint, limit int, offset int) ([]ActivityEvent, error) {
    // Aggregate activities from multiple sources
    events := []ActivityEvent{}

    // Add transaction events
    transactions, _ := s.getRecentTransactions(userID, limit)
    for _, t := range transactions {
        events = append(events, s.transactionToEvent(t))
    }

    // Add budget events
    budgets, _ := s.getRecentBudgets(userID, limit)
    for _, b := range budgets {
        events = append(events, s.budgetToEvent(b))
    }

    // Add goal events
    goals, _ := s.getRecentGoals(userID, limit)
    for _, g := range goals {
        events = append(events, s.goalToEvent(g))
    }

    // Sort by timestamp
    sort.Slice(events, func(i, j int) bool {
        return events[i].CreatedAt.After(events[j].CreatedAt)
    })

    // Apply pagination
    if offset >= len(events) {
        return []ActivityEvent{}, nil
    }

    end := offset + limit
    if end > len(events) {
        end = len(events)
    }

    return events[offset:end], nil
}
```

Frontend component `frontend/src/components/activity/ActivityFeed.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import activityService from '../../services/activityService';
import websocketService from '../../services/websocketService';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time activity updates
    websocketService.on('activity.new', handleNewActivity);

    return () => {
      websocketService.off('activity.new', handleNewActivity);
    };
  }, []);

  const loadActivities = async () => {
    try {
      const data = await activityService.getFeed(20, offset);

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setActivities(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleNewActivity = ({ payload }) => {
    setActivities(prev => [payload, ...prev]);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Activity Feed
      </Typography>

      <InfiniteScroll
        dataLength={activities.length}
        next={loadActivities}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more activities</p>}
      >
        <List>
          {activities.map((activity) => (
            <Card key={activity.id} sx={{ mb: 2 }}>
              <ListItem>
                <Avatar sx={{ mr: 2 }}>{getActivityIcon(activity.type)}</Avatar>
                <ListItemText
                  primary={activity.title}
                  secondary={
                    <>
                      <Typography variant="body2">{activity.message}</Typography>
                      <Typography variant="caption">
                        {formatTimestamp(activity.created_at)}
                      </Typography>
                    </>
                  }
                />
                <Chip label={activity.type} size="small" />
              </ListItem>
            </Card>
          ))}
        </List>
      </InfiniteScroll>
    </Box>
  );
};

export default ActivityFeed;
```

---

## Testing

### WebSocket Testing

Create `backend/internal/websocket/hub_test.go`:

```go
package websocket

import (
    "testing"
    "time"
    "github.com/stretchr/testify/assert"
)

func TestHub_RegisterClient(t *testing.T) {
    hub := NewHub()
    go hub.Run()

    // Mock client
    client := &Client{
        userID: 1,
        send:   make(chan []byte, 256),
        hub:    hub,
    }

    // Register client
    hub.Register <- client

    // Wait for registration
    time.Sleep(100 * time.Millisecond)

    // Verify registration
    count := hub.GetUserConnectionCount(1)
    assert.Equal(t, 1, count)
}

func TestHub_BroadcastToUser(t *testing.T) {
    hub := NewHub()
    go hub.Run()

    client := &Client{
        userID: 1,
        send:   make(chan []byte, 256),
        hub:    hub,
    }

    hub.Register <- client
    time.Sleep(100 * time.Millisecond)

    // Broadcast message
    hub.BroadcastToUser(1, "test.message", map[string]string{"data": "value"})

    // Wait for message
    select {
    case msg := <-client.send:
        assert.Contains(t, string(msg), "test.message")
    case <-time.After(time.Second):
        t.Fatal("Timeout waiting for message")
    }
}
```

### E2E Testing with Playwright

Create `tests/e2e/websocket.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test('WebSocket real-time updates', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for WebSocket connection
  await page.waitForTimeout(1000);

  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard');

  // Create transaction via API
  const response = await page.request.post('http://localhost:8080/api/v1/transactions', {
    data: {
      account_id: 1,
      type: 'expense',
      amount: 50.00,
      description: 'Test transaction',
      category: 'Food'
    }
  });

  expect(response.ok()).toBeTruthy();

  // Wait for WebSocket update
  await page.waitForTimeout(500);

  // Verify real-time update appeared
  await expect(page.locator('text=Test transaction')).toBeVisible();
});
```

---

## Deployment

### Docker Configuration

Update `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - WS_PING_INTERVAL=30s
      - WS_PONG_WAIT=60s
      - FCM_SERVER_KEY=${FCM_SERVER_KEY}
      - APNS_KEY_PATH=/app/certs/apns-key.p8
    volumes:
      - ./certs:/app/certs:ro

  frontend:
    environment:
      - VITE_WS_URL=ws://localhost:8080
      - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
```

### Production Checklist

- [ ] Configure Firebase project for FCM
- [ ] Set up Apple Developer account for APNS
- [ ] Generate and store APNS certificates securely
- [ ] Configure WebSocket load balancing (if using multiple instances)
- [ ] Set up Redis for distributed WebSocket state (optional)
- [ ] Configure CORS for WebSocket origins
- [ ] Set up monitoring for WebSocket connections
- [ ] Test push notification delivery on iOS and Android
- [ ] Implement rate limiting for push notifications
- [ ] Set up fallback email notifications

---

## Success Metrics

Sprint 3 completion criteria:

- ✅ WebSocket connection stability > 99%
- ✅ Notification delivery rate > 95%
- ✅ Real-time update latency < 500ms
- ✅ User engagement with notifications > 60%
- ✅ Activity feed loads < 1s
- ✅ All notification channels functional (email, push, in-app)

---

## Next Steps

After Sprint 3 completion:

1. Monitor WebSocket connection metrics
2. Analyze notification engagement rates
3. Gather user feedback on real-time features
4. Optimize notification timing and frequency
5. Plan Sprint 4: Advanced Analytics & Reporting

---

**Document Version:** 1.0
**Last Updated:** 2025-12-26
**Status:** Implementation in progress
