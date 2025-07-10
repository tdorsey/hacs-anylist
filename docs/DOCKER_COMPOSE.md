# Docker Compose Setup for HACS AnyList

This directory contains Docker Compose configuration for the HACS AnyList TypeScript conversion project (related to issue #1). The setup provides both development and production environments with proper orchestration, health checks, and environment variable management.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Environment Management](#environment-management)
- [Services](#services)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+ 
- Docker Compose 2.0+
- Git

### Initial Setup

1. **Clone and navigate to the repository:**
   ```bash
   git clone <repository-url>
   cd hacs-anylist
   ```

2. **Initialize the environment:**
   ```bash
   ./scripts/docker-compose.sh init
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   nano .env
   ```

4. **Start development environment:**
   ```bash
   ./scripts/docker-compose.sh dev
   ```

5. **Access the application:**
   - Main application: http://localhost:3000
   - Redis: localhost:6379
   - PostgreSQL: localhost:5432

## 🏗 Architecture

The Docker Compose setup follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  HACS AnyList   │    │     Redis       │    │   PostgreSQL    │
│   (Node.js)     │◄──►│    (Cache)      │    │   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Home Assistant │
│   Integration   │
└─────────────────┘
```

### Service Overview

| Service | Purpose | Development Port | Production Port |
|---------|---------|------------------|-----------------|
| hacs-anylist | Main application server | 3000 | 80 |
| redis | Caching and session storage | 6379 | Internal only |
| postgres | Data persistence | 5432 | Internal only |
| dev-tools | Development utilities | N/A | N/A |

## ⚙️ Configuration

### Environment Files

The setup uses multiple environment files for configuration:

- **`.env.example`** - Template file with all available options
- **`.env`** - Your local configuration (create from example)
- **`.env.development`** - Development-specific overrides
- **`.env.production`** - Production-specific overrides

### Key Configuration Options

```bash
# Application settings
NODE_ENV=development
APP_PORT=3000
DEBUG=hacs-anylist:*

# Home Assistant integration
HASS_SERVER_HOST=127.0.0.1
HASS_SERVER_PORT=8123
HASS_TOKEN=your-token-here

# AnyList settings
ANYLIST_SERVER_ADDR=http://127.0.0.1:1234
ANYLIST_DEFAULT_LIST=Shopping

# Database settings
POSTGRES_DB=hacs_anylist
POSTGRES_USER=hacs_user
POSTGRES_PASSWORD=secure-password

# Redis settings
REDIS_PASSWORD=secure-redis-password
```

## 🔧 Environment Management

### Development Environment

Optimized for development with:
- Hot reload enabled
- Debug logging
- Relaxed security settings
- Volume mounts for source code
- Exposed database ports for debugging

```bash
# Start development environment
./scripts/docker-compose.sh dev

# Start in background
./scripts/docker-compose.sh dev -d

# View logs
./scripts/docker-compose.sh logs

# View specific service logs
./scripts/docker-compose.sh logs hacs-anylist
```

### Production Environment

Optimized for production with:
- Security hardening
- Performance optimizations
- Resource limits
- Health checks
- No exposed internal ports

```bash
# Start production environment
./scripts/docker-compose.sh prod

# Start in background
./scripts/docker-compose.sh prod -d
```

## 🐳 Services

### HACS AnyList (Main Application)

**Development Configuration:**
- Base image: `node:18-alpine`
- Hot reload enabled
- Source code mounted as volume
- Debug tools included
- Exposed ports: 3000, 9229 (debugger)

**Production Configuration:**
- Multi-stage build for optimization
- Non-root user for security
- Read-only filesystem
- Resource limits enforced
- Health checks enabled

**Health Check:**
```bash
curl -f http://localhost:3000/health
```

### Redis (Caching)

**Purpose:** Session storage, caching, and temporary data

**Configuration:**
- Persistent data storage
- Password protection
- Memory limits in production
- Automatic failover policies

**Connection:**
```bash
# Development
redis-cli -h localhost -p 6379 -a $REDIS_PASSWORD

# From container
./scripts/docker-compose.sh shell redis
redis-cli -a $REDIS_PASSWORD
```

### PostgreSQL (Database)

**Purpose:** Primary data storage for user data, lists, and items

**Features:**
- Automatic database initialization
- Performance tuning for production
- Regular health checks
- Data persistence via named volumes

**Connection:**
```bash
# Development
psql -h localhost -p 5432 -U hacs_user -d hacs_anylist

# From container
./scripts/docker-compose.sh shell postgres
psql -U hacs_user -d hacs_anylist
```

## 🔄 Development Workflow

### Daily Development

1. **Start the environment:**
   ```bash
   ./scripts/docker-compose.sh dev
   ```

2. **Make code changes** - Changes are automatically reflected due to volume mounts

3. **View logs:**
   ```bash
   ./scripts/docker-compose.sh logs hacs-anylist
   ```

4. **Run tests:**
   ```bash
   ./scripts/docker-compose.sh test
   ```

5. **Debug issues:**
   ```bash
   # Open shell in container
   ./scripts/docker-compose.sh shell hacs-anylist
   
   # Check service status
   ./scripts/docker-compose.sh status
   ```

### Building and Testing

```bash
# Build images
./scripts/docker-compose.sh build

# Build without cache
./scripts/docker-compose.sh build --no-cache

# Run tests
./scripts/docker-compose.sh test

# Check health status
./scripts/docker-compose.sh health
```

### Database Operations

```bash
# Backup database
./scripts/docker-compose.sh backup

# Restore from backup
./scripts/docker-compose.sh restore backup_20231201_120000.sql

# Access database directly
./scripts/docker-compose.sh shell postgres
psql -U hacs_user -d hacs_anylist
```

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Update `.env.production` with production values
- [ ] Set strong passwords for all services
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS termination (external)
- [ ] Configure monitoring and logging
- [ ] Test backup and restore procedures

### Deployment Steps

1. **Prepare production environment:**
   ```bash
   # Copy production environment template
   cp .env.production .env
   # Edit with production values
   nano .env
   ```

2. **Deploy:**
   ```bash
   # Start production environment
   ./scripts/docker-compose.sh prod -d
   
   # Verify deployment
   ./scripts/docker-compose.sh health
   ```

3. **Monitor logs:**
   ```bash
   ./scripts/docker-compose.sh logs
   ```

### Production Monitoring

```bash
# Check service status
./scripts/docker-compose.sh status

# View health status
./scripts/docker-compose.sh health

# Monitor resource usage
docker stats

# View logs
./scripts/docker-compose.sh logs
```

## 🔧 Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check logs for specific service
./scripts/docker-compose.sh logs [service-name]

# Check Docker daemon status
sudo systemctl status docker

# Check available resources
docker system df
```

#### Database Connection Issues

```bash
# Verify PostgreSQL is running
./scripts/docker-compose.sh shell postgres
pg_isready -U hacs_user

# Check connection from app
./scripts/docker-compose.sh shell hacs-anylist
npm run db:test  # (when available)
```

#### Redis Connection Issues

```bash
# Test Redis connectivity
./scripts/docker-compose.sh shell redis
redis-cli ping

# Check Redis logs
./scripts/docker-compose.sh logs redis
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# View detailed container info
docker inspect <container-name>

# Check disk space
docker system df
```

### Health Check Failures

All services include health checks. If a service fails health checks:

1. **Check service logs:**
   ```bash
   ./scripts/docker-compose.sh logs [service-name]
   ```

2. **Verify configuration:**
   ```bash
   # Check environment variables
   docker-compose config
   ```

3. **Test manually:**
   ```bash
   # Test application health endpoint
   curl -f http://localhost:3000/health
   
   # Test database connectivity
   ./scripts/docker-compose.sh shell postgres
   pg_isready -U hacs_user
   ```

### Clean Up and Reset

```bash
# Stop all services
./scripts/docker-compose.sh stop

# Clean up everything (removes data!)
./scripts/docker-compose.sh clean

# Start fresh
./scripts/docker-compose.sh init
./scripts/docker-compose.sh dev
```

## 📝 Best Practices

### Security

1. **Use strong passwords** for all services
2. **Don't expose internal ports** in production
3. **Use non-root users** in containers
4. **Enable read-only filesystems** where possible
5. **Regularly update base images**

### Performance

1. **Set appropriate resource limits**
2. **Use named volumes** for data persistence
3. **Enable health checks** for all services
4. **Monitor resource usage** regularly
5. **Use multi-stage builds** for production images

### Maintenance

1. **Regular backups** of database and configuration
2. **Monitor logs** for errors and performance issues
3. **Update images** and dependencies regularly
4. **Test backup and restore** procedures
5. **Document any customizations**

### Development

1. **Use volume mounts** for hot reload
2. **Enable debug logging** in development
3. **Use separate environments** for different stages
4. **Test with production-like data** when possible
5. **Keep development and production configs in sync**

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

## 🤝 Contributing

This Docker Compose setup is part of the TypeScript conversion project (issue #1). When contributing:

1. Test changes in both development and production modes
2. Update documentation for any new features
3. Follow the established naming conventions
4. Add health checks for new services
5. Include environment variable documentation

For questions or issues, please refer to the main project repository or open an issue.