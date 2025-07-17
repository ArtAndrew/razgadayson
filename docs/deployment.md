# Deployment Guide

## Prerequisites

- Ubuntu 22.04 LTS server
- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt)
- PostgreSQL 16 with pgvector extension
- Redis 7
- Python 3.12
- Node.js 20 LTS

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git nginx certbot python3-certbot-nginx postgresql redis-server

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/razgazdayson.git
cd razgazdayson
```

### 3. Environment Configuration

Create production environment files:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit with production values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit with production values

# Telegram Bot
cp telegram-bot/.env.example telegram-bot/.env
# Edit with production values
```

### 4. Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE razgazdayson;
CREATE USER razgazdayson WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE razgazdayson TO razgazdayson;

# Install pgvector extension
CREATE EXTENSION vector;
\q

# Run migrations
cd backend
alembic upgrade head
```

### 5. Build and Deploy with Docker

```bash
# Build images
docker-compose -f docker/docker-compose.yml build

# Start services
docker-compose -f docker/docker-compose.yml up -d

# Check status
docker-compose -f docker/docker-compose.yml ps
```

### 6. Nginx Configuration

Create Nginx configuration:

```nginx
# /etc/nginx/sites-available/razgazdayson
server {
    listen 80;
    server_name razgazdayson.ru www.razgazdayson.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name razgazdayson.ru www.razgazdayson.ru;

    ssl_certificate /etc/letsencrypt/live/razgazdayson.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/razgazdayson.ru/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    # Telegram WebApp
    location /app {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/razgazdayson /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Setup

```bash
sudo certbot --nginx -d razgazdayson.ru -d www.razgazdayson.ru
```

### 8. Systemd Services

Create systemd service for Docker Compose:

```ini
# /etc/systemd/system/razgazdayson.service
[Unit]
Description=Razgazdayson Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deploy/razgazdayson
ExecStart=/usr/local/bin/docker-compose -f docker/docker-compose.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker/docker-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable service:

```bash
sudo systemctl enable razgazdayson
sudo systemctl start razgazdayson
```

### 9. Telegram Bot Webhook

Set webhook for production:

```bash
curl -F "url=https://razgazdayson.ru/webhook" \
     -F "secret_token=your_webhook_secret" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'telegram-bot'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
```

### Grafana Dashboards

Import dashboards from `monitoring/grafana/` directory.

## Backup Strategy

### Database Backup

```bash
# Create backup script
#!/bin/bash
# /home/deploy/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

pg_dump -U razgazdayson razgazdayson | gzip > $BACKUP_DIR/razgazdayson_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab:

```bash
0 2 * * * /home/deploy/backup-db.sh
```

## Update Procedure

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Build new images:
   ```bash
   docker-compose -f docker/docker-compose.yml build
   ```

3. Run migrations:
   ```bash
   docker-compose -f docker/docker-compose.yml run backend alembic upgrade head
   ```

4. Restart services:
   ```bash
   docker-compose -f docker/docker-compose.yml down
   docker-compose -f docker/docker-compose.yml up -d
   ```

## Rollback Procedure

1. Checkout previous version:
   ```bash
   git checkout <previous-tag>
   ```

2. Rebuild and restart:
   ```bash
   docker-compose -f docker/docker-compose.yml build
   docker-compose -f docker/docker-compose.yml down
   docker-compose -f docker/docker-compose.yml up -d
   ```

3. Restore database if needed:
   ```bash
   gunzip < /home/deploy/backups/razgazdayson_YYYYMMDD_HHMMSS.sql.gz | psql -U razgazdayson razgazdayson
   ```

## Health Checks

- Backend: https://razgazdayson.ru/api/v1/health/ready
- Frontend: https://razgazdayson.ru/
- Telegram Bot: Check @BotFather for webhook status

## Troubleshooting

### Check logs:
```bash
# All services
docker-compose -f docker/docker-compose.yml logs

# Specific service
docker-compose -f docker/docker-compose.yml logs backend
```

### Common issues:

1. **Database connection failed**: Check PostgreSQL is running and credentials are correct
2. **Redis connection failed**: Check Redis is running
3. **Telegram webhook not working**: Verify SSL certificate and webhook URL
4. **High memory usage**: Adjust Docker memory limits in docker-compose.yml