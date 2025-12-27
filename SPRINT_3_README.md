# Sprint 3: Real-time Features & Notifications

**Status:** 🚧 Implementation in Progress
**Start Date:** December 26, 2025
**Estimated Duration:** 3-4 weeks

---

## Quick Start

### 1. Install Dependencies

```bash
# Make script executable
chmod +x scripts/install-sprint3-dependencies.sh

# Run installation
./scripts/install-sprint3-dependencies.sh
```

### 2. Configure Environment

**Backend:**
```bash
cd backend
cp .env.sprint3.example .env
# Edit .env with your Firebase and APNS credentials
```

**Frontend:**
```bash
cd frontend
cp .env.sprint3.example .env
# Edit .env with your Firebase configuration
```

### 3. Run Database Migrations

```bash
cd backend
go run cmd/api/main.go
# Migrations will run automatically on startup
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
go run cmd/api/main.go
# Server runs on http://localhost:8080
# WebSocket endpoint: ws://localhost:8080/api/v1/ws
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Dev server runs on http://localhost:3000
```

**Terminal 3 - Analytics (if needed):**
```bash
cd analytics
python main.py
# Server runs on http://localhost:8000
```

---

## What's Implemented

### ✅ Completed

1. **WebSocket Infrastructure**
   - [x] WebSocket server (`backend/internal/websocket/`)
   - [x] Connection manager with hub pattern
   - [x] Client lifecycle management
   - [x] Message broadcasting system
   - [x] Multi-device synchronization support

2. **WebSocket Handler**
   - [x] HTTP to WebSocket upgrade endpoint
   - [x] JWT authentication for WebSocket connections
   - [x] Connection statistics endpoint

### ⏳ In Progress

3. **Frontend WebSocket Client**
   - [ ] WebSocket service implementation
   - [ ] Auto-reconnection with exponential backoff
   - [ ] Event listener management
   - [ ] React hooks for WebSocket integration

4. **Push Notifications**
   - [ ] FCM integration for Android & Web
   - [ ] APNS integration for iOS
   - [ ] Service worker for browser push
   - [ ] Notification preferences system

5. **Real-time Features**
   - [ ] Transaction broadcasting
   - [ ] Balance updates
   - [ ] Budget alerts
   - [ ] Live analytics dashboard

6. **Notification Center**
   - [ ] In-app notification UI
   - [ ] Mark as read functionality
   - [ ] Notification filtering

7. **Activity Feed**
   - [ ] Activity aggregation service
   - [ ] Real-time activity stream
   - [ ] Infinite scroll pagination

---

## Implementation Tasks

### Week 1: WebSocket & Real-time Foundation

- [x] **Day 1-2:** WebSocket server implementation
  - [x] Client handler
  - [x] Hub/manager
  - [x] HTTP upgrade handler

- [ ] **Day 3:** Frontend WebSocket client
  - [ ] Service implementation
  - [ ] Reconnection logic
  - [ ] React hooks

- [ ] **Day 4-5:** Real-time transaction broadcasting
  - [ ] Update transaction handlers
  - [ ] Broadcast on CRUD operations
  - [ ] Frontend real-time updates
  - [ ] Testing

### Week 2: Push Notifications

- [ ] **Day 1-2:** Backend notification service
  - [ ] FCM integration
  - [ ] APNS integration
  - [ ] Email digest service

- [ ] **Day 3:** Frontend service worker
  - [ ] Service worker registration
  - [ ] Push notification handling
  - [ ] Notification click handling

- [ ] **Day 4-5:** Notification preferences
  - [ ] Database schema
  - [ ] API endpoints
  - [ ] Settings UI

### Week 3: Advanced Features

- [ ] **Day 1-2:** Budget alert system
  - [ ] Threshold monitoring
  - [ ] Predictive alerts
  - [ ] Real-time broadcasting

- [ ] **Day 3-4:** Real-time analytics
  - [ ] Live spending charts
  - [ ] Budget progress updates
  - [ ] Net worth tracking

- [ ] **Day 5:** Activity feed
  - [ ] Feed aggregation service
  - [ ] Frontend infinite scroll
  - [ ] Real-time activity updates

### Week 4: Testing & Polish

- [ ] **Day 1-2:** Comprehensive testing
  - [ ] WebSocket connection tests
  - [ ] Notification delivery tests
  - [ ] E2E tests with Playwright

- [ ] **Day 3-4:** Performance optimization
  - [ ] Load testing
  - [ ] Memory leak detection
  - [ ] Connection pool tuning

- [ ] **Day 5:** Documentation & deployment
  - [ ] Update documentation
  - [ ] Deployment guide
  - [ ] Production checklist

---

## Architecture

### WebSocket Message Format

All WebSocket messages follow this structure:

```json
{
  "type": "event.name",
  "payload": {
    // Event-specific data
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

### Supported Message Types

**Client → Server:**
- `ping` - Heartbeat
- `subscribe.analytics` - Subscribe to analytics updates
- `unsubscribe.analytics` - Unsubscribe from analytics

**Server → Client:**
- `transaction.created` - New transaction created
- `transaction.updated` - Transaction updated
- `transaction.deleted` - Transaction deleted
- `balance.updated` - Account balance changed
- `budget.alert` - Budget threshold alert
- `goal.progress` - Goal progress update
- `analytics.spending_updated` - Spending analytics update
- `analytics.net_worth_updated` - Net worth update
- `activity.new` - New activity event
- `notification.new` - New notification

### Database Schema

**New Tables:**

1. **notification_preferences**
   ```sql
   CREATE TABLE notification_preferences (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL,
     email_enabled BOOLEAN DEFAULT true,
     push_enabled BOOLEAN DEFAULT true,
     sms_enabled BOOLEAN DEFAULT false,
     transaction_alerts BOOLEAN DEFAULT true,
     budget_alerts BOOLEAN DEFAULT true,
     goal_alerts BOOLEAN DEFAULT true,
     recurring_alerts BOOLEAN DEFAULT true,
     weekly_summary BOOLEAN DEFAULT false,
     monthly_summary BOOLEAN DEFAULT false,
     quiet_hours_enabled BOOLEAN DEFAULT false,
     quiet_hours_start TIME,
     quiet_hours_end TIME,
     frequency VARCHAR(20) DEFAULT 'instant',
     fcm_token TEXT,
     apns_token TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

---

## API Endpoints

### WebSocket

- `GET /api/v1/ws` - Upgrade to WebSocket connection (requires JWT auth)
- `GET /api/v1/ws/stats` - Get connection statistics

### Notification Preferences

- `GET /api/v1/notification-preferences` - Get user preferences
- `PUT /api/v1/notification-preferences` - Update preferences
- `POST /api/v1/notification-preferences/fcm-token` - Register FCM token
- `POST /api/v1/notification-preferences/apns-token` - Register APNS token

### Activity Feed

- `GET /api/v1/activity?limit=20&offset=0` - Get activity feed
- `GET /api/v1/activity/filters` - Get available filters
- `POST /api/v1/activity/mark-read` - Mark activities as read

---

## Testing

### Manual Testing

**WebSocket Connection:**
```bash
# Test WebSocket endpoint
wscat -c ws://localhost:8080/api/v1/ws -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Send Test Notification:**
```bash
curl -X POST http://localhost:8080/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test",
    "type": "test"
  }'
```

### Automated Testing

```bash
# Backend unit tests
cd backend
go test ./internal/websocket/...
go test ./internal/notification/...

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Load Testing

```bash
# Test WebSocket concurrency
cd backend
go run cmd/loadtest/websocket_load.go -connections 1000 -duration 60s
```

---

## Monitoring

### Key Metrics

1. **WebSocket Metrics**
   - Active connections
   - Messages sent/received per second
   - Average message latency
   - Connection errors/reconnections

2. **Notification Metrics**
   - Delivery success rate
   - Delivery latency
   - Failed deliveries
   - User engagement rate

3. **Performance Metrics**
   - Real-time update latency
   - Memory usage per connection
   - CPU usage under load
   - Database query performance

### Logging

WebSocket events are logged with structured logging:

```json
{
  "level": "info",
  "timestamp": "2025-12-26T10:30:00Z",
  "event": "websocket.connection",
  "user_id": 123,
  "connection_id": "abc-123",
  "total_connections": 45
}
```

---

## Troubleshooting

### Common Issues

**1. WebSocket connection fails**
```
Error: WebSocket connection to 'ws://localhost:8080/api/v1/ws' failed
```
**Solution:**
- Check backend is running on port 8080
- Verify JWT token is valid and included in connection
- Check CORS configuration allows WebSocket upgrade

**2. Push notifications not received**
```
FCM Error: Invalid registration token
```
**Solution:**
- Verify Firebase configuration in .env
- Check FCM token is properly registered
- Ensure service worker is registered

**3. High memory usage**
```
Backend consuming excessive memory with many connections
```
**Solution:**
- Implement connection limits per user
- Add memory profiling: `go tool pprof http://localhost:8080/debug/pprof/heap`
- Consider Redis for distributed WebSocket state

**4. Message delivery delays**
```
Real-time updates taking > 1 second
```
**Solution:**
- Check database query performance
- Optimize hub broadcasting logic
- Consider message batching for high-frequency updates

---

## Security Considerations

### WebSocket Security

- ✅ JWT authentication required for WebSocket upgrade
- ✅ Origin checking in production (configure CORS)
- ✅ Message size limits (512 bytes default)
- ✅ Rate limiting on WebSocket connections
- ⏳ DDoS protection (implement connection limits)
- ⏳ Message validation and sanitization

### Push Notification Security

- ✅ Secure token storage (environment variables)
- ✅ Token encryption in database
- ⏳ Token rotation mechanism
- ⏳ Payload encryption for sensitive data
- ⏳ Notification delivery audit logging

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| WebSocket Connection Stability | > 99% | TBD | ⏳ |
| Notification Delivery Rate | > 95% | TBD | ⏳ |
| Real-time Update Latency | < 500ms | TBD | ⏳ |
| Concurrent Connections | > 1,000 | TBD | ⏳ |
| Memory per Connection | < 10KB | TBD | ⏳ |
| CPU Usage (1K connections) | < 50% | TBD | ⏳ |

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Firebase project created and configured
- [ ] APNS certificates generated and stored securely
- [ ] Database migrations tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Monitoring and alerting set up
- [ ] Backup and rollback plan ready
- [ ] Documentation updated

### Deployment Steps

1. **Update environment variables** in production
2. **Run database migrations**
   ```bash
   go run cmd/migrate/main.go up
   ```
3. **Deploy backend** with WebSocket support
4. **Deploy frontend** with service worker
5. **Test WebSocket connectivity** in production
6. **Monitor metrics** for first 24 hours
7. **Gradual rollout** of push notifications (10% → 50% → 100%)

### Rollback Plan

If critical issues occur:
1. Disable WebSocket endpoint (feature flag)
2. Revert to polling for updates
3. Disable push notifications
4. Roll back to previous stable version
5. Investigate and fix issues
6. Gradual re-deployment

---

## Support & Resources

### Documentation

- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Internal Documentation

- `SPRINT_3_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `backend/docs/WEBSOCKET.md` - WebSocket architecture (to be created)
- `backend/docs/NOTIFICATIONS.md` - Notification system (to be created)

### Contact

For questions or issues:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Team Chat: #sprint-3-realtime
- Email: dev-team@yourcompany.com

---

**Last Updated:** December 26, 2025
**Next Review:** January 2, 2026
