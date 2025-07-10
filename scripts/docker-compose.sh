#!/bin/bash
# Docker Compose management script for HACS AnyList
# This script provides convenient commands for managing the Docker Compose environment
# Related to TypeScript conversion issue: #1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="hacs-anylist"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print help
print_help() {
    echo "HACS AnyList Docker Compose Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev, development    Start development environment"
    echo "  prod, production    Start production environment"
    echo "  stop               Stop all services"
    echo "  restart            Restart all services"
    echo "  logs               Show logs for all services"
    echo "  logs [service]     Show logs for specific service"
    echo "  shell [service]    Open shell in service container"
    echo "  build              Build all images"
    echo "  clean              Stop and remove all containers, networks, and volumes"
    echo "  status             Show status of all services"
    echo "  health             Show health status of all services"
    echo "  backup             Backup database and data"
    echo "  restore [file]     Restore database from backup"
    echo "  init               Initialize environment (create .env, setup)"
    echo "  test               Run tests in containers"
    echo "  help               Show this help message"
    echo ""
    echo "Options:"
    echo "  -d, --detach       Run in detached mode"
    echo "  -f, --force        Force action without confirmation"
    echo "  --no-cache         Build without cache"
    echo ""
    echo "Examples:"
    echo "  $0 dev             # Start development environment"
    echo "  $0 prod -d         # Start production environment in background"
    echo "  $0 logs redis      # Show Redis logs"
    echo "  $0 shell hacs-anylist  # Open shell in main app container"
    echo "  $0 backup          # Backup database"
}

# Function to check if Docker and Docker Compose are available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_color $RED "Error: Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_color $RED "Error: Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

# Function to initialize environment
init_env() {
    print_color $BLUE "Initializing HACS AnyList environment..."
    
    # Create .env file if it doesn't exist
    if [[ ! -f .env ]]; then
        print_color $YELLOW "Creating .env file from template..."
        cp .env.example .env
        print_color $GREEN ".env file created. Please edit it with your actual values."
    else
        print_color $YELLOW ".env file already exists."
    fi
    
    # Create necessary directories
    mkdir -p logs config/local
    
    # Set permissions
    chmod 755 scripts/*.sh 2>/dev/null || true
    
    print_color $GREEN "Environment initialized successfully!"
    print_color $YELLOW "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Run '$0 dev' to start development environment"
}

# Function to start development environment
start_dev() {
    print_color $BLUE "Starting development environment..."
    
    local detach=""
    if [[ "$1" == "-d" ]] || [[ "$1" == "--detach" ]]; then
        detach="-d"
    fi
    
    docker-compose -f $COMPOSE_FILE up $detach
}

# Function to start production environment
start_prod() {
    print_color $BLUE "Starting production environment..."
    
    local detach=""
    if [[ "$1" == "-d" ]] || [[ "$1" == "--detach" ]]; then
        detach="-d"
    fi
    
    docker-compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE up $detach
}

# Function to stop services
stop_services() {
    print_color $BLUE "Stopping all services..."
    docker-compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE down
}

# Function to restart services
restart_services() {
    print_color $BLUE "Restarting services..."
    stop_services
    sleep 2
    start_dev
}

# Function to show logs
show_logs() {
    local service="$1"
    if [[ -n "$service" ]]; then
        print_color $BLUE "Showing logs for service: $service"
        docker-compose -f $COMPOSE_FILE logs -f "$service"
    else
        print_color $BLUE "Showing logs for all services..."
        docker-compose -f $COMPOSE_FILE logs -f
    fi
}

# Function to open shell in container
open_shell() {
    local service="${1:-hacs-anylist}"
    print_color $BLUE "Opening shell in $service container..."
    docker-compose -f $COMPOSE_FILE exec "$service" /bin/sh
}

# Function to build images
build_images() {
    print_color $BLUE "Building Docker images..."
    
    local no_cache=""
    if [[ "$1" == "--no-cache" ]]; then
        no_cache="--no-cache"
    fi
    
    docker-compose -f $COMPOSE_FILE build $no_cache
}

# Function to clean up everything
clean_up() {
    print_color $YELLOW "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_color $BLUE "Cleaning up Docker resources..."
        docker-compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE down -v --remove-orphans
        docker system prune -f
        print_color $GREEN "Cleanup completed!"
    else
        print_color $YELLOW "Cleanup cancelled."
    fi
}

# Function to show service status
show_status() {
    print_color $BLUE "Service status:"
    docker-compose -f $COMPOSE_FILE ps
}

# Function to show health status
show_health() {
    print_color $BLUE "Health status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "label=com.docker.compose.project=$PROJECT_NAME"
}

# Function to backup database
backup_database() {
    print_color $BLUE "Creating database backup..."
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U hacs_user hacs_anylist > "$backup_file"
    print_color $GREEN "Database backup created: $backup_file"
}

# Function to restore database
restore_database() {
    local backup_file="$1"
    if [[ -z "$backup_file" ]]; then
        print_color $RED "Error: Please specify backup file"
        exit 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        print_color $RED "Error: Backup file not found: $backup_file"
        exit 1
    fi
    
    print_color $BLUE "Restoring database from: $backup_file"
    docker-compose -f $COMPOSE_FILE exec -T postgres psql -U hacs_user hacs_anylist < "$backup_file"
    print_color $GREEN "Database restore completed!"
}

# Function to run tests
run_tests() {
    print_color $BLUE "Running tests..."
    docker-compose -f $COMPOSE_FILE exec hacs-anylist npm test
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "dev"|"development")
            start_dev "${2:-}"
            ;;
        "prod"|"production")
            start_prod "${2:-}"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            show_logs "$2"
            ;;
        "shell")
            open_shell "$2"
            ;;
        "build")
            build_images "$2"
            ;;
        "clean")
            clean_up
            ;;
        "status")
            show_status
            ;;
        "health")
            show_health
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database "$2"
            ;;
        "init")
            init_env
            ;;
        "test")
            run_tests
            ;;
        "help"|"--help"|"-h")
            print_help
            ;;
        *)
            print_color $RED "Unknown command: $1"
            print_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"