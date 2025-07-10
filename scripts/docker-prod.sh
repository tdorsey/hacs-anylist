#!/bin/bash

# Docker Production Deployment Script for HACS Anylist TypeScript Project
# This script helps deploy the application in production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Validate production environment
validate_production_env() {
    print_info "Validating production environment..."
    
    # Check for required environment variables
    required_vars=(
        "ANYLIST_EMAIL"
        "ANYLIST_PASSWORD"
        "POSTGRES_PASSWORD"
        "JWT_SECRET"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables before deploying to production"
        exit 1
    fi
    
    print_success "Production environment validation passed"
}

# Build production image
build_production_image() {
    print_info "Building production Docker image..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build hacs-anylist-prod
    print_success "Production image built successfully"
}

# Deploy to production
deploy_production() {
    print_info "Deploying to production..."
    
    # Pull latest images
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
    
    # Start production services
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d
    
    print_success "Production deployment completed"
    
    print_info "Production services available at:"
    echo "  - Application: http://localhost:3001"
    echo "  - Monitoring: http://localhost:9090"
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check if containers are running
    if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Production services are running"
    else
        print_error "Some production services are not running"
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
        exit 1
    fi
    
    # Test application endpoint
    if command_exists curl; then
        if curl -f -s http://localhost:3001/health >/dev/null 2>&1; then
            print_success "Application health check passed"
        else
            print_warning "Application health check failed (endpoint may not be ready)"
        fi
    fi
}

# Show production logs
show_production_logs() {
    print_info "Showing production logs (press Ctrl+C to exit)..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production logs -f
}

# Stop production services
stop_production() {
    print_info "Stopping production services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production down
    print_success "Production services stopped"
}

# Backup production data
backup_production() {
    print_info "Creating production backup..."
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="./backups/$timestamp"
    mkdir -p "$backup_dir"
    
    # Backup database
    if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps postgres-prod | grep -q "Up"; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres-prod pg_dump -U anylist anylist > "$backup_dir/database.sql"
        print_success "Database backup created: $backup_dir/database.sql"
    fi
    
    # Backup application data
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T hacs-anylist-prod tar -czf - /app/data 2>/dev/null > "$backup_dir/app_data.tar.gz" || true
    
    print_success "Production backup completed: $backup_dir"
}

# Monitor production
monitor_production() {
    print_info "Production monitoring dashboard..."
    echo "Services status:"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production ps
    
    echo ""
    echo "Resource usage:"
    docker stats --no-stream $(docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production ps -q) 2>/dev/null || true
}

# Show help
show_help() {
    echo "HACS Anylist Docker Production Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy to production"
    echo "  build     - Build production Docker image"
    echo "  start     - Start production services"
    echo "  stop      - Stop production services"
    echo "  logs      - Show production logs"
    echo "  health    - Perform health check"
    echo "  backup    - Create production backup"
    echo "  monitor   - Show production monitoring"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Full production deployment"
    echo "  $0 health    # Check production health"
    echo "  $0 backup    # Create backup"
}

# Main script logic
main() {
    case "${1:-deploy}" in
        deploy)
            check_prerequisites
            validate_production_env
            build_production_image
            deploy_production
            health_check
            print_success "Production deployment complete!"
            ;;
        build)
            check_prerequisites
            build_production_image
            ;;
        start)
            check_prerequisites
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d
            print_success "Production services started"
            ;;
        stop)
            stop_production
            ;;
        logs)
            show_production_logs
            ;;
        health)
            health_check
            ;;
        backup)
            backup_production
            ;;
        monitor)
            monitor_production
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"