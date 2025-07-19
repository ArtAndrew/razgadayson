#!/bin/bash
# Deploy script for Razgazdayson project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/root/razgazdayson"
DOCKER_DIR="$PROJECT_DIR/docker"
COMPOSE_FILE="docker-compose.production.yml"

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Navigate to project directory
cd "$PROJECT_DIR"
check_status "Changed to project directory"

# Pull latest changes
echo -e "${YELLOW}📦 Pulling latest changes...${NC}"
git pull origin main
check_status "Git pull"

# Navigate to docker directory
cd "$DOCKER_DIR"

# Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" build --no-cache
check_status "Docker build"

# Stop old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down
check_status "Stopping containers"

# Start new containers
echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d
check_status "Starting containers"

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check services status
echo -e "${YELLOW}🔍 Checking services status...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

# Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# Check frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    exit 1
fi

# Check backend
if curl -f -s http://localhost:8000/health/ready > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is not healthy${NC}"
    exit 1
fi

# Clean up old Docker images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f
check_status "Docker cleanup"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Site is live at https://razgadayson.ru${NC}"

# Show logs hint
echo -e "${YELLOW}💡 To view logs, use:${NC}"
echo "   docker-compose -f docker/$COMPOSE_FILE logs -f [service_name]"