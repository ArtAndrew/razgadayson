# Server Setup for razgazdayson.ru

## Quick Deploy Guide

### 1. Server Requirements
- Ubuntu 22.04 LTS
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ disk space
- Domain razgazdayson.ru configured with A record

### 2. Initial Setup

SSH into your server and run:

```bash
# Clone repository
git clone https://github.com/ArtAndrew/razgadayson.git
cd razgazdayson

# Run setup script
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

### 3. Configure Secrets

The setup script will generate secure secrets. Copy them to your .env files:

```bash
# Edit backend configuration
nano backend/.env.production

# Required values:
SECRET_KEY=<generated-secret>
POSTGRES_PASSWORD=<generated-password>
REDIS_PASSWORD=<generated-password>
OPENAI_API_KEY=<your-openai-key>
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_WEBHOOK_SECRET=<generated-secret>

# Edit frontend configuration  
nano frontend/.env.production

# Edit bot configuration
nano telegram-bot/.env.production
```

### 4. Deploy Application

```bash
# Build and start all services
make -f Makefile.production deploy

# Verify deployment
make -f Makefile.production health
```

### 5. Configure Telegram Webhook

```bash
# Set webhook
make -f Makefile.production set-webhook

# Enter your bot token and webhook secret when prompted
```

### 6. SSL Certificate

The setup script will automatically obtain SSL certificates via Let's Encrypt.
If you need to manually set up SSL:

```bash
sudo certbot --nginx -d razgazdayson.ru -d www.razgazdayson.ru
```

## Service Management

### Start/Stop Services
```bash
# Using systemd
sudo systemctl start razgazdayson
sudo systemctl stop razgazdayson
sudo systemctl restart razgazdayson

# Using make
make -f Makefile.production stop
make -f Makefile.production deploy
```

### View Logs
```bash
# All services
make -f Makefile.production logs

# Specific service
make -f Makefile.production logs-backend
make -f Makefile.production logs-frontend
make -f Makefile.production logs-bot
```

### Monitor Health
```bash
# Check status
make -f Makefile.production status

# Monitor resources
make -f Makefile.production monitor
```

## Backup & Restore

### Automated Backups
Backups run daily at 2 AM via cron:
```bash
# Manual backup
make -f Makefile.production backup

# List backups
ls -la ~/backups/
```

### Restore from Backup
```bash
make -f Makefile.production restore
# Select backup file when prompted
```

## Updates

### Update Application
```bash
# Pull latest code and redeploy
git pull origin main
make -f Makefile.production update
```

### Update SSL Certificates
Certificates auto-renew via cron, but you can manually renew:
```bash
make -f Makefile.production ssl-renew
```

## Troubleshooting

### Service Won't Start
```bash
# Check systemd logs
journalctl -u razgazdayson -n 100

# Check Docker logs
docker-compose -f docker/docker-compose.production.yml logs
```

### Database Issues
```bash
# Connect to database
make -f Makefile.production db-shell

# Check database status
docker-compose -f docker/docker-compose.production.yml ps postgres
```

### High Memory Usage
```bash
# Check resource usage
docker stats

# Restart services to free memory
make -f Makefile.production restart
```

### Network Issues
```bash
# Check firewall
sudo ufw status

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

## Security Checklist

- [x] Firewall configured (ports 22, 80, 443 only)
- [x] SSL certificates installed
- [x] Strong passwords generated
- [x] Database not exposed externally
- [x] Redis password protected
- [x] Rate limiting enabled
- [x] CORS configured for production domain
- [x] Security headers in Nginx

## Monitoring URLs

- Main site: https://razgazdayson.ru
- API health: https://razgazdayson.ru/api/v1/health/ready
- Telegram bot: @razgazdayson_bot

## Emergency Contacts

- Server issues: Check logs first
- API errors: Check Sentry dashboard
- Database issues: Check backup status
- SSL issues: Check certificate expiry

## File Locations

- Application: `/home/deploy/razgazdayson/`
- Logs: `~/logs/` and Docker logs
- Backups: `~/backups/`
- Nginx config: `/etc/nginx/sites-available/razgazdayson`
- SSL certs: `/etc/letsencrypt/live/razgazdayson.ru/`
- Systemd service: `/etc/systemd/system/razgazdayson.service`