# 🐳 Docker Setup for HACS Anylist TypeScript Project

This repository now includes comprehensive Docker configuration for both development and production environments, supporting the TypeScript conversion project.

## 📋 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose V2

### Development Setup

```bash
# 1. Setup environment
./scripts/docker-dev.sh setup

# 2. Start development services
./scripts/docker-dev.sh start

# 3. View logs
./scripts/docker-dev.sh logs
```

### Production Deployment

```bash
# 1. Set environment variables
export ANYLIST_EMAIL="your-email@example.com"
export ANYLIST_PASSWORD="your-password"
export POSTGRES_PASSWORD="secure-password"
export JWT_SECRET="your-jwt-secret"

# 2. Deploy to production
./scripts/docker-prod.sh deploy

# 3. Monitor services
./scripts/docker-prod.sh monitor
```

## 🏗️ Architecture

### Multi-Stage Dockerfile

- **Builder Stage**: TypeScript compilation and dependency installation
- **Production Stage**: Optimized runtime with minimal attack surface
- **Development Stage**: Full development environment with hot reload

### Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │   Production    │    │  Home Assistant │
│     Node.js     │    │     Node.js     │    │   Integration   │
│    Port 3000    │    │    Port 3001    │    │    Port 8123    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┬─────┴─────┬─────────────────┐
         │                 │           │                 │
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ PostgreSQL  │  │    Redis    │  │   Nginx     │  │ Prometheus  │
  │ Database    │  │   Cache     │  │   Proxy     │  │ Monitoring  │
  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build configuration |
| `docker-compose.yml` | Base service definitions |
| `docker-compose.override.yml` | Development overrides |
| `docker-compose.prod.yml` | Production optimizations |
| `.dockerignore` | Build context optimization |
| `.env.example` | Environment variable template |

## 🛡️ Security Features

### Non-Root User Configuration

All containers run as non-root user `nextjs` (UID 1001):

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
```

### Production Security Hardening

- Read-only root filesystem
- No new privileges policy
- Restricted Linux capabilities
- Resource limits and quotas
- Security context constraints

### Secrets Management

- Environment variables for development
- Docker secrets for production
- External secret management integration ready

## 📊 Monitoring & Observability

### Health Checks

All services include comprehensive health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "--version"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

### Logging Strategy

- Structured JSON logging in production
- Log rotation and retention policies
- Centralized log aggregation ready

### Metrics Collection

- Prometheus metrics endpoint
- Application performance monitoring
- Resource usage tracking

## 🚀 Deployment Profiles

### Development Profile

```bash
docker compose --profile development up
```

- Hot reload support
- Debug port exposure (9229)
- Development database
- Extended logging

### Production Profile

```bash
docker compose --profile production up
```

- Optimized runtime
- Security hardening
- Resource limits
- Health monitoring

### Testing Profile

```bash
docker compose --profile testing up
```

- Home Assistant integration
- Test database
- Integration test support

## 📝 Available Scripts

### Development Scripts

```bash
./scripts/docker-dev.sh setup     # Initial setup
./scripts/docker-dev.sh start     # Start development
./scripts/docker-dev.sh logs      # View logs
./scripts/docker-dev.sh stop      # Stop services
```

### Production Scripts

```bash
./scripts/docker-prod.sh deploy   # Full deployment
./scripts/docker-prod.sh health   # Health check
./scripts/docker-prod.sh backup   # Create backup
./scripts/docker-prod.sh monitor  # Monitor services
```

### Package.json Scripts

```json
{
  "docker:build": "docker build -t hacs-anylist .",
  "docker:dev": "docker compose --profile development up",
  "docker:prod": "docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up"
}
```

## 🔄 Development Workflow

### Hot Reload Development

1. Edit TypeScript files in `src/`
2. Changes automatically trigger rebuild
3. Application restarts with new code
4. Debug on port 9229

### Testing Integration

1. Start testing profile services
2. Home Assistant connects to TypeScript service
3. Test integration functionality
4. Monitor logs and metrics

## 🐛 Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check port usage
netstat -tlnp | grep :3000

# Modify ports in docker-compose.yml
```

**Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

**Build Cache Issues**
```bash
# Clear build cache
docker builder prune

# Force rebuild
docker compose build --no-cache
```

### Debug Commands

```bash
# View all services
docker compose ps

# View logs for specific service
docker compose logs hacs-anylist-dev

# Execute shell in container
docker compose exec hacs-anylist-dev sh

# Check resource usage
docker stats
```

## 📚 Documentation

- [Docker Configuration Details](docs/DOCKER.md)
- [TypeScript Configuration](tsconfig.json)
- [Environment Variables](.env.example)
- [Package Scripts](package.json)

## 🔗 Related Links

- [Issue #1: TypeScript Conversion](https://github.com/tdorsey/hacs-anylist/issues/1)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Home Assistant Development](https://developers.home-assistant.io/)

---

This Docker configuration provides a solid foundation for the TypeScript conversion project with security, performance, and maintainability in mind.