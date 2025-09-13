# Deployment Guide

## Overview

This guide covers deploying the Personal Finance Management System in various environments, from development to production. The system is designed for containerized deployment using Docker and Docker Compose.

## Deployment Options

### 1. Development Deployment

For local development and testing.

```bash
# Clone repository
git clone https://github.com/quocdaijr/personal-finance-management.git
cd personal-finance-management

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Verify deployment
./scripts/test-api-integration.sh
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Analytics API: http://localhost:8000
- Database: SQLite (local file)

### 2. Production Deployment

For production environments with PostgreSQL and optimized configurations.

```bash
# Set production environment variables
export POSTGRES_PASSWORD=secure_production_password
export JWT_SECRET=your_production_jwt_secret
export JWT_REFRESH_SECRET=your_production_refresh_secret

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Monitor services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

**Services:**
- Frontend: http://localhost:80 (nginx)
- Backend API: http://localhost:8080
- Analytics API: http://localhost:8000
- Database: PostgreSQL on port 5432

### 3. Cloud Deployment

#### AWS ECS Deployment

```yaml
# ecs-task-definition.json
{
  "family": "finance-management",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/finance-backend:latest",
      "portMappings": [{"containerPort": 8080}],
      "environment": [
        {"name": "DB_HOST", "value": "your-rds-endpoint"},
        {"name": "JWT_SECRET", "value": "your-secret"}
      ]
    }
  ]
}
```

#### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: finance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: finance-backend
  template:
    metadata:
      labels:
        app: finance-backend
    spec:
      containers:
      - name: backend
        image: finance-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: finance-secrets
              key: db-host
```

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
# Database Configuration
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=finance_user
DB_PASSWORD=secure_database_password
DB_NAME=finance_management
DB_SSLMODE=require
USE_SQLITE=false

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
JWT_EXPIRY_HOURS=24

# Application Configuration
APP_NAME=Finance Management
PORT=8080
ENVIRONMENT=production

# Analytics Configuration
ANALYTICS_PORT=8000

# Security Configuration
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### SSL/TLS Configuration

#### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /analytics/ {
        proxy_pass http://analytics:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Setup

### PostgreSQL Production Setup

#### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE finance_management;
CREATE USER finance_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE finance_management TO finance_user;
```

#### 2. Configure PostgreSQL

Edit `/etc/postgresql/13/main/postgresql.conf`:

```conf
# Connection settings
listen_addresses = 'localhost'
port = 5432
max_connections = 100

# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Logging
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Security
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
```

#### 3. Database Backup Strategy

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/finance-management"
DB_NAME="finance_management"
DB_USER="finance_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

## Monitoring and Logging

### Health Checks

```bash
#!/bin/bash
# health-check.sh

# Check backend health
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "Backend: OK"
else
    echo "Backend: FAILED"
fi

# Check analytics health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "Analytics: OK"
else
    echo "Analytics: FAILED"
fi

# Check database connection
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "Database: OK"
else
    echo "Database: FAILED"
fi
```

### Log Aggregation

#### Docker Logging Configuration

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=backend"

  analytics:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=analytics"
```

#### Centralized Logging with ELK Stack

```yaml
# elk-stack.yml
version: "3.8"
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## Security Considerations

### Network Security

```bash
# Firewall configuration (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Application Security

#### 1. Secrets Management

```bash
# Use Docker secrets for sensitive data
echo "your_jwt_secret" | docker secret create jwt_secret -
echo "your_db_password" | docker secret create db_password -
```

#### 2. Container Security

```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

# Read-only filesystem
docker run --read-only --tmpfs /tmp finance-backend
```

### SSL Certificate Management

#### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_transactions_user_date 
ON transactions(user_id, date DESC);

CREATE INDEX CONCURRENTLY idx_accounts_user_active 
ON accounts(user_id) WHERE is_active = true;

-- Analyze tables regularly
ANALYZE transactions;
ANALYZE accounts;
ANALYZE budgets;
```

### Application Optimization

#### Go Backend Optimization

```go
// Connection pooling
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute)

// Enable gzip compression
router.Use(gzip.Gzip(gzip.DefaultCompression))
```

#### Python Analytics Optimization

```python
# Use connection pooling
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0
)
```

## Scaling Strategies

### Horizontal Scaling

#### Load Balancer Configuration

```nginx
upstream backend_servers {
    server backend1:8080;
    server backend2:8080;
    server backend3:8080;
}

upstream analytics_servers {
    server analytics1:8000;
    server analytics2:8000;
}

server {
    location /api/ {
        proxy_pass http://backend_servers;
    }
    
    location /analytics/ {
        proxy_pass http://analytics_servers;
    }
}
```

### Database Scaling

#### Read Replicas

```yaml
# docker-compose.scale.yml
services:
  postgres-master:
    image: postgres:15-alpine
    environment:
      POSTGRES_REPLICATION_MODE: master
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: replicator_password

  postgres-slave:
    image: postgres:15-alpine
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: replicator_password
      POSTGRES_MASTER_HOST: postgres-master
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# comprehensive-backup.sh

# Database backup
pg_dump -h localhost -U finance_user finance_management | gzip > db_backup_$(date +%Y%m%d).sql.gz

# Application files backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /opt/finance-management

# Upload to S3 (optional)
aws s3 cp db_backup_$(date +%Y%m%d).sql.gz s3://your-backup-bucket/
aws s3 cp app_backup_$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### Recovery Procedures

```bash
#!/bin/bash
# disaster-recovery.sh

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
gunzip -c db_backup_20250113.sql.gz | psql -h localhost -U finance_user finance_management

# Restore application files
tar -xzf app_backup_20250113.tar.gz -C /

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## Maintenance

### Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Clean Docker system
docker system prune -f

# Vacuum database
psql -h localhost -U finance_user -d finance_management -c "VACUUM ANALYZE;"

# Rotate logs
logrotate /etc/logrotate.d/finance-management

# Check disk space
df -h

# Check service status
systemctl status docker
docker-compose -f docker-compose.prod.yml ps
```

### Monitoring Alerts

```bash
#!/bin/bash
# monitoring-alerts.sh

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "ALERT: Memory usage is ${MEMORY_USAGE}%"
fi

# Check service health
if ! curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "ALERT: Backend service is down"
fi
```

This deployment guide provides comprehensive instructions for deploying the Personal Finance Management System in various environments with proper security, monitoring, and maintenance procedures.
