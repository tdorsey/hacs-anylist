# Docker Configuration for HACS Anylist TypeScript Project

This directory contains Docker configuration files for the HACS Anylist TypeScript conversion project. The setup supports both development and production environments with security best practices and optimal performance.

## 🏗️ Architecture Overview

The Docker setup uses a multi-stage build approach with the following stages:

1. **Builder Stage**: Compiles TypeScript code and installs dependencies
2. **Production Stage**: Optimized runtime with minimal footprint
3. **Development Stage**: Full development environment with hot reload

## 📁 File Structure

```
├── Dockerfile                    # Multi-stage Dockerfile
├── docker-compose.yml           # Base Docker Compose configuration
├── docker-compose.override.yml  # Development overrides
├── docker-compose.prod.yml      # Production configuration
├── .dockerignore                # Docker build context optimization
├── .env.example                 # Environment variables template
└── docs/
    └── DOCKER.md                # This documentation
```

## 🚀 Quick Start

### Development Environment

1. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start Development Environment**
   ```bash
   # Start development services
   docker-compose --profile development up

   # Or use the npm script
   npm run docker:dev
   ```

3. **Access Services**
   - Application: http://localhost:3000
   - Debug Port: http://localhost:9229
   - Home Assistant: http://localhost:8123

### Production Environment

1. **Build Production Image**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. **Start Production Services**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d

   # Or use the npm script
   npm run docker:prod
   ```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

- `NODE_ENV`: Environment mode (development/production)
- `ANYLIST_EMAIL`: Your Anylist account email
- `ANYLIST_PASSWORD`: Your Anylist account password
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

### Docker Compose Profiles

The setup uses Docker Compose profiles to manage different service combinations:

- `development`: Development application and tools
- `production`: Production-optimized application
- `database`: Database services (PostgreSQL/Redis)
- `monitoring`: Prometheus and metrics collection
- `testing`: Integration testing with Home Assistant

### Build Targets

The Dockerfile defines three targets:

- `development`: Full development environment with dev dependencies
- `production`: Optimized runtime without dev dependencies
- `builder`: Intermediate build stage (used internally)

## 🛡️ Security Features

### Non-Root User

All containers run as non-root user `nextjs` (UID 1001) for security:

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
```

### Security Options

Production containers include additional security measures:

- `no-new-privileges`: Prevents privilege escalation
- `read-only`: Root filesystem is read-only
- Restricted capabilities with `cap_drop: ALL`
- Temporary filesystems for writable directories

### Secrets Management

Sensitive data should be provided via:

1. Environment variables (for development)
2. Docker secrets (for production)
3. External secret management systems

## 📊 Monitoring and Health Checks

### Health Checks

All services include health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "--version"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

### Logging

Production containers use structured logging:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Metrics

Prometheus metrics collection is available in production profile.

## 🔄 Development Workflow

### Hot Reload

Development environment supports hot reload:

```yaml
volumes:
  - .:/app:cached
  - /app/node_modules  # Prevent overwriting
command: ["npm", "run", "dev:watch"]
```

### Debugging

TypeScript debugging is available on port 9229:

```yaml
ports:
  - "9229:9229"  # Debug port
```

### Testing

Integration testing with Home Assistant:

```bash
docker-compose --profile testing up
```

## 🚀 Production Deployment

### Resource Limits

Production containers have resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '1.0'
      memory: 512M
```

### Restart Policies

Production services use appropriate restart policies:

```yaml
restart: always
deploy:
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
```

### Load Balancing

Nginx reverse proxy configuration is included for production load balancing.

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   netstat -tlnp | grep :3000
   
   # Modify ports in docker-compose.yml if needed
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Build Cache Issues**
   ```bash
   # Clear Docker build cache
   docker builder prune
   
   # Force rebuild
   docker-compose build --no-cache
   ```

### Logs

View container logs:

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs hacs-anylist-dev

# Follow logs
docker-compose logs -f
```

### Container Access

Access running containers:

```bash
# Execute shell in development container
docker-compose exec hacs-anylist-dev sh

# Run development tools
docker-compose exec dev-tools npm run lint
```

## 📝 Best Practices

### Image Optimization

- Multi-stage builds reduce final image size
- `.dockerignore` excludes unnecessary files
- Alpine Linux base for minimal footprint

### Development Experience

- Volume mounts for hot reload
- Separate development dependencies
- Debug port exposure

### Production Ready

- Security hardening with non-root user
- Resource limits and restart policies
- Health checks for reliability
- Structured logging

### Maintenance

- Regular base image updates
- Security scanning with tools like Trivy
- Dependency vulnerability scanning

## 🔗 Related Documentation

- [TypeScript Configuration](../tsconfig.json)
- [Package.json Scripts](../package.json)
- [Environment Variables](.env.example)
- [Home Assistant Integration](../README.md)

## 📞 Support

For Docker-related issues:

1. Check the troubleshooting section above
2. Review container logs
3. Verify environment variables
4. Ensure proper file permissions

For TypeScript conversion questions, see issue #1 in the repository.