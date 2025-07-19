#!/bin/bash
# Production setup script for Razgazdayson

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Razgazdayson production setup...${NC}"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root!${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
sudo apt install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    postgresql-client \
    redis-tools \
    htop \
    ufw

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker installed. Please log out and back in for group changes to take effect.${NC}"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Setup firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ~/backups
mkdir -p ~/logs

# Setup environment files
echo -e "${YELLOW}Setting up environment files...${NC}"
if [ ! -f backend/.env.production ]; then
    cp backend/.env.production.example backend/.env.production
    echo -e "${YELLOW}Please edit backend/.env.production with your production values${NC}"
fi

if [ ! -f frontend/.env.production ]; then
    cp frontend/.env.production.example frontend/.env.production
    echo -e "${YELLOW}Please edit frontend/.env.production with your production values${NC}"
fi

if [ ! -f telegram-bot/.env.production ]; then
    cp telegram-bot/.env.production.example telegram-bot/.env.production
    echo -e "${YELLOW}Please edit telegram-bot/.env.production with your production values${NC}"
fi

# Generate secure secrets
echo -e "${YELLOW}Generating secure secrets...${NC}"
echo "SECRET_KEY=$(openssl rand -hex 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
echo "REDIS_PASSWORD=$(openssl rand -base64 16)"
echo "TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 16)"

# Setup SSL certificate
echo -e "${YELLOW}Setting up SSL certificate...${NC}"
read -p "Enter your email for Let's Encrypt: " EMAIL
sudo certbot certonly --nginx -d razgazdayson.ru -d www.razgazdayson.ru --email $EMAIL --agree-tos --non-interactive

# Setup Nginx
echo -e "${YELLOW}Setting up Nginx...${NC}"
sudo cp configs/nginx.conf /etc/nginx/sites-available/razgazdayson
sudo ln -sf /etc/nginx/sites-available/razgazdayson /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Setup systemd service
echo -e "${YELLOW}Setting up systemd service...${NC}"
sudo cp configs/razgazdayson.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable razgazdayson.service

# Create backup script
echo -e "${YELLOW}Creating backup script...${NC}"
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f ~/razgazdayson/docker/docker-compose.production.yml exec -T postgres \
    pg_dump -U razgazdayson razgazdayson | gzip > $BACKUP_DIR/razgazdayson_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: razgazdayson_$DATE.sql.gz"
EOF

chmod +x ~/backup-db.sh

# Setup cron job for backups
echo -e "${YELLOW}Setting up automated backups...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/backup-db.sh") | crontab -

# Create monitoring script
cat > ~/check-health.sh << 'EOF'
#!/bin/bash
if ! curl -f -s https://razgazdayson.ru/api/v1/health/ready > /dev/null; then
    echo "Backend health check failed at $(date)" >> ~/logs/health.log
    # Restart services if needed
    # systemctl restart razgazdayson
fi
EOF

chmod +x ~/check-health.sh

# Final instructions
echo -e "${GREEN}Setup completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit the .env.production files with your actual values"
echo "2. Build and start services: make prod-build && sudo systemctl start razgazdayson"
echo "3. Set Telegram webhook: curl -F \"url=https://razgazdayson.ru/webhook\" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook"
echo "4. Check logs: journalctl -u razgazdayson -f"
echo "5. Monitor health: https://razgazdayson.ru/api/v1/health/ready"