# Quick Start Production Deployment

## Prerequisites

- Ubuntu 22.04 LTS server with at least 2GB RAM
- Domain razgazdayson.ru pointing to your server IP
- SSH access to the server

## Step-by-Step Deployment

### 1. Connect to your server

```bash
ssh user@your-server-ip
```

### 2. Clone the repository

```bash
git clone https://github.com/ArtAndrew/razgadayson.git
cd razgazdayson
```

### 3. Run the setup script

```bash
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

This script will:
- Install Docker, Docker Compose, Nginx, and other dependencies
- Setup firewall rules
- Generate secure secrets
- Create SSL certificates
- Configure systemd service

### 4. Configure environment variables

Edit the production environment files with your actual values:

```bash
# Backend configuration
nano backend/.env.production
# Add your OpenAI API key, Telegram bot token, etc.

# Frontend configuration  
nano frontend/.env.production

# Bot configuration
nano telegram-bot/.env.production
```

**Important values to set:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `SECRET_KEY` - Use the generated value from setup script
- `POSTGRES_PASSWORD` - Use the generated value from setup script
- `REDIS_PASSWORD` - Use the generated value from setup script

### 5. Build and deploy

```bash
# Build all services
make -f Makefile.production deploy

# Check health
make -f Makefile.production health
```

### 6. Set Telegram webhook

```bash
make -f Makefile.production set-webhook
# Enter your bot token and webhook secret when prompted
```

### 7. Verify deployment

- Open https://razgazdayson.ru in your browser
- Check API health: https://razgazdayson.ru/api/v1/health/ready
- Try the dream interpretation form
- Check Telegram bot

## Monitoring

### View logs
```bash
make -f Makefile.production logs
```

### Check status
```bash
make -f Makefile.production status
```

### Monitor resources
```bash
make -f Makefile.production monitor
```

## Maintenance

### Update application
```bash
git pull origin main
make -f Makefile.production update
```

### Backup database
```bash
make -f Makefile.production backup
```

### Renew SSL certificates
```bash
make -f Makefile.production ssl-renew
```

## Troubleshooting

### Service won't start
```bash
# Check logs
journalctl -u razgazdayson -n 100

# Check Docker logs
make -f Makefile.production logs
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose -f docker/docker-compose.production.yml ps postgres

# Test connection
make -f Makefile.production db-shell
```

### SSL certificate issues
```bash
# Renew manually
sudo certbot renew --nginx

# Check certificate
sudo certbot certificates
```

## Emergency Rollback

If something goes wrong:

```bash
# Stop services
make -f Makefile.production stop

# Rollback code
git checkout <previous-commit-hash>

# Restore database backup
make -f Makefile.production restore

# Start services
make -f Makefile.production deploy
```

## Support

For issues, check:
- Logs: `make -f Makefile.production logs`
- Health endpoint: https://razgazdayson.ru/api/v1/health/ready
- GitHub Issues: https://github.com/ArtAndrew/razgadayson/issues