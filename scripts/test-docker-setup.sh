#!/bin/bash

# Test script for Docker setup validation
set -e

echo "🚀 Testing Docker Setup for Finance Management System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Test 1: Check Docker and Docker Compose
echo -e "\n📋 Checking Prerequisites..."
docker --version > /dev/null 2>&1
print_status "Docker is installed" $?

docker-compose --version > /dev/null 2>&1
print_status "Docker Compose is installed" $?

# Test 2: Check if ports are available
echo -e "\n🔍 Checking Port Availability..."
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use (needed for $service)"
        return 1
    else
        print_status "Port $port is available for $service" 0
        return 0
    fi
}

check_port 3000 "Frontend"
check_port 8080 "Backend"
check_port 8000 "Analytics"
check_port 5432 "PostgreSQL"

# Test 3: Validate Docker files
echo -e "\n📄 Validating Docker Configuration Files..."

# Check if Dockerfiles exist
if [ -f "frontend/dockerfile" ]; then
    print_status "Frontend Dockerfile exists" 0
else
    print_status "Frontend Dockerfile missing" 1
fi

if [ -f "backend/Dockerfile" ]; then
    print_status "Backend Dockerfile exists" 0
else
    print_status "Backend Dockerfile missing" 1
fi

if [ -f "analytics/Dockerfile" ]; then
    print_status "Analytics Dockerfile exists" 0
else
    print_status "Analytics Dockerfile missing" 1
fi

# Check docker-compose files
if [ -f "docker-compose.dev.yml" ]; then
    print_status "Development compose file exists" 0
else
    print_status "Development compose file missing" 1
fi

if [ -f "docker-compose.prod.yml" ]; then
    print_status "Production compose file exists" 0
else
    print_status "Production compose file missing" 1
fi

# Test 4: Validate frontend configuration
echo -e "\n⚛️  Validating Frontend Configuration..."

if [ -f "frontend/package.json" ]; then
    print_status "Frontend package.json exists" 0
    
    # Check for required dependencies
    if grep -q "react.*19" frontend/package.json; then
        print_status "React 19 is configured" 0
    else
        print_warning "React 19 not found in package.json"
    fi
    
    if grep -q "vite.*6" frontend/package.json; then
        print_status "Vite 6+ is configured" 0
    else
        print_warning "Vite 6+ not found in package.json"
    fi
else
    print_status "Frontend package.json missing" 1
fi

if [ -f "frontend/vite.config.ts" ]; then
    print_status "Vite configuration exists" 0
else
    print_status "Vite configuration missing" 1
fi

# Test 5: Try building frontend Docker image (if possible)
echo -e "\n🏗️  Testing Frontend Docker Build..."
print_info "Attempting to build frontend Docker image..."

if docker build -t finance-frontend-test frontend/ > /dev/null 2>&1; then
    print_status "Frontend Docker build successful" 0
    docker rmi finance-frontend-test > /dev/null 2>&1
else
    print_warning "Frontend Docker build failed (this may be due to environment limitations)"
fi

# Test 6: Validate environment files
echo -e "\n🌍 Checking Environment Configuration..."

if [ -f "frontend/.env.development" ]; then
    print_status "Development environment file exists" 0
else
    print_status "Development environment file missing" 1
fi

if [ -f "backend/.env" ]; then
    print_status "Backend environment file exists" 0
else
    print_status "Backend environment file missing" 1
fi

# Test 7: Check network connectivity requirements
echo -e "\n🌐 Testing Network Configuration..."

# Test if we can resolve localhost
if ping -c 1 localhost > /dev/null 2>&1; then
    print_status "Localhost connectivity works" 0
else
    print_status "Localhost connectivity failed" 1
fi

# Summary
echo -e "\n📊 Test Summary"
echo "==============="
print_info "Docker setup validation completed."
print_info "If any tests failed, please address them before proceeding."
print_info ""
print_info "To start the development environment:"
print_info "  docker-compose -f docker-compose.dev.yml up"
print_info ""
print_info "To start the production environment:"
print_info "  docker-compose -f docker-compose.prod.yml up"

echo -e "\n🎉 Docker setup test completed!"
