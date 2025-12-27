#!/bin/bash

# Sprint 3: Install Dependencies Script
# This script installs all required dependencies for Sprint 3 implementation

set -e  # Exit on error

echo "======================================"
echo "Sprint 3 Dependencies Installation"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend dependencies
echo -e "${YELLOW}Installing Backend Dependencies...${NC}"
cd backend || exit 1

echo "  - gorilla/websocket@v1.5.1"
go get github.com/gorilla/websocket@v1.5.1

echo "  - firebase/go/v4@v4.14.1"
go get firebase.google.com/go/v4@v4.14.1

echo "  - apns2@v0.23.0"
go get github.com/sideshow/apns2@v0.23.0

echo "  - cron/v3@v3.0.1"
go get github.com/robfig/cron/v3@v3.0.1

echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Frontend dependencies
echo -e "${YELLOW}Installing Frontend Dependencies...${NC}"
cd ../frontend || exit 1

echo "  - socket.io-client@4.7.5"
npm install socket.io-client@4.7.5

echo "  - firebase@10.11.0"
npm install firebase@10.11.0

echo "  - react-toastify@10.0.5"
npm install react-toastify@10.0.5

echo "  - react-infinite-scroll-component@6.1.0"
npm install react-infinite-scroll-component@6.1.0

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

cd ..

echo -e "${GREEN}======================================"
echo "✓ All dependencies installed successfully!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review SPRINT_3_IMPLEMENTATION_GUIDE.md"
echo "2. Configure environment variables (.env files)"
echo "3. Run database migrations"
echo "4. Start development servers"
echo ""
echo "For WebSocket testing:"
echo "  Backend: cd backend && go run cmd/api/main.go"
echo "  Frontend: cd frontend && npm run dev"
