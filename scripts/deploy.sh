#!/bin/bash
# Deploy Script for Odonto Chin CRM on DigitalOcean
# Usage: ./deploy.sh

set -e

echo "=========================================="
echo "  Odonto Chin CRM - Deploy Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "${GREEN}[1/10] Updating system...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install Docker
echo -e "${GREEN}[2/10] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${YELLOW}Docker already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "${GREEN}[3/10] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
else
    echo -e "${YELLOW}Docker Compose already installed${NC}"
fi

# Step 4: Create application directory
echo -e "${GREEN}[4/10] Creating application directory...${NC}"
mkdir -p /opt/odonto-crm
cd /opt/odonto-crm

# Step 5: Copy files (assumes files are in current directory)
echo -e "${GREEN}[5/10] Copying application files...${NC}"
if [ -f "../docker-compose.yml" ]; then
    cp -r ../* .
else
    echo -e "${RED}Error: docker-compose.yml not found!${NC}"
    echo "Please run this script from the project directory"
    exit 1
fi

# Step 6: Configure environment variables
echo -e "${GREEN}[6/10] Configuring environment variables...${NC}"
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo -e "${YELLOW}Please edit .env file with your production values!${NC}"
    echo -e "${YELLOW}Press Enter to continue after editing...${NC}"
    read
fi

# Step 7: Make scripts executable
echo -e "${GREEN}[7/10] Making scripts executable...${NC}"
chmod +x scripts/*.sh

# Step 8: Build and start containers
echo -e "${GREEN}[8/10] Building and starting containers...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

# Step 9: Wait for services to be healthy
echo -e "${GREEN}[9/10] Waiting for services to be healthy...${NC}"
sleep 10

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}Containers are running!${NC}"
else
    echo -e "${RED}Error: Containers failed to start!${NC}"
    docker-compose logs
    exit 1
fi

# Step 10: Setup cron for automatic backups
echo -e "${GREEN}[10/10] Setting up automatic backups...${NC}"
CRON_JOB="0 2 * * * cd /opt/odonto-crm && docker-compose run --rm backup >> /var/log/odonto-crm-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "odonto-crm"; echo "$CRON_JOB") | crontab -

echo ""
echo -e "${GREEN}=========================================="
echo "  Deployment completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Application URL: http://$(curl -s ifconfig.me)"
echo "Logs: docker-compose logs -f"
echo "Stop: docker-compose down"
echo "Restart: docker-compose restart"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure your domain DNS to point to this server"
echo "2. Run: ./scripts/setup-ssl.sh your-domain.com"
echo "3. Update nginx configuration for HTTPS"
echo ""
