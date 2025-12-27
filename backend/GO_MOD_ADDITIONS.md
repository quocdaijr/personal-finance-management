# Go Module Additions for Sprint 3

To integrate Sprint 3 WebSocket and Push Notification features, add the following dependencies to your `go.mod` file.

## Installation Commands

Run these commands from the `backend/` directory:

```bash
# WebSocket support
go get github.com/gorilla/websocket@v1.5.1

# Firebase Cloud Messaging (FCM) for push notifications
go get firebase.google.com/go/v4@v4.14.1
go get google.golang.org/api@v0.156.0

# Apple Push Notification Service (APNS)
go get github.com/sideshow/apns2@v0.23.0

# Cron scheduler for email digests
go get github.com/robfig/cron/v3@v3.0.1
```

## Expected go.mod Additions

After running the above commands, your `go.mod` should include these new entries:

```go
require (
    // Existing dependencies...

    // Sprint 3 additions
    github.com/gorilla/websocket v1.5.1
    firebase.google.com/go/v4 v4.14.1
    github.com/sideshow/apns2 v0.23.0
    github.com/robfig/cron/v3 v3.0.1
)
```

## Verify Installation

After installation, verify the dependencies are correctly added:

```bash
go mod tidy
go mod verify
```

## Testing the Installation

Create a simple test file to verify WebSocket works:

```bash
cd backend
cat > test_websocket.go << 'EOF'
package main

import (
    "fmt"
    "github.com/gorilla/websocket"
)

func main() {
    upgrader := websocket.Upgrader{}
    fmt.Println("WebSocket package loaded successfully!")
    fmt.Printf("Upgrader: %+v\n", upgrader)
}
EOF

go run test_websocket.go
rm test_websocket.go
```

If you see "WebSocket package loaded successfully!" - installation is complete.

## Common Issues

### Issue 1: Module checksum mismatch
```
verifying firebase.google.com/go/v4@v4.14.1: checksum mismatch
```

**Solution:**
```bash
go clean -modcache
go mod download
go mod verify
```

### Issue 2: Incompatible Go version
```
go: firebase.google.com/go/v4@v4.14.1 requires go >= 1.20
```

**Solution:** Update Go to version 1.20 or higher
```bash
go version  # Check current version
# Update Go if needed
```

### Issue 3: Network/proxy issues
```
go: downloading firebase.google.com/go/v4 v4.14.1: connection timeout
```

**Solution:** Configure proxy or use direct connection
```bash
export GOPROXY=https://proxy.golang.org,direct
go get firebase.google.com/go/v4@v4.14.1
```

## Dependencies Overview

### gorilla/websocket (v1.5.1)
- **Purpose:** WebSocket protocol implementation
- **Used for:** Real-time bidirectional communication
- **Docs:** https://pkg.go.dev/github.com/gorilla/websocket

### firebase.google.com/go/v4 (v4.14.1)
- **Purpose:** Firebase Admin SDK for Go
- **Used for:** FCM push notifications to Android/Web
- **Docs:** https://firebase.google.com/docs/admin/setup

### sideshow/apns2 (v0.23.0)
- **Purpose:** Apple Push Notification Service client
- **Used for:** Push notifications to iOS devices
- **Docs:** https://github.com/sideshow/apns2

### robfig/cron/v3 (v3.0.1)
- **Purpose:** Cron job scheduler
- **Used for:** Scheduled email digests, periodic analytics
- **Docs:** https://pkg.go.dev/github.com/robfig/cron/v3

## Next Steps

After installing dependencies:

1. Update `backend/cmd/api/main.go` to initialize WebSocket hub
2. Register WebSocket routes in the router
3. Configure environment variables for Firebase and APNS
4. Run the application to verify everything compiles

## Rollback

If you need to remove Sprint 3 dependencies:

```bash
# Remove from go.mod manually, then run:
go mod tidy
```

Or restore to the original go.mod from git:

```bash
git checkout backend/go.mod backend/go.sum
go mod download
```
