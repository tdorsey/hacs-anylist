# HACS AnyList - Docker Compose Setup

🐳 **Docker Compose orchestration for HACS AnyList TypeScript conversion project**

This directory contains Docker Compose configuration files that provide container orchestration for both development and production environments as part of the TypeScript conversion project (related to [issue #1](../../issues/1)).

## 🚀 Quick Start

```bash
# Initialize environment
./scripts/docker-compose.sh init

# Start development environment
./scripts/docker-compose.sh dev

# Start production environment
./scripts/docker-compose.sh prod -d
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Main development configuration |
| `docker-compose.prod.yml` | Production overrides |
| `Dockerfile` | Production image build |
| `Dockerfile.dev` | Development image build |
| `.env.example` | Environment variables template |
| `.env.development` | Development-specific settings |
| `.env.production` | Production-specific settings |
| `.dockerignore` | Files excluded from Docker context |
| `scripts/docker-compose.sh` | Management script |
| `scripts/health-check.sh` | Health check utility |
| `scripts/init-db.sql` | Database initialization |
| `docs/DOCKER_COMPOSE.md` | Comprehensive documentation |

## 🏗 Architecture

The setup provides a complete microservices architecture:

- **HACS AnyList** - Main Node.js/TypeScript application
- **PostgreSQL** - Primary database for persistent data
- **Redis** - Caching and session storage
- **Development Tools** - Optional utilities container

## ⚙️ Configuration

### Environment Files

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit with your values:**
   ```bash
   nano .env
   ```

3. **Key settings to configure:**
   - Home Assistant connection details
   - AnyList integration settings
   - Database passwords
   - Security tokens

### Docker Compose Features

✅ **Docker Compose v3.8+ best practices**  
✅ **Development vs production environment patterns**  
✅ **Standard health checks and restart policies**  
✅ **Proven environment variable management**  
✅ **Security hardening for production**  
✅ **Comprehensive documentation and comments**  

## 🔧 Management

The included management script provides convenient commands:

```bash
# Development
./scripts/docker-compose.sh dev        # Start development
./scripts/docker-compose.sh logs       # View logs
./scripts/docker-compose.sh shell      # Open shell

# Production  
./scripts/docker-compose.sh prod -d    # Start production
./scripts/docker-compose.sh health     # Check health
./scripts/docker-compose.sh backup     # Backup database

# Maintenance
./scripts/docker-compose.sh stop       # Stop services
./scripts/docker-compose.sh clean      # Clean up everything
./scripts/docker-compose.sh build      # Rebuild images
```

## 📊 Services

| Service | Development Port | Production Port | Purpose |
|---------|------------------|-----------------|---------|
| hacs-anylist | 3000 | 80 | Main application |
| postgres | 5432 | Internal | Database |
| redis | 6379 | Internal | Cache/sessions |

## 🔒 Security Features

- Non-root users in all containers
- Read-only filesystems in production
- Security headers with Helmet
- Rate limiting and CORS protection
- Secret management via environment variables
- Network isolation between services

## 📈 Production Features

- Multi-stage optimized Docker builds
- Health checks for all services
- Automatic restart policies
- Resource limits and reservations
- Structured logging (JSON format)
- Database connection pooling
- Redis memory management

## 🔄 TypeScript Conversion Support

This Docker Compose setup is designed to support the ongoing TypeScript conversion:

- Node.js 18 Alpine base images
- TypeScript build pipeline ready
- Development hot reload support
- Testing framework integration
- Linting and formatting tools
- Source map support for debugging

## 📚 Documentation

For detailed documentation, see:
- [Complete Docker Compose Guide](docs/DOCKER_COMPOSE.md)
- [TypeScript Conversion Project](../../issues/1)

## 🤝 Contributing

This setup is part of the TypeScript conversion project. When contributing:

1. Test changes in both development and production modes
2. Update documentation for new features
3. Follow Docker and security best practices
4. Include health checks for new services
5. Maintain compatibility with CI/CD pipeline

## 🐛 Troubleshooting

Common issues and solutions:

- **Service won't start**: Check logs with `./scripts/docker-compose.sh logs [service]`
- **Database connection**: Verify PostgreSQL is running and credentials are correct
- **Port conflicts**: Check if ports 3000, 5432, or 6379 are already in use
- **Permission issues**: Ensure Docker daemon is running and user has permissions

For detailed troubleshooting, see the [full documentation](docs/DOCKER_COMPOSE.md).

---

**Part of the HACS AnyList TypeScript conversion project** • [Issue #1](../../issues/1)